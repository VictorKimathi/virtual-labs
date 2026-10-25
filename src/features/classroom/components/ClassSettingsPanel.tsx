import {
  Crown,
  DoorClosed,
  DoorOpen,
  LogOut,
  RefreshCw,
  UserMinus,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import {
  removeTeacher,
  rotateJoinCode,
  rotateTeacherCode,
  updateClassSettings,
  watchTeacherCode,
} from "../classroom.api";
import { formatCode, studentJoinLink } from "../classroom.format";
import { CLASS_NAME_MAX, parseClassForm } from "../classroom.schema";
import type { ClassRoom, SharingMode } from "../classroom.types";
import { useAction } from "../hooks/useAction";
import { useLiveData, type Subscribe } from "../hooks/useLiveData";
import { ConfirmButton } from "./ConfirmButton";
import { CopyButton } from "./CopyButton";
import { ActionFeedback, ErrorPanel } from "./StatusPanels";
import {
  card,
  fieldError,
  hint,
  input,
  label,
  secondaryButton,
  sectionTitle,
} from "./styles";

type Props = { classRoom: ClassRoom; uid: string };

function CodeDisplay({ code }: { code: string }) {
  return (
    <p className="font-mono text-4xl font-black tracking-widest text-kenya-green dark:text-green-400">
      {formatCode(code)}
    </p>
  );
}

function StudentAccess({ classRoom }: { classRoom: ClassRoom }) {
  const { tr } = useLanguage();
  const action = useAction("classroom-student-access");
  return (
    <section className={card} aria-labelledby="student-access-heading">
      <h2 id="student-access-heading" className={sectionTitle}>
        {tr("Student access", "Ufikiaji wa wanafunzi")}
      </h2>
      <p className={hint}>
        {tr(
          "Students open the Student dashboard, enter this code and pick a nickname. No email needed.",
          "Wanafunzi hufungua dashibodi ya Mwanafunzi, huweka msimbo huu na kuchagua jina la utani. Hakuna barua pepe.",
        )}
      </p>
      <div className="mt-4">
        <CodeDisplay code={classRoom.joinCode} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton
          value={classRoom.joinCode}
          label={tr("Copy code", "Nakili msimbo")}
        />
        <CopyButton
          value={studentJoinLink(classRoom.joinCode)}
          label={tr("Copy join link", "Nakili kiungo")}
        />
        <ConfirmButton
          confirmLabel={tr("Issue new code", "Toa msimbo mpya")}
          disabled={action.pending}
          onConfirm={() => void action.run(() => rotateJoinCode(classRoom))}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {tr("Reset code", "Weka msimbo upya")}
        </ConfirmButton>
        <button
          type="button"
          disabled={action.pending}
          onClick={() =>
            void action.run(() =>
              updateClassSettings(classRoom.id, {
                joinOpen: !classRoom.joinOpen,
              }),
            )
          }
          className={secondaryButton}
        >
          {classRoom.joinOpen ? (
            <DoorClosed className="size-4" aria-hidden="true" />
          ) : (
            <DoorOpen className="size-4" aria-hidden="true" />
          )}
          {classRoom.joinOpen
            ? tr("Close joining", "Funga kujiunga")
            : tr("Open joining", "Fungua kujiunga")}
        </button>
      </div>
      <p className={hint}>
        {tr(
          "Resetting the code stops the old one at once; students already in the class stay in.",
          "Kuweka msimbo upya husimamisha ule wa zamani mara moja; wanafunzi walio darasani hubaki.",
        )}
      </p>
      <ActionFeedback state={action.state} />
    </section>
  );
}

function SharingSettings({ classRoom }: { classRoom: ClassRoom }) {
  const { tr } = useLanguage();
  const action = useAction("classroom-sharing");
  const options: { value: SharingMode; title: string; text: string }[] = [
    {
      value: "private",
      title: tr("Teachers only", "Walimu pekee"),
      text: tr(
        "Students' work is seen only by the class teachers.",
        "Kazi za wanafunzi huonwa na walimu wa darasa pekee.",
      ),
    },
    {
      value: "class",
      title: tr("Class gallery", "Maonyesho ya darasa"),
      text: tr(
        "Students may choose to share their work with classmates. You can hide any shared piece.",
        "Wanafunzi wanaweza kuchagua kushiriki kazi yao na wenzao. Unaweza kuficha kazi yoyote.",
      ),
    },
  ];
  return (
    <fieldset className={card}>
      <legend className="sr-only">{tr("Sharing", "Kushiriki")}</legend>
      <h2 className={sectionTitle} aria-hidden="true">
        {tr("Sharing", "Kushiriki")}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${classRoom.sharing === option.value ? "border-kenya-green bg-green-50 dark:border-green-500 dark:bg-green-950" : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"}`}
          >
            <input
              type="radio"
              name="sharing"
              value={option.value}
              checked={classRoom.sharing === option.value}
              disabled={action.pending}
              onChange={() =>
                void action.run(() =>
                  updateClassSettings(classRoom.id, { sharing: option.value }),
                )
              }
              className="mt-1 size-4 accent-kenya-green"
            />
            <span>
              <span className="block font-bold">{option.title}</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                {option.text}
              </span>
            </span>
          </label>
        ))}
      </div>
      <ActionFeedback state={action.state} />
    </fieldset>
  );
}

