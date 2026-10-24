import { MonitorPlay, Play } from "lucide-react";
import { useState } from "react";

type Props = { src: string };

export function RemoteThumbnail({ src }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-3/2 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
      {failed ? (
        <div className="flex h-full items-center justify-center text-slate-400">
          <MonitorPlay className="size-10" aria-hidden="true" />
        </div>
      ) : (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-slate-950/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="flex size-14 scale-75 items-center justify-center rounded-full bg-white text-kenya-green shadow-xl transition-transform duration-300 group-hover:scale-100 group-focus-visible:scale-100">
          <Play className="size-6 fill-current" />
        </span>
      </span>
    </div>
  );
}
