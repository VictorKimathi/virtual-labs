import { Atom } from "lucide-react";

type Props = { className?: string; iconClassName?: string };

/** The round outlined atom used as the landing page's brand mark. */
export function BrandMark({
  className = "size-9",
  iconClassName = "size-5",
}: Props) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-current ${className}`}
    >
      <Atom className={iconClassName} />
    </span>
  );
}
