import {
  CircleCheck,
  CircleX,
  ClipboardPlus,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useLanguage } from "../../../app/useLanguage";
import {
  ACID_CONCENTRATION,
  FLASK_VOLUME,
  equivalenceVolume,
  phAfterAdding,
  unknownConcentration,
} from "../chem/titration";
import { mixColor, toCss } from "../chem/color";
import { GoalList, type Goal } from "../components/GoalList";
import { LabHeader } from "../components/LabHeader";
import { TitrationCurve } from "../components/TitrationCurve";
import { TitrationStage } from "../components/TitrationStage";
import type { IndicatorId } from "../chemistry.types";
import { indicators } from "../data/indicators";
import { useTitration } from "../hooks/useTitration";

const pickable: IndicatorId[] = [
  "phenolphthalein",
  "methyl-orange",
  "universal",
];

const pourSteps = [
  { amount: 5, label: { en: "+ 5 mL", sw: "+ mL 5" } },
  { amount: 1, label: { en: "+ 1 mL", sw: "+ mL 1" } },
  { amount: 0.1, label: { en: "+ 0.1 mL", sw: "+ mL 0.1" } },
  { amount: 0.05, label: { en: "1 drop", sw: "Tone 1" } },
];

export default function TitrationLabPage() {
  const { language, tr } = useLanguage();
  const { state, add, pick, refill, newUnknown, record, check } =
    useTitration();
  const [answer, setAnswer] = useState("");

  const base = unknownConcentration(state.attempt);
  const equivalence = equivalenceVolume(base);
  const ph = phAfterAdding(base, state.volume);
  const indicator = indicators[state.indicator];
  const solved = state.verdict === "correct";
  const overshot = state.volume > equivalence + 1.5;
  const mean =
    state.titres.length > 0
      ? state.titres.reduce((sum, value) => sum + value, 0) /
        state.titres.length
      : null;
  const concordant = state.titres.some((titre, index) =>
    state.titres.some(
      (other, otherIndex) =>
        otherIndex !== index && Math.abs(titre - other) <= 0.1,
    ),
  );

  const goals: Goal[] = [
    {
      id: "endpoint",
      text: {
        en: "Add acid until the colour changes",
        sw: "Ongeza asidi hadi rangi ibadilike",
      },
      done: state.reached,
    },
    {
      id: "titre",
      text: { en: "Record a titre", sw: "Andika titre" },
      done: state.titres.length >= 1,
    },
    {
      id: "concordant",
      text: {
        en: "Get two titres within 0.1 mL",
        sw: "Pata titre mbili zenye tofauti ya chini ya mL 0.1",
      },
      done: concordant,
    },
    {
      id: "concentration",
      text: {
        en: "Calculate the alkali concentration",
        sw: "Kokotoa uzito wa alkali",
      },
      done: solved,
    },
  ];

  function submitAnswer(event: FormEvent) {
    event.preventDefault();
    const value = Number(answer.replace(",", "."));
    if (Number.isFinite(value) && answer.trim() !== "") check(value);
  }

  return (
    <div className="space-y-4">
      <LabHeader
        title={{ en: "Acid–base titration", sw: "Titreshini ya asidi na besi" }}
        lessonId="titration"
        actions={
          <>
            <button
              type="button"
              onClick={refill}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {tr("Refill burette", "Jaza biureti")}
            </button>
            <button
              type="button"
              onClick={() => {
                newUnknown();
                setAnswer("");
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              {tr("New unknown", "Alkali mpya")}
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              1 · {tr("Pick an indicator", "Chagua kiashiria")}
            </h2>
            <div className="mt-3 space-y-2">
              {pickable.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => pick(id)}
                  disabled={state.volume > 0 && state.indicator !== id}
                  aria-pressed={state.indicator === id}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl border-2 px-3 text-left text-sm font-bold transition-colors disabled:opacity-40 ${state.indicator === id ? "border-orange-500 bg-orange-50 dark:bg-orange-950" : "border-slate-200 dark:border-slate-700"}`}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full ring-1 ring-slate-400"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${toCss(mixColor(indicators[id].stops, 3))}, ${toCss(mixColor(indicators[id].stops, 11))})`,
                    }}
                  />
                  {indicators[id].name[language]}
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              2 · {tr("Open the tap", "Fungua bomba")}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {pourSteps.map((step) => (
                <button
                  key={step.amount}
                  type="button"
                  onClick={() => add(step.amount)}
                  disabled={state.volume >= 50}
                  className="min-h-12 rounded-xl bg-orange-600 px-3 text-sm font-extrabold text-white transition-colors hover:bg-orange-700 disabled:opacity-40"
                >
                  {step.label[language]}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {tr(
                "Run a rough titration first, then repeat and go drop by drop near the colour change.",
                "Anza na titreshini ya makadirio, kisha rudia ukiongeza tone kwa tone karibu na mabadiliko ya rangi.",
              )}
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {tr("Equation", "Mlinganyo")}
            </h2>
            <p className="mt-2 text-base font-extrabold">
              HCl + NaOH → NaCl + H₂O
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {tr(
                `Burette: ${ACID_CONCENTRATION.toFixed(3)} mol/L HCl. Flask: ${FLASK_VOLUME.toFixed(1)} mL NaOH of unknown concentration.`,
                `Biureti: HCl ya ${ACID_CONCENTRATION.toFixed(3)} mol/L. Chupa: NaOH ya mL ${FLASK_VOLUME.toFixed(1)} yenye uzito usiojulikana.`,
              )}
            </p>
          </section>
        </div>

        <div className="order-1 space-y-3 lg:order-2 lg:col-span-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-b from-sky-50 to-slate-100 px-2 pt-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
            <TitrationStage
              volume={state.volume}
              ph={ph}
              indicator={indicator}
              pour={state.pour}
            />
          </section>
          {overshot && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-100"
            >
              {tr(
                "You went past the endpoint and the flask is now acidic. Refill the burette and add the acid more slowly near the colour change.",
                "Umevuka mwisho wa titreshini na chupa sasa ina asidi. Jaza biureti na uongeze asidi polepole karibu na mabadiliko ya rangi.",
              )}
            </motion.p>
          )}
        </div>

        <div className="order-3 space-y-4 lg:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {tr("Burette reading", "Kipimo cha biureti")}
              </p>
              <p className="mt-1 font-mono text-3xl font-black tabular-nums">
                {state.volume.toFixed(2)}
                <span className="ml-1 text-sm font-bold text-slate-500">
                  mL
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {tr("Probe reading", "Kipimo cha kipima pH")}
              </p>
              <p className="mt-1 font-mono text-3xl font-black tabular-nums">
                {ph.toFixed(2)}
              </p>
            </div>
          </div>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {tr("Titration curve", "Mkondo wa titreshini")}
            </h2>
            <TitrationCurve
              base={base}
              volume={state.volume}
              equivalence={solved ? equivalence : null}
            />
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                3 · {tr("Titres", "Titre")}
              </h2>
              <button
                type="button"
                onClick={record}
                disabled={state.volume === 0}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-extrabold text-white disabled:opacity-40 dark:bg-white dark:text-slate-900"
              >
                <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
                {tr("Record reading", "Andika kipimo")}
              </button>
            </div>
            {state.titres.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {tr(
                  "Record the burette reading when the colour changes.",
                  "Andika kipimo cha biureti rangi inapobadilika.",
                )}
              </p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {state.titres.map((titre, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold tabular-nums dark:bg-slate-800"
                  >
                    {index + 1}: {titre.toFixed(2)} mL
                  </motion.li>
                ))}
                {mean !== null && state.titres.length > 1 && (
                  <li className="rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-extrabold tabular-nums text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                    {tr("Mean", "Wastani")}: {mean.toFixed(2)} mL
                  </li>
                )}
              </ul>
            )}
            <form
              onSubmit={submitAnswer}
              className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800"
            >
              <label
                htmlFor="alkali-concentration"
                className="text-sm font-bold"
              >
                {tr(
                  "Concentration of the alkali (mol/L)",
                  "Uzito wa alkali (mol/L)",
                )}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="alkali-concentration"
                  inputMode="decimal"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="0.000"
                  className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-base font-bold tabular-nums dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="min-h-11 rounded-xl bg-orange-600 px-4 text-sm font-extrabold text-white hover:bg-orange-700"
                >
                  {tr("Check", "Hakiki")}
                </button>
              </div>
              {state.verdict && (
                <motion.div
                  key={`${state.verdict}-${answer}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="status"
                  className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-sm font-semibold ${solved ? "bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-kenya-red dark:bg-red-950 dark:text-red-300"}`}
                >
                  {solved ? (
                    <CircleCheck
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleX
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {solved
                    ? tr(
                        `Correct. ${ACID_CONCENTRATION.toFixed(3)} × ${equivalence.toFixed(2)} ÷ ${FLASK_VOLUME.toFixed(1)} = ${base.toFixed(3)} mol/L.`,
                        `Sahihi. ${ACID_CONCENTRATION.toFixed(3)} × ${equivalence.toFixed(2)} ÷ ${FLASK_VOLUME.toFixed(1)} = ${base.toFixed(3)} mol/L.`,
                      )
                    : tr(
                        "Not quite. One mole of HCl neutralises one mole of NaOH, so use acid concentration × titre ÷ flask volume.",
                        "Si sahihi. Mole moja ya HCl hutengua mole moja ya NaOH, kwa hivyo tumia uzito wa asidi × titre ÷ ujazo wa chupa.",
                      )}
                </motion.div>
              )}
            </form>
          </section>
          <GoalList
            title={{ en: "Find the unknown", sw: "Tafuta uzito usiojulikana" }}
            steps={[
              {
                en: "Add acid from the burette to the flask.",
                sw: "Ongeza asidi kutoka biureti kwenda chupani.",
              },
              {
                en: "Stop when the indicator changes colour.",
                sw: "Simama kiashiria kinapobadilika rangi.",
              },
              {
                en: "Record the titre and calculate.",
                sw: "Andika titre na ukokotoe.",
              },
            ]}
            goals={goals}
            finish={{
              en: "The pH rises and falls sharply at the equivalence point, and that is the volume the indicator marks.",
              sw: "pH hubadilika kwa kasi kwenye kiwango cha usawa, na huo ndio ujazo ambao kiashiria huonyesha.",
            }}
          />
        </div>
      </div>
    </div>
  );
}
