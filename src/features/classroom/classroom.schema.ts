import { AppError } from "../../shared/errors/appError";
import type {
  Assignment,
  ClassRoom,
  ClassSubject,
  FieldError,
  LearnerLink,
  ParseResult,
  SharingMode,
  Student,
  Submission,
} from "./classroom.types";

// These limits are repeated in firestore.rules; keep them in step.
export const CLASS_NAME_MAX = 60;
export const NICKNAME_MAX = 24;
export const TITLE_MAX = 100;
export const INSTRUCTIONS_MAX = 2000;
export const ANSWER_MAX = 4000;
export const FEEDBACK_MAX = 2000;

export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;
const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

type Data = Record<string, unknown>;

function isRecord(value: unknown): value is Data {
  return typeof value === "object" && value !== null;
}

function invalid(kind: string, id: string): never {
  throw new AppError("invalid-data", `Malformed ${kind} document ${id}`);
}

function text(data: Data, key: string, kind: string, id: string) {
  const value = data[key];
  return typeof value === "string" ? value : invalid(kind, id);
}

function millis(value: unknown): number {
  if (isRecord(value) && typeof value.toMillis === "function") {
    const result: unknown = value.toMillis();
    if (typeof result === "number") return result;
  }
  return 0;
}

function isSubject(value: unknown): value is ClassSubject {
  return value === "physics" || value === "chemistry" || value === "mixed";
}

function isSharing(value: unknown): value is SharingMode {
  return value === "private" || value === "class";
}

function stringList(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : null;
}

function stringMap(value: unknown) {
  if (!isRecord(value)) return null;
  const entries = Object.entries(value);
  return entries.every(([, name]) => typeof name === "string")
    ? (Object.fromEntries(entries) as Record<string, string>)
    : null;
}

export function parseClassRoom(id: string, data: unknown): ClassRoom {
  if (!isRecord(data)) invalid("class", id);
  const teacherIds = stringList(data.teacherIds);
  const teacherNames = stringMap(data.teacherNames);
  if (
    !teacherIds ||
    !teacherNames ||
    !isSubject(data.subject) ||
    !isSharing(data.sharing) ||
    typeof data.joinOpen !== "boolean"
  ) {
    invalid("class", id);
  }
  return {
    id,
    name: text(data, "name", "class", id),
    subject: data.subject,
    ownerId: text(data, "ownerId", "class", id),
    teacherIds,
    teacherNames,
    joinCode: text(data, "joinCode", "class", id),
    joinOpen: data.joinOpen,
    sharing: data.sharing,
    createdAt: millis(data.createdAt),
  };
}

export function parseStudent(id: string, data: unknown): Student {
  if (!isRecord(data)) invalid("student", id);
  if (data.status !== "active" && data.status !== "blocked") {
    invalid("student", id);
  }
  return {
    id,
    nickname: text(data, "nickname", "student", id),
    status: data.status,
    joinedAt: millis(data.joinedAt),
  };
}

export function parseAssignment(id: string, data: unknown): Assignment {
  if (!isRecord(data)) invalid("assignment", id);
  const activityId = data.activityId;
  if (activityId !== null && typeof activityId !== "string") {
    invalid("assignment", id);
  }
  return {
    id,
    title: text(data, "title", "assignment", id),
    instructions: text(data, "instructions", "assignment", id),
    activityId,
    createdBy: text(data, "createdBy", "assignment", id),
    createdAt: millis(data.createdAt),
  };
}

export function parseSubmission(id: string, data: unknown): Submission {
  if (!isRecord(data)) invalid("submission", id);
  const { status, feedback, shared } = data;
  if (
    (status !== "draft" && status !== "submitted" && status !== "reviewed") ||
    (feedback !== null && typeof feedback !== "string") ||
    typeof shared !== "boolean"
  ) {
    invalid("submission", id);
  }
  return {
    id,
    studentId: text(data, "studentId", "submission", id),
    assignmentId: text(data, "assignmentId", "submission", id),
    nickname: text(data, "nickname", "submission", id),
    status,
    answer: text(data, "answer", "submission", id),
    shared,
    feedback,
    updatedAt: millis(data.updatedAt),
  };
}

export function parseLearnerLink(id: string, data: unknown): LearnerLink {
  if (!isRecord(data)) invalid("learner", id);
  return {
    classId: text(data, "classId", "learner", id),
    nickname: text(data, "nickname", "learner", id),
  };
}

export function parseCodeTarget(
  id: string,
  data: unknown,
): { classId: string; kind: "student" | "teacher" } {
  if (!isRecord(data) || (data.kind !== "student" && data.kind !== "teacher")) {
    invalid("class code", id);
  }
  return { classId: text(data, "classId", "class code", id), kind: data.kind };
}

export function parseTeacherCode(id: string, data: unknown): string {
  if (!isRecord(data)) invalid("class secret", id);
  return text(data, "teacherCode", "class secret", id);
}

// Form boundaries

function collapse(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function checkLength(
  value: string,
  min: number,
  max: number,
): FieldError | null {
  if (value === "") return "required";
  return value.length < min || value.length > max ? "invalid" : null;
}

export function normaliseCode(value: string) {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

export function parseCode(value: string): ParseResult<string, "code"> {
  const code = normaliseCode(value);
  if (code === "") return { ok: false, errors: { code: "required" } };
  return CODE_PATTERN.test(code)
    ? { ok: true, data: code }
    : { ok: false, errors: { code: "invalid" } };
}

export function parseClassForm(values: {
  name: string;
  subject: ClassSubject;
}): ParseResult<{ name: string; subject: ClassSubject }, "name"> {
  const name = collapse(values.name);
  const error = checkLength(name, 2, CLASS_NAME_MAX);
  return error
    ? { ok: false, errors: { name: error } }
    : { ok: true, data: { name, subject: values.subject } };
}

export function parseJoinForm(values: {
  code: string;
  nickname: string;
}): ParseResult<{ code: string; nickname: string }, "code" | "nickname"> {
  const nickname = collapse(values.nickname);
  const code = parseCode(values.code);
  const errors: Partial<Record<"code" | "nickname", FieldError>> = {};
  if (!code.ok) Object.assign(errors, code.errors);
  const nicknameError = checkLength(nickname, 2, NICKNAME_MAX);
  if (nicknameError) errors.nickname = nicknameError;
  if (!code.ok || nicknameError) return { ok: false, errors };
  return { ok: true, data: { code: code.data, nickname } };
}

export function parseAssignmentForm(values: {
  title: string;
  instructions: string;
  activityId: string | null;
}): ParseResult<
  { title: string; instructions: string; activityId: string | null },
  "title" | "instructions"
> {
  const title = collapse(values.title);
  const instructions = values.instructions.trim();
  const errors: Partial<Record<"title" | "instructions", FieldError>> = {};
  const titleError = checkLength(title, 2, TITLE_MAX);
  if (titleError) errors.title = titleError;
  if (instructions.length > INSTRUCTIONS_MAX) errors.instructions = "invalid";
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: { title, instructions, activityId: values.activityId },
  };
}
