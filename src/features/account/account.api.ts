import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  AppError,
  toAppError,
  type AppErrorCode,
} from "../../shared/errors/appError";
import { getFirebaseApp } from "../../shared/firebase/firebase";
import { parseProfile } from "./account.schema";
import type {
  Account,
  AccountRole,
  LoginForm,
  Profile,
  SignupForm,
} from "./account.types";

const ERROR_CODES: Record<string, AppErrorCode> = {
  "auth/invalid-credential": "credentials",
  "auth/wrong-password": "credentials",
  "auth/user-not-found": "credentials",
  "auth/invalid-email": "credentials",
  "auth/email-already-in-use": "account-exists",
  "auth/weak-password": "weak-password",
  "auth/too-many-requests": "too-many-attempts",
  "auth/network-request-failed": "network",
  "auth/popup-closed-by-user": "sign-in",
  "auth/cancelled-popup-request": "sign-in",
  "auth/popup-blocked": "sign-in",
  "permission-denied": "forbidden",
  unavailable: "network",
};

function normalise(cause: unknown): AppError {
  if (cause instanceof FirebaseError)
    return new AppError(
      ERROR_CODES[cause.code] ?? "unknown",
      `Account request failed (${cause.code})`,
      { cause },
    );
  return toAppError(cause);
}

async function attempt<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (cause) {
    throw normalise(cause);
  }
}

const auth = () => getAuth(getFirebaseApp());
const db = () => getFirestore(getFirebaseApp());
const profileRef = (uid: string) => doc(db(), "users", uid);

/** Follows the signed-in person and their profile. */
export function watchAccount(
  onData: (account: Account | null) => void,
  onError: (error: AppError) => void,
) {
  let stopProfile: (() => void) | null = null;
  const stop = () => {
    stopProfile?.();
    stopProfile = null;
  };
  try {
    const stopAuth = onAuthStateChanged(
      auth(),
      (user) => {
        stop();
        if (!user) return onData(null);
        const base = {
          uid: user.uid,
          anonymous: user.isAnonymous,
          name: user.displayName,
          email: user.email,
        };
        if (user.isAnonymous) return onData({ ...base, profile: null });
        stopProfile = onSnapshot(
          profileRef(user.uid),
          (snapshot) => {
            try {
              onData({
                ...base,
                profile: snapshot.exists()
                  ? parseProfile(snapshot.data())
                  : null,
              });
            } catch (cause) {
              onError(normalise(cause));
            }
          },
          (cause) => onError(normalise(cause)),
        );
      },
      (cause) => onError(normalise(cause)),
    );
    return () => {
      stop();
      stopAuth();
    };
  } catch (cause) {
    onError(normalise(cause));
    return () => undefined;
  }
}

async function readProfile(uid: string): Promise<Profile | null> {
  const snapshot = await attempt(() => getDoc(profileRef(uid)));
  return snapshot.exists() ? parseProfile(snapshot.data()) : null;
}

/** Gives a new account its role. An account keeps the role it was first given. */
async function claimRole(
  user: User,
  role: AccountRole,
  name: string,
): Promise<AccountRole> {
  const existing = await readProfile(user.uid);
  if (existing) return existing.role;
  await attempt(() =>
    setDoc(profileRef(user.uid), {
      role,
      name: name.slice(0, 60) || "Learner",
      createdAt: serverTimestamp(),
    }),
  );
  return role;
}

/** Educators must have an educator account; anyone else is signed out again. */
async function checkRole(
  role: AccountRole,
  wanted: AccountRole,
): Promise<AccountRole> {
  if (wanted === "teacher" && role !== "teacher") {
    await attempt(() => signOut(auth()));
    throw new AppError("wrong-role", `Account is a ${role} account`);
  }
  return role;
}

export async function signInWithGoogle(
  role: AccountRole,
): Promise<AccountRole> {
  const credential = await attempt(() =>
    signInWithPopup(auth(), new GoogleAuthProvider()),
  );
  const actual = await claimRole(
    credential.user,
    role,
    credential.user.displayName ?? "",
  );
  return checkRole(actual, role);
}

export async function signInWithEmail(
  form: LoginForm,
  role: AccountRole,
): Promise<AccountRole> {
  const credential = await attempt(() =>
    signInWithEmailAndPassword(auth(), form.email, form.password),
  );
  const actual = await claimRole(
    credential.user,
    role,
    credential.user.displayName ?? "",
  );
  return checkRole(actual, role);
}

export async function signUpWithEmail(form: SignupForm): Promise<AccountRole> {
  const credential = await attempt(() =>
    createUserWithEmailAndPassword(auth(), form.email, form.password),
  );
  await attempt(() =>
    updateProfile(credential.user, { displayName: form.name }),
  );
  return claimRole(credential.user, form.role, form.name);
}

export async function sendPasswordReset(email: string) {
  await attempt(() => sendPasswordResetEmail(auth(), email));
}

export async function signOutAccount() {
  await attempt(() => signOut(auth()));
}
