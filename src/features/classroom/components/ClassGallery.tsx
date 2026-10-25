import { Images } from "lucide-react";
import { useCallback } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { watchSharedSubmissions } from "../classroom.api";
import type { Assignment, Submission } from "../classroom.types";
import { useLiveData, type Subscribe } from "../hooks/useLiveData";
import { ErrorPanel, LoadingPanel } from "./StatusPanels";
import { card } from "./styles";

/** Work classmates chose to share. Only shown while the class allows sharing. */
export function ClassGallery({
  classId,
  assignments,
}: {
  classId: string;
  assignments: Assignment[];
}) {
  const { tr } = useLanguage();
  const subscribe = useCallback<Subscribe<Submission[]>>(
    (onData, onError) => watchSharedSubmissions(classId, onData, onError),
    [classId],
  );
  const shared = useLiveData(subscribe, "classroom-gallery");
  if (shared.status === "loading")
    return (
      <LoadingPanel label={tr("Loading gallery…", "Inapakia maonyesho…")} />
    );
  if (shared.status === "error") return <ErrorPanel error={shared.error} />;
  const titles = new Map(assignments.map((item) => [item.id, item.title]));
  const items = shared.data.filter((item) => titles.has(item.assignmentId));
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Images}
        title={tr(
          "Nobody has shared work yet",
          "Bado hakuna aliyeshiriki kazi",
        )}
      />
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className={card}>
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {titles.get(item.assignmentId)}
          </p>
          <p className="mt-1 font-black">{item.nickname}</p>
          <p className="mt-2 line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
            {item.answer}
          </p>
        </li>
      ))}
    </ul>
  );
}
