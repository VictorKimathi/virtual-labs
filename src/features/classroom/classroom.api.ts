import { FirebaseError } from "firebase/app";
import { getAuth, signInAnonymously, signOut } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
} from "firebase/firestore";
import {
  AppError,
  toAppError,
  type AppErrorCode,
} from "../../shared/errors/appError";
import { getFirebaseApp } from "../../shared/firebase/firebase";
import {
  CODE_ALPHABET,
  CODE_LENGTH,
  parseAssignment,
  parseClassRoom,
  parseCodeTarget,
  parseLearnerLink,
  parseStudent,
  parseSubmission,
  parseTeacherCode,
} from "./classroom.schema";
import type {
  Assignment,
  ClassRoom,
  ClassSubject,
  LearnerLink,
  SharingMode,
  Student,
  StudentStatus,
  Submission,
} from "./classroom.types";

export type Unsubscribe = () => void;
export type OnData<T> = (data: T) => void;
export type OnError = (error: AppError) => void;

const FIREBASE_ERROR_CODES: Record<string, AppErrorCode> = {
  "permission-denied": "forbidden",
  unavailable: "network",
  "deadline-exceeded": "network",
  "not-found": "not-found",
  "resource-exhausted": "rate-limited",
  "auth/network-request-failed": "network",
  "auth/popup-closed-by-user": "sign-in",
  "auth/cancelled-popup-request": "sign-in",
  "auth/popup-blocked": "sign-in",
  "auth/user-cancelled": "sign-in",
};

function normalise(cause: unknown): AppError {
  if (cause instanceof FirebaseError) {
    return new AppError(
      FIREBASE_ERROR_CODES[cause.code] ?? "unknown",
      `Classroom request failed (${cause.code})`,
      { cause },
    );
  }
  return toAppError(cause);
}

async function attempt<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (cause) {
    throw normalise(cause);
  }
}

const db = () => getFirestore(getFirebaseApp());
const auth = () => getAuth(getFirebaseApp());

function generateCode() {
  const values = crypto.getRandomValues(new Uint32Array(CODE_LENGTH));
  return Array.from(
    values,
    (value) => CODE_ALPHABET[value % CODE_ALPHABET.length],
  ).join("");
}

// Codes are document ids, and the rules refuse to overwrite an existing one,
// so a collision fails the batch; a fresh code almost always succeeds.
async function withFreshCodes(write: (codes: string[]) => Promise<void>) {
  for (let tries = 0; ; tries += 1) {
    try {
      return await write([generateCode(), generateCode()]);
    } catch (cause) {
      const denied =
        cause instanceof FirebaseError && cause.code === "permission-denied";
      if (!denied || tries >= 2) throw normalise(cause);
    }
  }
}

function snapshotData(snapshot: DocumentSnapshot) {
  return snapshot.data({ serverTimestamps: "estimate" });
}

function watchDoc<T>(
  start: () => DocumentReference,
  parse: (id: string, data: unknown) => T,
  onData: OnData<T | null>,
  onError: OnError,
): Unsubscribe {
  try {
    return onSnapshot(
      start(),
      (snapshot) => {
        try {
          onData(
            snapshot.exists()
              ? parse(snapshot.id, snapshotData(snapshot))
              : null,
          );
        } catch (cause) {
          onError(normalise(cause));
        }
      },
      (cause) => onError(normalise(cause)),
    );
  } catch (cause) {
    onError(normalise(cause));
    return () => undefined;
  }
}

function watchList<T>(
  start: () => Query,
  parse: (id: string, data: unknown) => T,
  onData: OnData<T[]>,
  onError: OnError,
): Unsubscribe {
  try {
    return onSnapshot(
      start(),
      (snapshot) => {
        try {
          onData(
            snapshot.docs.map((item) => parse(item.id, snapshotData(item))),
          );
        } catch (cause) {
          onError(normalise(cause));
        }
      },
      (cause) => onError(normalise(cause)),
    );
  } catch (cause) {
    onError(normalise(cause));
    return () => undefined;
  }
}

const classRef = (classId: string) => doc(db(), "classes", classId);
const codeRef = (code: string) => doc(db(), "classCodes", code);
const secretRef = (classId: string) => doc(db(), "classSecrets", classId);
const learnerRef = (uid: string) => doc(db(), "learners", uid);
const studentRef = (classId: string, uid: string) =>
  doc(db(), "classes", classId, "students", uid);
const teacherJoinRef = (classId: string, uid: string) =>
  doc(db(), "classes", classId, "teacherJoins", uid);
const assignments = (classId: string) =>
  collection(db(), "classes", classId, "assignments");
const submissions = (classId: string) =>
  collection(db(), "classes", classId, "submissions");

