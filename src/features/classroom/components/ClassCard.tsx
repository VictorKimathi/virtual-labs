import { ArrowRight, Crown, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { formatCode, subjectLabel } from "../classroom.format";
import type { ClassRoom } from "../classroom.types";
import { badge, badgeTones } from "./styles";

export function ClassCard({
  classRoom,
  uid,
}: {
  classRoom: ClassRoom;
  uid: string;
}) {
  const { tr } = useLanguage();
  const owner = classRoom.ownerId === uid;
  return (
    <Link
      to={`/teacher/classes/${classRoom.id}`}
      className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 transition-colors hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900 dark:hover:border-green-500"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-black tracking-tight">{classRoom.name}</h3>
        <ArrowRight
          className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {subjectLabel(classRoom.subject, tr)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`${badge} ${badgeTones.blue} font-mono tracking-widest`}
        >
          {formatCode(classRoom.joinCode)}
        </span>
        <span
          className={`${badge} ${owner ? badgeTones.amber : badgeTones.slate}`}
        >
          {owner ? (
            <Crown className="size-3.5" aria-hidden="true" />
          ) : (
            <UsersRound className="size-3.5" aria-hidden="true" />
          )}
          {owner ? tr("Owner", "Mmiliki") : tr("Co-teacher", "Mwalimu mwenza")}
        </span>
        {!classRoom.joinOpen && (
          <span className={`${badge} ${badgeTones.red}`}>
            {tr("Joining closed", "Kujiunga kumefungwa")}
          </span>
        )}
      </div>
    </Link>
  );
}
