# Classroom

Classes, assignments and student work. Sign in is handled by the account feature (`src/features/account/`).

- **Students** join from `/login/class` with a class code and a nickname, as an anonymous Firebase account (no email or password), or with their own student or personal account. Their class work appears on `/dashboard` (`components/StudentClassView`): assignments, the linked lab experiment, writing results, drafts and hand-in, teacher feedback, and the class gallery when the class allows sharing. Old `/student?code=…` links still work and open the class-code sign in.
- **`/teacher`** — educators create classes, join a colleague's class as co-teacher, and browse the lesson library. `components/TeacherGate` sends signed-out visitors to `/login/educator` and keeps student and personal accounts out.
- **`/teacher/classes/:classId`** — tabs for the roster and each student's work (review, return for revision, hide from the gallery), assignments (custom tasks, optionally tied to one experiment), ready-made lessons (assigns every experiment in the lesson), and settings (join code and link, reset code, close joining, sharing mode, co-teacher code, co-teachers, rename).

The teacher pages sit outside the app shell, in `src/app/PortalLayout` (brand, language and theme only, no sidebar).

## Code

- `classroom.api.ts` — every Firestore and Auth call; Firebase errors become `AppError`s (`permission-denied` → `forbidden`, closed popup → `sign-in`).
- `classroom.schema.ts` — parses each document read from Firestore and validates every form. Its length limits are repeated in `firestore.rules`.
- `hooks/useLiveData` follows one live query (loading / ready / error); `hooks/useAction` tracks one write.
- `data/activities.ts` lists every physics and chemistry bench experiment as an assignable activity with its `?experiment=` deep link; `data/lessons.ts` groups them into lessons. Lesson activity ids must exist in `activities.ts`.

## Data and rules

| Path                                            | Holds                                                                                 | Access                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `classes/{id}`                                  | name, subject, owner, `teacherIds`, `teacherNames`, `joinCode`, `joinOpen`, `sharing` | teachers; active students may read                                                                                 |
| `classes/{id}/students/{uid}`                   | nickname, status (`active` / `blocked`)                                               | the student creates it with the current code while joining is open; teachers block, restore and remove             |
| `classes/{id}/assignments/{id}`                 | title, instructions, `activityId`                                                     | teachers write; active students read                                                                               |
| `classes/{id}/submissions/{assignmentId}_{uid}` | answer, status, `shared`, feedback                                                    | the student writes their own; teachers review or unshare; classmates read shared work while `sharing` is `class`   |
| `classes/{id}/teacherJoins/{uid}`               | the teacher code a co-teacher presented                                               | written alongside the co-teacher join                                                                              |
| `classSecrets/{id}`                             | the co-teacher code                                                                   | teachers only                                                                                                      |
| `classCodes/{code}`                             | `classId`, `kind` (`student` / `teacher`)                                             | any signed-in user may fetch one code; never listed or overwritten                                                 |
| `learners/{uid}`                                | the class this student device belongs to                                              | the student only                                                                                                   |
| `users/{uid}`                                   | the account's role (`teacher` / `student` / `personal`) and name                      | the account only; the role is set once. Only `teacher` accounts (or older accounts with no profile) create classes |

All queries are single-field, so no composite indexes are needed. Resetting a code deletes the old `classCodes` document, so it stops working at once.

## Setup

In the Firebase console, enable the **Google**, **Email/Password** and **Anonymous** sign-in providers and add the hosting domain to the authorised domains. Deploy the rules with `firebase deploy --only firestore:rules,firestore:indexes`.
