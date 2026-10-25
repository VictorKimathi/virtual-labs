import {
  BookOpen,
  ClipboardList,
  Eye,
  LogIn,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { useLanguage } from "../../../app/useLanguage";
import { signInTeacher } from "../classroom.api";
import { useAction } from "../hooks/useAction";
import { ActionFeedback } from "./StatusPanels";
import { card, primaryButton } from "./styles";

export function TeacherSignIn() {
  const { tr } = useLanguage();
  const action = useAction("classroom-teacher-sign-in");
  const features = [
    {
      icon: Users,
      text: tr(
        "Create classes and share a class code",
        "Unda madarasa na ushiriki msimbo wa darasa",
      ),
    },
    {
      icon: ShieldCheck,
      text: tr(
        "Students join with a nickname: no email needed",
        "Wanafunzi hujiunga kwa jina la utani: hakuna barua pepe",
      ),
    },
    {
      icon: ClipboardList,
      text: tr("Assign lab experiments", "Toa majaribio ya maabara"),
    },
    {
      icon: Eye,
      text: tr(
        "Review student work and give feedback",
        "Kagua kazi za wanafunzi na utoe maoni",
      ),
    },
    {
      icon: UsersRound,
      text: tr(
        "Teach together with co-teachers",
        "Fundisha pamoja na walimu wenza",
      ),
    },
    {
      icon: BookOpen,
      text: tr("Ready-made lesson plans", "Mipango ya masomo iliyo tayari"),
    },
  ];
  return (
    <section className={card} aria-labelledby="teacher-sign-in-heading">
      <h2 id="teacher-sign-in-heading" className="text-lg font-black">
        {tr("What you can do", "Unachoweza kufanya")}
      </h2>
      <ul className="mt-4 grid gap-3">
        {features.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-center gap-3 text-sm font-semibold"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            {text}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => void action.run(signInTeacher)}
        disabled={action.pending}
        className={`${primaryButton} mt-6 w-full`}
      >
        <LogIn className="size-4" aria-hidden="true" />
        {action.pending
          ? tr("Signing in…", "Inaingia…")
          : tr("Sign in with Google", "Ingia kwa Google")}
      </button>
      <ActionFeedback state={action.state} />
    </section>
  );
}
