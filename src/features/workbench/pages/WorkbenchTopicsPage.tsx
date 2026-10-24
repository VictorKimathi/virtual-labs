import {
  ArrowRight,
  Atom,
  Filter,
  FlaskConical,
  HeartPulse,
  Lightbulb,
  Microscope,
  Search,
  TestTubes,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../app/useLanguage";
import { topics } from "../data/topics";

const topicIcons: Record<string, typeof Zap> = {
  physics: Atom,
};

const chemistryTone =
  "bg-orange-50 text-subject-chemistry dark:bg-orange-950 dark:text-orange-300";

type Bench = {
  id: string;
  subjectId: "physics" | "chemistry" | "biology";
  to: string | null;
  icon: typeof Zap;
  subject: { en: string; sw: string };
  kind: { en: string; sw: string };
  name: { en: string; sw: string };
  summary: { en: string; sw: string };
  detail: { en: string; sw: string } | null;
  tone: string;
};

const subjectSections = [
  {
    id: "physics",
    name: { en: "Physics", sw: "Fizikia" },
    description: {
      en: "Measure, build circuits, bend light, heat water and more, with the full KCSE practical equipment list.",
      sw: "Pima, unda sakiti, pinda mwanga, pasha maji na zaidi, kwa orodha kamili ya vifaa vya mazoezi ya KCSE.",
    },
    icon: Zap,
    tone: "bg-blue-50 text-subject-physics dark:bg-blue-950 dark:text-blue-300",
  },
  {
    id: "chemistry",
    name: { en: "Chemistry", sw: "Kemia" },
    description: {
      en: "Investigate reactions, measurements and ways to separate mixtures.",
      sw: "Chunguza athari, vipimo na njia za kutenganisha michanganyiko.",
    },
    icon: FlaskConical,
    tone: chemistryTone,
  },
  {
    id: "biology",
    name: { en: "Biology", sw: "Biolojia" },
    description: {
      en: "Study plant cells and explore the human body in 3D.",
      sw: "Chunguza seli za mimea na mwili wa binadamu katika 3D.",
    },
    icon: Microscope,
    tone: "bg-green-50 text-subject-biology dark:bg-green-950 dark:text-green-300",
  },
] as const;

export default function WorkbenchTopicsPage() {
  const { language, tr } = useLanguage();
  const [query, setQuery] = useState("");
  const [showUpcoming, setShowUpcoming] = useState(true);
  const benches: Bench[] = [
    ...topics
      .filter((topic) => topic.experiments.length > 0)
      .map((topic) => ({
        id: topic.id,
        subjectId: "physics" as const,
        to: `/workbench/${topic.id}`,
        icon: topicIcons[topic.id] ?? Lightbulb,
        subject: { en: "Physics", sw: "Fizikia" },
        kind: { en: "2D practical bench", sw: "Benchi la mazoezi la 2D" },
        name: topic.name,
        summary: topic.summary,
        detail: {
          en: `${topic.equipment.length} items · ${topic.experiments.length} experiments`,
          sw: `Vifaa ${topic.equipment.length} · majaribio ${topic.experiments.length}`,
        },
        tone: "bg-blue-50 text-subject-physics dark:bg-blue-950 dark:text-blue-300",
      })),
    {
      id: "indicators",
      subjectId: "chemistry",
      to: "/chemistry/indicators",
      icon: TestTubes,
      subject: { en: "Chemistry", sw: "Kemia" },
      kind: { en: "Animated practical", sw: "Jaribio lenye mwendo" },
      name: { en: "Acid–base indicators", sw: "Viashiria vya asidi na besi" },
      summary: {
        en: "Test ten everyday liquids with universal indicator and red cabbage juice.",
        sw: "Jaribu vimiminika kumi vya kila siku kwa kiashiria cha jumla na juisi ya kabichi nyekundu.",
      },
      detail: {
        en: "10 samples · 2 indicators",
        sw: "Sampuli 10 · viashiria 2",
      },
      tone: chemistryTone,
    },
    {
      id: "titration",
      subjectId: "chemistry",
      to: "/chemistry/titration",
      icon: FlaskConical,
      subject: { en: "Chemistry", sw: "Kemia" },
      kind: { en: "Animated practical", sw: "Jaribio lenye mwendo" },
      name: { en: "Acid–base titration", sw: "Titreshini ya asidi na besi" },
      summary: {
        en: "Run a burette, watch the pH curve and find an unknown concentration.",
        sw: "Tumia biureti, tazama mkondo wa pH na upate uzito usiojulikana.",
      },
      detail: {
        en: "3 indicators · live pH curve",
        sw: "Viashiria 3 · mkondo wa pH",
      },
      tone: chemistryTone,
    },
    {
      id: "separation",
      subjectId: "chemistry",
      to: "/chemistry/separation",
      icon: Filter,
      subject: { en: "Chemistry", sw: "Kemia" },
      kind: { en: "Animated practical", sw: "Jaribio lenye mwendo" },
      name: { en: "Separating a mixture", sw: "Kutenganisha mchanganyiko" },
      summary: {
        en: "Use a magnet, water, a filter and heat to recover iron, sand and salt.",
        sw: "Tumia sumaku, maji, kichujio na joto kupata chuma, mchanga na chumvi.",
      },
      detail: {
        en: "4 methods · 3 substances",
        sw: "Mbinu 4 · dutu 3",
      },
      tone: chemistryTone,
    },
    {
      id: "microscope",
      subjectId: "biology",
      to: "/sandbox/biology",
      icon: Microscope,
      subject: { en: "Biology", sw: "Biolojia" },
      kind: { en: "3D bench", sw: "Benchi la 3D" },
      name: { en: "Microscope station", sw: "Kituo cha hadubini" },
      summary: {
        en: "Set up a microscope and a plant slide, then observe the parts of a plant cell.",
        sw: "Weka hadubini na slaidi ya mmea, kisha chunguza sehemu za seli ya mmea.",
      },
      detail: {
        en: "4 items · plant cell preview",
        sw: "Vifaa 4 · mfano wa seli",
      },
      tone: "bg-green-50 text-subject-biology dark:bg-green-950 dark:text-green-300",
    },
    {
      id: "anatomy",
      subjectId: "biology",
      to: "/biology/anatomy",
      icon: HeartPulse,
      subject: { en: "Biology", sw: "Biolojia" },
      kind: { en: "3D anatomy", sw: "Anatomia ya 3D" },
      name: { en: "Human anatomy", sw: "Anatomia ya binadamu" },
      summary: {
        en: "Explore the body and its internal anatomy, then arrange structures in an organized 3D layout.",
        sw: "Chunguza anatomia ya ndani, kisha panga sehemu zake katika mwonekano wa 3D.",
      },
      detail: {
        en: "464 structures · 3D layout",
        sw: "Sehemu 464 · mwonekano wa 3D",
      },
      tone: "bg-green-50 text-subject-biology dark:bg-green-950 dark:text-green-300",
    },
    ...topics
      .filter((topic) => topic.experiments.length === 0)
      .map((topic) => ({
        id: topic.id,
        subjectId: "physics" as const,
        to: null,
        icon: topicIcons[topic.id] ?? Lightbulb,
        subject: { en: "Physics", sw: "Fizikia" },
        kind: { en: "2D bench", sw: "Benchi la 2D" },
        name: topic.name,
        summary: topic.summary,
        detail: null,
        tone: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      })),
  ];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const shownBenches = benches.filter(
    (bench) =>
      (showUpcoming || bench.to !== null) &&
      (!normalizedQuery ||
        [bench.name, bench.summary, bench.kind, bench.subject].some((field) =>
          field[language].toLocaleLowerCase().includes(normalizedQuery),
        )),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {tr("Practice bench", "Benchi la mazoezi")}
        </h1>
        <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-300">
          {tr(
            "Hands-on benches where you place equipment and run your own experiments. Pick a bench to start. Prefer a step-by-step walkthrough? Try the ",
            "Mabenchi ya vitendo ambapo unaweka vifaa na kufanya majaribio yako. Chagua benchi kuanza. Unapendelea mwongozo wa hatua kwa hatua? Jaribu ",
          )}
          <Link
            to="/labs"
            className="font-bold text-kenya-green underline dark:text-green-400"
          >
            {tr("Guided lessons", "Masomo yenye mwongozo")}
          </Link>
          .
        </p>
      </div>
      <nav
        aria-label={tr("Practice subjects", "Masomo ya mazoezi")}
        className="grid gap-3 sm:grid-cols-3"
      >
        {subjectSections
          .filter((subject) =>
            shownBenches.some((bench) => bench.subjectId === subject.id),
          )
          .map((subject) => {
            const Icon = subject.icon;
            const count = benches.filter(
              (bench) => bench.subjectId === subject.id && bench.to,
            ).length;
            return (
              <a
                key={subject.id}
                href={`#${subject.id}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-kenya-green focus-visible:outline-2 focus-visible:outline-kenya-green dark:border-slate-800 dark:bg-slate-900"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${subject.tone}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-extrabold">
                    {subject.name[language]}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {count} {tr("ready", "tayari")}
                  </span>
                </span>
                <ArrowRight
                  className="ml-auto h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
              </a>
            );
          })}
      </nav>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md">
          <span className="sr-only">
            {tr("Search benches", "Tafuta mabenchi")}
          </span>
          <Search
            className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tr("Search benches", "Tafuta mabenchi")}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-kenya-green focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
          />
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showUpcoming}
            onChange={(event) => setShowUpcoming(event.target.checked)}
            className="h-4 w-4 accent-kenya-green"
          />
          {tr("Show coming soon", "Onyesha zinazokuja")}
        </label>
      </div>

      <p
        className="text-sm font-semibold text-slate-500 dark:text-slate-400"
        aria-live="polite"
      >
        {shownBenches.length} {tr("benches shown", "mabenchi yanaonyeshwa")}
      </p>

      {shownBenches.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="font-bold">
            {tr(
              "No benches match your search",
              "Hakuna benchi linalolingana na utafutaji wako",
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setShowUpcoming(true);
            }}
            className="mt-3 min-h-10 rounded-xl bg-kenya-green px-4 text-sm font-bold text-white"
          >
            {tr("Show all benches", "Onyesha mabenchi yote")}
          </button>
        </div>
      )}

      {subjectSections.map((subject) => {
        const subjectBenches = shownBenches.filter(
          (bench) => bench.subjectId === subject.id,
        );
        if (subjectBenches.length === 0) return null;
        const Icon = subject.icon;
        return (
          <section
            key={subject.id}
            id={subject.id}
            aria-labelledby={`${subject.id}-heading`}
            className="scroll-mt-6 space-y-4"
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${subject.tone}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id={`${subject.id}-heading`}
                  className="text-xl font-extrabold"
                >
                  {subject.name[language]}{" "}
                  <span className="text-base font-semibold text-slate-500 dark:text-slate-400">
                    ({subjectBenches.length})
                  </span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {subject.description[language]}
                </p>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {subjectBenches.map((bench) => {
                const Icon = bench.icon;
                const body: ReactNode = (
                  <>
                    <span className="flex items-center justify-between gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${bench.tone}`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {bench.subject[language]} · {bench.kind[language]}
                      </span>
                    </span>
                    <span className="mt-4 block text-xl font-extrabold">
                      {bench.name[language]}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {bench.summary[language]}
                    </span>
                    <span className="mt-auto flex items-center justify-between pt-4 text-sm font-bold">
                      {bench.detail ? (
                        <>
                          <span className="text-slate-500 dark:text-slate-400">
                            {bench.detail[language]}
                          </span>
                          <ArrowRight
                            className="h-4 w-4 text-kenya-green transition-transform group-hover:translate-x-1 dark:text-green-400"
                            aria-hidden="true"
                          />
                        </>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {tr("Coming soon", "Inakuja hivi karibuni")}
                        </span>
                      )}
                    </span>
                  </>
                );
                return (
                  <li key={bench.id}>
                    {bench.to ? (
                      <Link
                        to={bench.to}
                        className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-kenya-green dark:border-slate-800 dark:bg-slate-900"
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="flex h-full flex-col rounded-2xl border border-dashed border-slate-300 bg-white p-5 opacity-70 dark:border-slate-700 dark:bg-slate-900">
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
