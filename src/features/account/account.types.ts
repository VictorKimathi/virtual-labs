/** Educators teach classes; students and personal users use the labs. */
export type AccountRole = "teacher" | "student" | "personal";

export type Profile = { role: AccountRole; name: string };

/** The signed-in person. Class-code students are anonymous and have no profile. */
export type Account = {
  uid: string;
  anonymous: boolean;
  name: string | null;
  email: string | null;
  profile: Profile | null;
};

export type LoginForm = { email: string; password: string };

export type SignupForm = {
  name: string;
  email: string;
  password: string;
  role: AccountRole;
};

export type AccountField = "name" | "email" | "password";

export type AccountFieldError =
  "required" | "invalid" | "too-short" | "too-long";
