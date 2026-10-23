import { Atom, Dna, FlaskConical, Sprout } from "lucide-react";
import type { Subject } from "../../features/catalog/data/catalog.types";

type Props = { icon: Subject["icon"]; className?: string };

export function SubjectIcon({ icon, className }: Props) {
  if (icon === "flask")
    return <FlaskConical className={className} aria-hidden="true" />;
  if (icon === "atom") return <Atom className={className} aria-hidden="true" />;
  if (icon === "sprout")
    return <Sprout className={className} aria-hidden="true" />;
  return <Dna className={className} aria-hidden="true" />;
}
