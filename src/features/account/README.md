# Account

Sign in, sign up and the student dashboard.

## Routes

| Path                                                   | Page                                                                                                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                    | the public landing page (catalog feature)                                                                                                                 |
| `/login`                                               | "How do you use Bunifu Labs?": In school (Educators, Students with class code, Student accounts) and On your own (Personal accounts), plus a link to join |
| `/login/educator`, `/login/student`, `/login/personal` | Google or email and password; "Forgot password?" sends a reset email                                                                                      |
| `/login/class`                                         | class code and nickname, no email (an anonymous account); `?code=` fills the code                                                                         |
| `/signup`                                              | pick Educator, Student or On my own, then Google or email and password; `?role=` skips the choice                                                         |
| `/dashboard`                                           | signed-in students and personal accounts: their class and assignments, and the labs. Educators are sent to `/teacher`; signed-out visitors to `/login`    |

Educators land on `/teacher`; everyone else on `/dashboard` (`homeFor` in `account.schema.ts`).

## Roles

Each email or Google account has a profile at `users/{uid}` with its `role` (`teacher`, `student` or `personal`) and `name`. The role is set when the account is first used, from the screen the person signed in on, and never changes. Signing in on the educator screen with a student or personal account signs out again with a clear message. Class-code students are anonymous and have no profile.

The Firestore rules allow class creation and co-teaching only for `teacher` profiles, and for older accounts made before profiles existed.

## Code

- `account.api.ts` — every Auth and profile call; Firebase errors become `AppError`s (`credentials`, `account-exists`, `weak-password`, `too-many-attempts`, `wrong-role`).
- `account.schema.ts` — validates the forms and parses profile documents.
- `hooks/useAccount.ts` — the signed-in person and their profile, live.
- `components/AccountMenu.tsx` — the account corner of the app header.

## Setup

Enable the **Email/Password**, **Google** and **Anonymous** providers in the Firebase console, and deploy the rules with `firebase deploy --only firestore:rules`.
