import type { LocalizedText } from "../workbench/workbench.types";

export type ClassSubject = "physics" | "chemistry" | "mixed";

/** "private": only teachers see student work. "class": students may share work with classmates. */
export type SharingMode = "private" | "class";

export type ClassRoom = {
  id: string;
  name: string;
  subject: ClassSubject;
  ownerId: string;
  teacherIds: string[];
  teacherNames: Record<string, string>;
  joinCode: string;
  joinOpen: boolean;
  sharing: SharingMode;
  createdAt: number;
};

export type StudentStatus = "active" | "blocked";

export type Student = {
  id: string;
  nickname: string;
  status: StudentStatus;
  joinedAt: number;
};

export type Assignment = {
  id: string;
  title: string;
  instructions: string;
  activityId: string | null;
  createdBy: string;
  createdAt: number;
};

export type SubmissionStatus = "draft" | "submitted" | "reviewed";

export type Submission = {
  id: string;
  studentId: string;
  assignmentId: string;
  nickname: string;
  status: SubmissionStatus;
  answer: string;
  shared: boolean;
  feedback: string | null;
  updatedAt: number;
};

/** The class a student device belongs to, kept at `learners/{uid}`. */
export type LearnerLink = { classId: string; nickname: string };

export type ActivityLab = "physics" | "chemistry";

/** A lab experiment that can be assigned; it opens at `path`. */
export type Activity = {
  id: string;
  lab: ActivityLab;
  title: LocalizedText;
  summary: LocalizedText;
  path: string;
};

/** A ready-made lesson: an ordered set of activities with a teaching aim. */
export type Lesson = {
  id: string;
  lab: ActivityLab;
  title: LocalizedText;
  aim: LocalizedText;
  grade: string;
  minutes: number;
  activityIds: string[];
};

export type FieldError = "required" | "invalid";

export type ParseResult<T, Field extends string> =
  | { ok: true; data: T }
  | { ok: false; errors: Partial<Record<Field, FieldError>> };