async function lookupCode(code: string, kind: "student" | "teacher") {
  const snapshot = await attempt(() => getDoc(codeRef(code)));
  const target = snapshot.exists()
    ? parseCodeTarget(snapshot.id, snapshot.data())
    : null;
  if (!target || target.kind !== kind) {
    throw new AppError("not-found", `No ${kind} class code ${code}`);
  }
  return target.classId;
}

// Accounts

/** Students get an anonymous account: no email, only the nickname they choose. */
export async function signInStudent(): Promise<string> {
  const current = auth().currentUser;
  if (current) return current.uid;
  const credential = await attempt(() => signInAnonymously(auth()));
  return credential.user.uid;
}

export async function signOutUser() {
  await attempt(() => signOut(auth()));
}

// Teachers: classes

export function watchTeacherClasses(
  uid: string,
  onData: OnData<ClassRoom[]>,
  onError: OnError,
) {
  return watchList(
    () =>
      query(
        collection(db(), "classes"),
        where("teacherIds", "array-contains", uid),
      ),
    parseClassRoom,
    (classes) => onData(classes.sort((a, b) => b.createdAt - a.createdAt)),
    onError,
  );
}

export function watchClass(
  classId: string,
  onData: OnData<ClassRoom | null>,
  onError: OnError,
) {
  return watchDoc(() => classRef(classId), parseClassRoom, onData, onError);
}

export function watchTeacherCode(
  classId: string,
  onData: OnData<string | null>,
  onError: OnError,
) {
  return watchDoc(() => secretRef(classId), parseTeacherCode, onData, onError);
}

export async function createClass(
  input: { name: string; subject: ClassSubject },
  teacher: { uid: string; name: string },
): Promise<string> {
  const ref = doc(collection(db(), "classes"));
  await withFreshCodes(async ([joinCode, teacherCode]) => {
    const batch = writeBatch(db());
    batch.set(ref, {
      name: input.name,
      subject: input.subject,
      ownerId: teacher.uid,
      teacherIds: [teacher.uid],
      teacherNames: { [teacher.uid]: teacher.name },
      joinCode,
      joinOpen: true,
      sharing: "private",
      createdAt: serverTimestamp(),
    });
    batch.set(codeRef(joinCode), { classId: ref.id, kind: "student" });
    batch.set(codeRef(teacherCode), { classId: ref.id, kind: "teacher" });
    batch.set(secretRef(ref.id), { teacherCode });
    await batch.commit();
  });
  return ref.id;
}

export async function joinAsCoTeacher(
  code: string,
  teacher: { uid: string; name: string },
): Promise<string> {
  const classId = await lookupCode(code, "teacher");
  const batch = writeBatch(db());
  batch.set(teacherJoinRef(classId, teacher.uid), { code });
  batch.update(classRef(classId), {
    teacherIds: arrayUnion(teacher.uid),
    [`teacherNames.${teacher.uid}`]: teacher.name,
  });
  await attempt(() => batch.commit());
  return classId;
}

/** The owner removes a co-teacher, or a co-teacher leaves. */
export async function removeTeacher(classId: string, uid: string) {
  const batch = writeBatch(db());
  batch.update(classRef(classId), {
    teacherIds: arrayRemove(uid),
    [`teacherNames.${uid}`]: deleteField(),
  });
  batch.delete(teacherJoinRef(classId, uid));
  await attempt(() => batch.commit());
}

export async function updateClassSettings(
  classId: string,
  patch: Partial<{ name: string; joinOpen: boolean; sharing: SharingMode }>,
) {
  await attempt(() => updateDoc(classRef(classId), patch));
}

/** Issues a new student code; the old one stops working at once. */
export async function rotateJoinCode(classRoom: ClassRoom) {
  await withFreshCodes(async ([joinCode]) => {
    const batch = writeBatch(db());
    batch.set(codeRef(joinCode), { classId: classRoom.id, kind: "student" });
    batch.delete(codeRef(classRoom.joinCode));
    batch.update(classRef(classRoom.id), { joinCode });
    await batch.commit();
  });
}

export async function rotateTeacherCode(classId: string, oldCode: string) {
  await withFreshCodes(async ([teacherCode]) => {
    const batch = writeBatch(db());
    batch.set(codeRef(teacherCode), { classId, kind: "teacher" });
    batch.delete(codeRef(oldCode));
    batch.set(secretRef(classId), { teacherCode });
    await batch.commit();
  });
}

// Teachers: roster

export function watchStudents(
  classId: string,
  onData: OnData<Student[]>,
  onError: OnError,
) {
  return watchList(
    () => collection(db(), "classes", classId, "students"),
    parseStudent,
    (students) =>
      onData(students.sort((a, b) => a.nickname.localeCompare(b.nickname))),
    onError,
  );
}

