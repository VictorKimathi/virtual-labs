import type { ClassSubject, Submission } from "./classroom.types";

type Translate = (english: string, kiswahili: string) => string;

export function subjectLabel(subject: ClassSubject, tr: Translate) {
  if (subject === "physics") return tr("Physics", "Fizikia");
  if (subject === "chemistry") return tr("Chemistry", "Kemia");
  return tr("Physics & chemistry", "Fizikia na kemia");
}

export function studentJoinLink(code: string) {
  return `${window.location.origin}/student?code=${code}`;
}

export function formatCode(code: string) {
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

export function statusLabel(status: Submission["status"], tr: Translate) {
  if (status === "submitted") return tr("Submitted", "Imewasilishwa");
  if (status === "reviewed") return tr("Reviewed", "Imekaguliwa");
  return tr("In progress", "Inaendelea");
}

export function statusTone(status: Submission["status"]) {
  if (status === "submitted") return "amber" as const;
  if (status === "reviewed") return "green" as const;
  return "slate" as const;
}
