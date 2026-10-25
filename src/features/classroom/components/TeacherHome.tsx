import { BookOpen, LogOut, School } from "lucide-react";
import { useCallback } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { signOutUser, watchTeacherClasses } from "../classroom.api";
import type { ClassRoom } from "../classroom.types";
import { useAction } from "../hooks/useAction";
import { useLiveData, type Subscribe } from "../hooks/useLiveData";
import { ClassCard } from "./ClassCard";
import { CoTeacherJoinForm } from "./CoTeacherJoinForm";
import { CreateClassForm } from "./CreateClassForm";
import { LessonLibrary } from "./LessonLibrary";
import { ActionFeedback, ErrorPanel, LoadingPanel } from "./StatusPanels";
import { secondaryButton, sectionTitle } from "./styles";

export function TeacherHome({
  teacher,
}: {
  teacher: { uid: string; name: string };
}) {
  const { tr } = useLanguage();
  const signOut = useAction("classroom-sign-out");
  const source = useCallback<Subscribe<ClassRoom[]>>(
    (onData, onError) => watchTeacherClasses(teacher.uid, onData, onError),
    [teacher.uid],
  );
  const classes = useLiveData(source, "classroom-teacher-classes");
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold">
          {tr("Welcome,", "Karibu,")} {teacher.name}
        </p>
        <div>
          <button
            type="button"
            onClick={() => void signOut.run(signOutUser)}
            disabled={signOut.pending}
            className={secondaryButton}
          >
            <LogOut className="size-4" aria-hidden="true" />
            {tr("Sign out", "Toka")}
          </button>
          <ActionFeedback state={signOut.state} />
        </div>
      </div>

      <section aria-labelledby="classes-heading" className="space-y-4">
        <h2 id="classes-heading" className={sectionTitle}>
          {tr("Your classes", "Madarasa yako")}
        </h2>
        {classes.status === "loading" && (
          <LoadingPanel label={tr("Loading classes…", "Inapakia madarasa…")} />
        )}
        {classes.status === "error" && <ErrorPanel error={classes.error} />}
        {classes.status === "ready" &&
          (classes.data.length === 0 ? (
            <EmptyState
              icon={School}
              title={tr(
                "No classes yet. Create your first one below.",
                "Bado hakuna madarasa. Unda la kwanza hapa chini.",
              )}
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {classes.data.map((classRoom) => (
                <li key={classRoom.id}>
                  <ClassCard classRoom={classRoom} uid={teacher.uid} />
                </li>
              ))}
            </ul>
          ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <CreateClassForm teacher={teacher} />
        <CoTeacherJoinForm teacher={teacher} />
      </div>

      <section aria-labelledby="resources-heading" className="space-y-4">
        <h2
          id="resources-heading"
          className={`${sectionTitle} flex items-center gap-2`}
        >
          <BookOpen
            className="size-5 text-kenya-green dark:text-green-400"
            aria-hidden="true"
          />
          {tr("Teaching resources", "Rasilimali za kufundishia")}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {tr(
            "Ready-made lessons built on the virtual labs. Open a class to assign one.",
            "Masomo yaliyo tayari yaliyojengwa juu ya maabara pepe. Fungua darasa ili kutoa moja.",
          )}
        </p>
        <LessonLibrary />
      </section>
    </div>
  );
}