export async function setStudentStatus(
  classId: string,
  studentId: string,
  status: StudentStatus,
) {
  await attempt(() => updateDoc(studentRef(classId, studentId), { status }));
}

/** Removing a student lets them rejoin with the current code. */
export async function removeStudent(classId: string, studentId: string) {
  await attempt(() => deleteDoc(studentRef(classId, studentId)));
}

// Assignments

export function watchAssignments(
  classId: string,
  onData: OnData<Assignment[]>,
  onError: OnError,
) {
  return watchList(
    () => query(assignments(classId), orderBy("createdAt", "desc")),
    parseAssignment,
    onData,
    onError,
  );
}

export async function createAssignments(
  classId: string,
  uid: string,
  items: { title: string; instructions: string; activityId: string | null }[],
) {
  const batch = writeBatch(db());
  for (const item of items) {
    batch.set(doc(assignments(classId)), {
      ...item,
      createdBy: uid,
      createdAt: serverTimestamp(),
    });
  }
  await attempt(() => batch.commit());
}

export async function deleteAssignment(classId: string, assignmentId: string) {
  await attempt(() => deleteDoc(doc(assignments(classId), assignmentId)));
}

// Submissions

export function watchClassSubmissions(
  classId: string,
  onData: OnData<Submission[]>,
  onError: OnError,
) {
  return watchList(
    () => submissions(classId),
    parseSubmission,
    (items) => onData(items.sort((a, b) => b.updatedAt - a.updatedAt)),
    onError,
  );
}

export function watchOwnSubmissions(
  classId: string,
  uid: string,
  onData: OnData<Submission[]>,
  onError: OnError,
) {
  return watchList(
    () => query(submissions(classId), where("studentId", "==", uid)),
    parseSubmission,
    onData,
    onError,
  );
}

export function watchSharedSubmissions(
  classId: string,
  onData: OnData<Submission[]>,
  onError: OnError,
) {
  return watchList(
    () => query(submissions(classId), where("shared", "==", true)),
    parseSubmission,
    (items) => onData(items.sort((a, b) => b.updatedAt - a.updatedAt)),
    onError,
  );
}

export async function reviewSubmission(
  classId: string,
  submissionId: string,
  review: { feedback: string; status: "reviewed" | "draft"; reviewer: string },
) {
  await attempt(() =>
    updateDoc(doc(submissions(classId), submissionId), {
      feedback: review.feedback === "" ? null : review.feedback,
      status: review.status,
      reviewedBy: review.reviewer,
      reviewedAt: serverTimestamp(),
    }),
  );
}

/** Moderation: a teacher takes shared work out of the class gallery. */
export async function hideSubmission(classId: string, submissionId: string) {
  await attempt(() =>
    updateDoc(doc(submissions(classId), submissionId), { shared: false }),
  );
}

// Students

export function watchLearnerLink(
  uid: string,
  onData: OnData<LearnerLink | null>,
  onError: OnError,
) {
  return watchDoc(() => learnerRef(uid), parseLearnerLink, onData, onError);
}

export function watchOwnStudent(
  classId: string,
  uid: string,
  onData: OnData<Student | null>,
  onError: OnError,
) {
  return watchDoc(
    () => studentRef(classId, uid),
    parseStudent,
    onData,
    onError,
  );
}

export async function joinClass(
  input: { code: string; nickname: string },
  uid: string,
) {
  const classId = await lookupCode(input.code, "student");
  const existing = await attempt(() => getDoc(studentRef(classId, uid)));
  const member = existing.exists()
    ? parseStudent(existing.id, existing.data())
    : null;
  if (member?.status === "blocked") {
    throw new AppError("forbidden", "Student is blocked from this class");
  }
  const batch = writeBatch(db());
  if (!member) {
    batch.set(studentRef(classId, uid), {
      nickname: input.nickname,
      code: input.code,
      status: "active",
      joinedAt: serverTimestamp(),
    });
  }
  batch.set(learnerRef(uid), {
    classId,
    nickname: member?.nickname ?? input.nickname,
  });
  await attempt(() => batch.commit());
}

/** Forgets the class on this device; the teacher still sees the student. */
export async function leaveClass(uid: string) {
  await attempt(() => deleteDoc(learnerRef(uid)));
}

export async function saveSubmission(
  classId: string,
  student: { uid: string; nickname: string },
  assignmentId: string,
  work: { answer: string; status: "draft" | "submitted"; shared: boolean },
  existing: Submission | null,
) {
  const ref = doc(submissions(classId), `${assignmentId}_${student.uid}`);
  await attempt(() =>
    existing
      ? updateDoc(ref, { ...work, updatedAt: serverTimestamp() })
      : setDoc(ref, {
          ...work,
          studentId: student.uid,
          assignmentId,
          nickname: student.nickname,
          feedback: null,
          updatedAt: serverTimestamp(),
        }),
  );
}
