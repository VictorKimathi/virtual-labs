import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Settings,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import {
  createAssignments,
  watchAssignments,
  watchClass,
  watchClassSubmissions,
  watchStudents,
} from "../classroom.api";
import { formatCode, subjectLabel } from "../classroom.format";
import type {
  Assignment,
  ClassRoom,
  Lesson,
  Student,
  Submission,
} from "../classroom.types";
import { findActivity } from "../data/activities";
import { useAction } from "../hooks/useAction";
import { useLiveData, type Subscribe } from "../hooks/useLiveData";
import { AssignmentForm } from "./AssignmentForm";
import { AssignmentList } from "./AssignmentList";
import { ClassSettingsPanel } from "./ClassSettingsPanel";
import { LessonLibrary } from "./LessonLibrary";
import { RosterPanel } from "./RosterPanel";
import { ActionFeedback, ErrorPanel, LoadingPanel } from "./StatusPanels";
import { StudentWorkPanel } from "./StudentWorkPanel";
import { card, secondaryButton } from "./styles";

type Tab = "students" | "assignments" | "resources" | "settings";

type Props = { classId: string; teacher: { uid: string; name: string } };

function BackLink() {
  const { tr } = useLanguage();
  return (
    <Link to="/teacher" className={secondaryButton}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      {tr("All classes", "Madarasa yote")}
    </Link>
  );
}

function ClassWorkspace({
  classRoom,
  students,
  assignments,
  submissions,
  teacher,
}: {
  classRoom: ClassRoom;
  students: Student[];
  assignments: Assignment[];
  submissions: Submission[];
  teacher: Props["teacher"];
}) {
  const { language, tr } = useLanguage();
  const [tab, setTab] = useState<Tab>("students");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const assignLesson = useAction("classroom-assign-lesson");
  const toReview = submissions.filter(
    (item) => item.status === "submitted",
  ).length;
  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    {
      id: "students",
      label: tr("Students & work", "Wanafunzi na kazi"),
      icon: Users,
    },
    {
      id: "assignments",
      label: tr("Assignments", "Kazi"),
      icon: ClipboardList,
    },
    { id: "resources", label: tr("Lessons", "Masomo"), icon: BookOpen },
    { id: "settings", label: tr("Settings", "Mipangilio"), icon: Settings },
  ];
  const onAssignLesson = (lesson: Lesson) =>
    void assignLesson.run(() =>
      createAssignments(
        classRoom.id,
        teacher.uid,
        lesson.activityIds.flatMap((id) => {
          const activity = findActivity(id);
          return activity
            ? [
                {
                  title: `${lesson.title[language]}: ${activity.title[language]}`,
                  instructions: activity.summary[language],
                  activityId: activity.id,
                },
              ]
            : [];
        }),
      ),
    );

  return (
    <div className="space-y-6">
      <BackLink />
      <header
        className={`${card} flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between`}
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-kenya-green dark:text-green-400">
            {subjectLabel(classRoom.subject, tr)}
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            {classRoom.name}
          </h1>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-center">
          {[
            {
              term: tr("Students", "Wanafunzi"),
              value: String(students.length),
            },
            { term: tr("To review", "Za kukagua"), value: String(toReview) },
            {
              term: tr("Class code", "Msimbo"),
              value: formatCode(classRoom.joinCode),
            },
          ].map(({ term, value }) => (
            <div key={term}>
              <dt className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {term}
              </dt>
              <dd className="mt-1 font-mono text-lg font-black">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div
        role="tablist"
        aria-label={tr("Class sections", "Sehemu za darasa")}
        className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${tab === id ? "bg-kenya-green text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "students" && (
          <div className="grid gap-5 xl:grid-cols-2">
            <RosterPanel
              classId={classRoom.id}
              students={students}
              assignments={assignments}
              submissions={submissions}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <StudentWorkPanel
              classId={classRoom.id}
              student={students.find((student) => student.id === selectedId)}
              assignments={assignments}
              submissions={submissions}
              reviewer={teacher.uid}
            />
          </div>
        )}
        {tab === "assignments" && (
          <div className="grid gap-5 xl:grid-cols-2">
            <AssignmentForm
              classId={classRoom.id}
              subject={classRoom.subject}
              uid={teacher.uid}
            />
            <AssignmentList
              classId={classRoom.id}
              assignments={assignments}
              students={students}
              submissions={submissions}
            />
          </div>
        )}
        {tab === "resources" && (
          <div className="space-y-4">
            <ActionFeedback
              state={assignLesson.state}
              success={tr(
                "Lesson assigned. Its experiments are in Assignments.",
                "Somo limetolewa. Majaribio yake yako kwenye Kazi.",
              )}
            />
            <LessonLibrary
              subject={classRoom.subject}
              onAssign={onAssignLesson}
              assigning={assignLesson.pending}
            />
          </div>
        )}
        {tab === "settings" && (
          <ClassSettingsPanel classRoom={classRoom} uid={teacher.uid} />
        )}
      </div>
    </div>
  );
}

export function TeacherClassView({ classId, teacher }: Props) {
  const { tr } = useLanguage();
  const classSource = useCallback<Subscribe<ClassRoom | null>>(
    (onData, onError) => watchClass(classId, onData, onError),
    [classId],
  );
  const studentSource = useCallback<Subscribe<Student[]>>(
    (onData, onError) => watchStudents(classId, onData, onError),
    [classId],
  );
  const assignmentSource = useCallback<Subscribe<Assignment[]>>(
    (onData, onError) => watchAssignments(classId, onData, onError),
    [classId],
  );
  const submissionSource = useCallback<Subscribe<Submission[]>>(
    (onData, onError) => watchClassSubmissions(classId, onData, onError),
    [classId],
  );
  const classRoom = useLiveData(classSource, "classroom-class");
  const students = useLiveData(studentSource, "classroom-students");
  const assignments = useLiveData(assignmentSource, "classroom-assignments");
  const submissions = useLiveData(submissionSource, "classroom-submissions");

  for (const remote of [classRoom, students, assignments, submissions]) {
    if (remote.status === "error") {
      return (
        <div className="space-y-4">
          <BackLink />
          <ErrorPanel error={remote.error} />
        </div>
      );
    }
  }
  if (
    classRoom.status !== "ready" ||
    students.status !== "ready" ||
    assignments.status !== "ready" ||
    submissions.status !== "ready"
  ) {
    return <LoadingPanel label={tr("Loading class…", "Inapakia darasa…")} />;
  }
  if (!classRoom.data || !classRoom.data.teacherIds.includes(teacher.uid)) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          icon={Users}
          title={tr("Class not found", "Darasa halikupatikana")}
        />
      </div>
    );
  }
  return (
    <ClassWorkspace
      classRoom={classRoom.data}
      students={students.data}
      assignments={assignments.data}
      submissions={submissions.data}
      teacher={teacher}
    />
  );
}
