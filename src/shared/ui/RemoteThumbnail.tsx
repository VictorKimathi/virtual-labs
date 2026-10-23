import { MonitorPlay } from "lucide-react";
import { useState } from "react";

type Props = { src: string };

export function RemoteThumbnail({ src }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="aspect-3/2 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
      {failed ? (
        <div className="flex h-full items-center justify-center text-slate-400">
          <MonitorPlay className="h-10 w-10" aria-hidden="true" />
        </div>
      ) : (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      )}
    </div>
  );
}
