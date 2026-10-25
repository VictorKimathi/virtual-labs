import { ClipboardList, LogOut, ShieldAlert, UserX } from "lucide-react";
import { useCallback } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import {
  leaveClass,
  watchAssignments,
  watchClass,
  watchLearnerLink,
  watchOwnStudent,
  watchOwnSubmissions,
} from "../classroom.api";
import { subjectLabel } from "../classroom.format";
import type {
  Assignment,
  ClassRoom,
  LearnerLink,
  Student,
  Submission,
} from "../classroom.types";
import { useAction } from "../hooks/useAction";
import { useLiveData, type Subscribe } from "../hooks/useLiveData";
import { AuthScreen } from "./AuthScreen";
import { ClassGallery } from "./ClassGallery";
import { ActionFeedback, ErrorPanel, LoadingPanel } from "./StatusPanels";
import { StudentAssignmentCard } from "./StudentAssignmentCard";
import { StudentJoinForm } from "./StudentJoinForm";
import { StudentQuickLinks } from "./StudentQuickLinks";
import { card, secondaryButton, sectionTitle } from "./styles";

type Props = { uid: string; initialCode: string };

function LeaveButton({ uid }: { uid: string }) {
  const { tr } = useLanguage();
  const action = useAction("classroom-leave");
  return (
    <div>
      <button
        type="button"
        onClick={() => void action.run(() => leaveClass(uid))}
        disabled={action.pending}
        className={secondaryButton}
      >
        <LogOut className="size-4" aria-hidden="true" />
        {tr("Leave class on this device", "Ondoka darasani kwenye kifaa hiki")}
      </button>
      <ActionFeedback state={action.state} />
    </div>
  );
}

function ActiveClass({ uid, link }: { uid: string; link: LearnerLink }) {
  const { tr } = useLanguage();
  const classSource = useCallback<Subscribe<ClassRoom | null>>(
    (onData, onError) => watchClass(link.classId, onData, onError),
    [link.classId],
  );
  const assignmentSource = useCallback<Subscribe<Assignment[]>>(
    (onData, onError) => watchAssignments(link.classId, onData, onError),
    [link.classId],
  );
  const submissionSource = useCallback<Subscribe<Submission[]>>(
    (onData, onError) =>
      watchOwnSubmissions(link.classId, uid, onData, onError),
    [link.classId, uid],
  );
  const classRoom = useLiveData(classSource, "classroom-student-class");
  const assignments = useLiveData(
    assignmentSource,
    "classroom-student-assignments",
  );
  const submissions = useLiveData(
    submissionSource,
    "classroom-student-submissions",
  );

  for (const remote of [classRoom, assignments, submissions]) {
    if (remote.status === "error") return <ErrorPanel error={remote.error} />;
  }
  if (
    classRoom.status !== "ready" ||
    assignments.status !== "ready" ||
    submissions.status !== "ready"
  ) {
    return (
      <LoadingPanel
        label={tr("Loading your class…", "Inapakia darasa lako…")}
      />
    );
  }
  if (!classRoom.data) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={UserX}
          title={tr("This class no longer exists", "Darasa hili halipo tena")}
        />
        <LeaveButton uid={uid} />
      </div>
    );
  }
  const room = classRoom.data;
  const student = { uid, nickname: link.nickname };
  return (
    <div className="space-y-6">
      <section
        className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-kenya-green dark:text-green-400">
            {subjectLabel(room.subject, tr)}
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            {room.name}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {tr("Signed in as", "Umeingia kama")} {link.nickname}
          </p>
        </div>
        <LeaveButton uid={uid} />
      </section>

      <StudentQuickLinks />

      <section aria-labelledby="assignments-heading" className="space-y-4">
        <h2 id="assignments-heading" className={sectionTitle}>
          {tr("Assignments", "Kazi")}
        </h2>
        {assignments.data.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={tr(
              "No assignments yet. Explore the labs meanwhile.",
              "Bado hakuna kazi. Chunguza maabara wakati huu.",
            )}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {assignments.data.map((assignment) => {
              const submission =
                submissions.data.find(
                  (item) => item.assignmentId === assignment.id,
                ) ?? null;
              return (
                <StudentAssignmentCard
                  key={`${assignment.id}:${submission?.status ?? "new"}:${submission?.feedback ?? ""}`}
                  classRoom={room}
                  student={student}
                  assignment={assignment}
                  submission={submission}
                />
              );
            })}
          </div>
        )}
      </section>

      {room.sharing === "class" && (
        <section aria-labelledby="gallery-heading" className="space-y-4">
          <h2 id="gallery-heading" className={sectionTitle}>
            {tr("Class gallery", "Maonyesho ya darasa")}
          </h2>
          <ClassGallery classId={room.id} assignments={assignments.data} />
        </section>
      )}
    </div>
  );
}

function Membership({ uid, link, initialCode }: Props & { link: LearnerLink }) {
  const { tr } = useLanguage();
  const source = useCallback<Subscribe<Student | null>>(
    (onData, onError) => watchOwnStudent(link.classId, uid, onData, onError),
    [link.classId, uid],
  );
  const member = useLiveData(source, "classroom-membership");
  if (member.status === "loading") {
    return (
      <LoadingPanel
        label={tr("Loading your class…", "Inapakia darasa lako…")}
      />
    );
  }
  if (member.status === "error") return <ErrorPanel error={member.error} />;
  if (!member.data) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={UserX}
          title={tr(
            "Your teacher removed you from this class. Ask for the class code to join again.",
            "Mwalimu wako amekuondoa darasani. Omba msimbo wa darasa ili ujiunge tena.",
          )}
        />
        <StudentJoinForm initialCode={initialCode} />
      </div>
    );
  }
  if (member.data.status === "blocked") {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={ShieldAlert}
          title={tr(
            "Your access to this class is paused. Talk to your teacher.",
            "Ufikiaji wako wa darasa hili umesimamishwa. Ongea na mwalimu wako.",
          )}
        />
        <LeaveButton uid={uid} />
      </div>
    );
  }
  return <ActiveClass uid={uid} link={link} />;
}

export function StudentClassView({ uid, initialCode }: Props) {
  const { tr } = useLanguage();
  const source = useCallback<Subscribe<LearnerLink | null>>(
    (onData, onError) => watchLearnerLink(uid, onData, onError),
    [uid],
  );
  const link = useLiveData(source, "classroom-learner");
  if (link.status === "loading") {
    return (
      <LoadingPanel
        label={tr("Loading your class…", "Inapakia darasa lako…")}
      />
    );
  }
  if (link.status === "error") return <ErrorPanel error={link.error} />;
  if (!link.data) {
    return (
      <AuthScreen role="student">
        <StudentJoinForm initialCode={initialCode} />
      </AuthScreen>
    );
  }
  return (
    <Membership
      key={link.data.classId}
      uid={uid}
      link={link.data}
      initialCode={initialCode}
    />
  );
}