function CoTeachers({ classRoom, uid }: Props) {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const action = useAction("classroom-co-teachers");
  const owner = classRoom.ownerId === uid;
  const subscribe = useCallback<Subscribe<string | null>>(
    (onData, onError) => watchTeacherCode(classRoom.id, onData, onError),
    [classRoom.id],
  );
  const teacherCode = useLiveData(subscribe, "classroom-teacher-code");
  return (
    <section className={card} aria-labelledby="co-teachers-heading">
      <h2 id="co-teachers-heading" className={sectionTitle}>
        {tr("Co-teachers", "Walimu wenza")}
      </h2>
      <p className={hint}>
        {tr(
          "Another teacher signs in, chooses “Join as a co-teacher” and enters this code. Keep it away from students.",
          "Mwalimu mwingine huingia, huchagua “Jiunge kama mwalimu mwenza” na huweka msimbo huu. Usiwape wanafunzi.",
        )}
      </p>
      <div className="mt-4">
        {teacherCode.status === "loading" && (
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {tr("Loading code…", "Inapakia msimbo…")}
          </p>
        )}
        {teacherCode.status === "error" && (
          <ErrorPanel error={teacherCode.error} />
        )}
        {teacherCode.status === "ready" && teacherCode.data && (
          <>
            <CodeDisplay code={teacherCode.data} />
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton
                value={teacherCode.data}
                label={tr("Copy code", "Nakili msimbo")}
              />
              <ConfirmButton
                confirmLabel={tr("Issue new code", "Toa msimbo mpya")}
                disabled={action.pending}
                onConfirm={() => {
                  const oldCode = teacherCode.data;
                  if (oldCode)
                    void action.run(() =>
                      rotateTeacherCode(classRoom.id, oldCode),
                    );
                }}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {tr("Reset code", "Weka msimbo upya")}
              </ConfirmButton>
            </div>
          </>
        )}
      </div>
      <ul className="mt-5 space-y-2">
        {classRoom.teacherIds.map((teacherId) => {
          const name =
            classRoom.teacherNames[teacherId] ?? tr("Teacher", "Mwalimu");
          const isOwner = teacherId === classRoom.ownerId;
          return (
            <li
              key={teacherId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <span className="flex items-center gap-2 font-bold">
                {isOwner && (
                  <Crown className="size-4 text-amber-500" aria-hidden="true" />
                )}
                {name}
                {teacherId === uid && (
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {tr("(you)", "(wewe)")}
                  </span>
                )}
              </span>
              {owner && !isOwner && (
                <ConfirmButton
                  confirmLabel={tr("Remove", "Ondoa")}
                  disabled={action.pending}
                  onConfirm={() =>
                    void action.run(() =>
                      removeTeacher(classRoom.id, teacherId),
                    )
                  }
                >
                  <UserMinus className="size-4" aria-hidden="true" />
                  {tr("Remove", "Ondoa")}
                </ConfirmButton>
              )}
              {!owner && teacherId === uid && (
                <ConfirmButton
                  confirmLabel={tr("Leave class", "Ondoka darasani")}
                  disabled={action.pending}
                  onConfirm={() =>
                    void action
                      .run(() => removeTeacher(classRoom.id, uid))
                      .then((left) => left && navigate("/teacher"))
                  }
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {tr("Leave", "Ondoka")}
                </ConfirmButton>
              )}
            </li>
          );
        })}
      </ul>
      <ActionFeedback state={action.state} />
    </section>
  );
}

function RenameClass({ classRoom }: { classRoom: ClassRoom }) {
  const { tr } = useLanguage();
  const action = useAction("classroom-rename");
  const [name, setName] = useState(classRoom.name);
  const [invalid, setInvalid] = useState(false);
  const save = () => {
    const parsed = parseClassForm({ name, subject: classRoom.subject });
    setInvalid(!parsed.ok);
    if (parsed.ok)
      void action.run(() =>
        updateClassSettings(classRoom.id, { name: parsed.data.name }),
      );
  };
  return (
    <section className={card} aria-labelledby="rename-heading">
      <h2 id="rename-heading" className={sectionTitle}>
        {tr("Class name", "Jina la darasa")}
      </h2>
      <label htmlFor="rename-class" className={`${label} sr-only`}>
        {tr("Class name", "Jina la darasa")}
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="rename-class"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={CLASS_NAME_MAX}
          aria-invalid={invalid}
          className={input}
        />
        <button
          type="button"
          onClick={save}
          disabled={action.pending || name.trim() === classRoom.name}
          className={secondaryButton}
        >
          {tr("Save", "Hifadhi")}
        </button>
      </div>
      {invalid && (
        <p className={fieldError}>
          {tr(
            `Use 2 to ${CLASS_NAME_MAX} characters.`,
            `Tumia herufi 2 hadi ${CLASS_NAME_MAX}.`,
          )}
        </p>
      )}
      <ActionFeedback
        state={action.state}
        success={tr("Saved.", "Imehifadhiwa.")}
      />
    </section>
  );
}

export function ClassSettingsPanel({ classRoom, uid }: Props) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <StudentAccess classRoom={classRoom} />
      <CoTeachers classRoom={classRoom} uid={uid} />
      <SharingSettings classRoom={classRoom} />
      <RenameClass classRoom={classRoom} />
    </div>
  );
}
