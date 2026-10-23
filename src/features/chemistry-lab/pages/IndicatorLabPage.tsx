import { Droplets, RotateCcw, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { mixColor, toCss } from "../chem/color";
import { GoalList, type Goal } from "../components/GoalList";
import { LabHeader } from "../components/LabHeader";
import { PhScale, type ScaleMarker } from "../components/PhScale";
import { TestTubeRack } from "../components/TestTubeRack";
import type { IndicatorId, SampleKind } from "../chemistry.types";
import { colourName, indicators } from "../data/indicators";
import { findSample, sampleKind, samples } from "../data/samples";
import { TUBE_COUNT, useIndicatorBench } from "../hooks/useIndicatorBench";

const pickable: IndicatorId[] = ["universal", "cabbage"];

const kindStyles: Record<SampleKind, string> = {
  acid: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  neutral: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  base: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

export default function IndicatorLabPage() {
  const { language, tr } = useLanguage();
  const { state, fill, test, empty, select, clear } = useIndicatorBench();
  const [indicatorId, setIndicatorId] = useState<IndicatorId>("universal");
  const indicator = indicators[indicatorId];
  const kindLabel: Record<SampleKind, string> = {
    acid: tr("Acid", "Asidi"),
    neutral: tr("Neutral", "Isiyoegemea"),
    base: tr("Base", "Besi"),
  };

  const tested = state.tubes.flatMap((tube, index) => {
    const sample = tube ? findSample(tube.sampleId) : undefined;
    return tube && tube.indicator && sample
      ? [{ index, sample, indicator: indicators[tube.indicator] }]
      : [];
  });
  const full = state.tubes.every((tube) => tube !== null);
  const selectedTube =
    state.selected !== null ? state.tubes[state.selected] : null;
  const selectedSample = selectedTube
    ? findSample(selectedTube.sampleId)
    : null;
  const selectedResult =
    selectedTube?.indicator && selectedSample
      ? indicators[selectedTube.indicator]
      : null;

  const markers: ScaleMarker[] = tested
    .filter((entry) => entry.indicator.id === indicatorId)
    .map((entry) => ({
      id: String(entry.index),
      ph: entry.sample.ph,
      label: String(entry.index + 1),
    }));

  const kinds = new Set(tested.map((entry) => sampleKind(entry.sample.ph)));
  const goals: Goal[] = [
    {
      id: "three",
      text: {
        en: "Test three different samples",
        sw: "Jaribu sampuli tatu tofauti",
      },
      done: new Set(tested.map((entry) => entry.sample.id)).size >= 3,
    },
    {
      id: "kinds",
      text: {
        en: "Find an acid, a neutral and a base",
        sw: "Pata asidi, isiyoegemea na besi",
      },
      done: kinds.size === 3,
    },
    {
      id: "both",
      text: {
        en: "Try both indicators",
        sw: "Jaribu viashiria vyote viwili",
      },
      done: new Set(tested.map((entry) => entry.indicator.id)).size >= 2,
    },
  ];

  return (
    <div className="space-y-4">
      <LabHeader
        title={{
          en: "Acid–base indicators",
          sw: "Viashiria vya asidi na besi",
        }}
        lessonId="acids-bases"
        actions={
          <button
            type="button"
            onClick={clear}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {tr("Clear rack", "Safisha rafu")}
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              1 · {tr("Pour a sample", "Mimina sampuli")}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {samples.map((sample) => (
                <li key={sample.id}>
                  <button
                    type="button"
                    onClick={() => fill(sample.id)}
                    disabled={full}
                    className="flex min-h-14 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 text-left text-xs font-bold transition-colors hover:border-orange-400 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <span
                      className="h-8 w-3 shrink-0 rounded-b-full rounded-t-sm ring-1 ring-slate-400"
                      style={{ backgroundColor: toCss(sample.tint) }}
                    />
                    {sample.name[language]}
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              2 · {tr("Pick an indicator", "Chagua kiashiria")}
            </h2>
            <div className="mt-3 space-y-2">
              {pickable.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setIndicatorId(id)}
                  aria-pressed={indicatorId === id}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl border-2 px-3 text-left text-sm font-bold transition-colors ${indicatorId === id ? "border-orange-500 bg-orange-50 dark:bg-orange-950" : "border-slate-200 dark:border-slate-700"}`}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full ring-1 ring-slate-400"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${toCss(mixColor(indicators[id].stops, 2))}, ${toCss(mixColor(indicators[id].stops, 7))}, ${toCss(mixColor(indicators[id].stops, 12))})`,
                    }}
                  />
                  {indicators[id].name[language]}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="order-1 space-y-4 lg:order-2 lg:col-span-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-b from-sky-50 to-slate-100 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
            <TestTubeRack
              tubes={state.tubes}
              selected={state.selected}
              dosing={state.dosing}
              onSelect={select}
            />
            {tested.length === 0 &&
              state.tubes.every((tube) => tube === null) && (
                <p className="pb-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {tr(
                    "Pick a sample to fill the first tube.",
                    "Chagua sampuli kujaza mrija wa kwanza.",
                  )}
                </p>
              )}
          </section>
          <PhScale indicator={indicator} markers={markers} />
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <h2 className="px-4 pt-4 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {tr("Observations", "Uchunguzi")}
            </h2>
            {tested.length === 0 ? (
              <p className="px-4 pb-4 pt-2 text-sm text-slate-600 dark:text-slate-300">
                {tr(
                  "Add an indicator to a tube and its result is recorded here.",
                  "Weka kiashiria kwenye mrija na matokeo yake yataandikwa hapa.",
                )}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="mt-2 w-full text-left text-sm">
                  <thead className="text-xs text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-2 font-bold">
                        {tr("Tube", "Mrija")}
                      </th>
                      <th className="px-2 py-2 font-bold">
                        {tr("Sample", "Sampuli")}
                      </th>
                      <th className="px-2 py-2 font-bold">
                        {tr("Indicator", "Kiashiria")}
                      </th>
                      <th className="px-2 py-2 font-bold">
                        {tr("Colour", "Rangi")}
                      </th>
                      <th className="px-2 py-2 font-bold">pH</th>
                      <th className="px-4 py-2 font-bold">
                        {tr("Type", "Aina")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tested.map((entry) => {
                      const kind = sampleKind(entry.sample.ph);
                      return (
                        <motion.tr
                          key={entry.index}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border-t border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-4 py-2 font-extrabold">
                            {entry.index + 1}
                          </td>
                          <td className="px-2 py-2">
                            {entry.sample.name[language]}
                          </td>
                          <td className="px-2 py-2">
                            {entry.indicator.name[language]}
                          </td>
                          <td className="px-2 py-2">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="h-4 w-4 rounded-full ring-1 ring-slate-400"
                                style={{
                                  backgroundColor: toCss(
                                    mixColor(
                                      entry.indicator.stops,
                                      entry.sample.ph,
                                    ),
                                  ),
                                }}
                              />
                              {
                                colourName(entry.indicator, entry.sample.ph)[
                                  language
                                ]
                              }
                            </span>
                          </td>
                          <td className="px-2 py-2 font-bold">
                            {entry.sample.ph.toFixed(1)}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${kindStyles[kind]}`}
                            >
                              {kindLabel[kind]}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="order-3 space-y-4 lg:col-span-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              3 · {tr("Test the tube", "Jaribu mrija")}
            </h2>
            {selectedTube && selectedSample && state.selected !== null ? (
              <div className="mt-3 space-y-3">
                <p className="text-lg font-bold">
                  <span className="text-orange-600 dark:text-orange-400">
                    {state.selected + 1}
                  </span>{" "}
                  · {selectedSample.name[language]}
                </p>
                {selectedResult ? (
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {tr("Colour", "Rangi")}:{" "}
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {
                          colourName(selectedResult, selectedSample.ph)[
                            language
                          ]
                        }
                      </span>
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      pH{" "}
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {selectedSample.ph.toFixed(1)}
                      </span>{" "}
                      ·{" "}
                      <span className="font-extrabold">
                        {kindLabel[sampleKind(selectedSample.ph)]}
                      </span>
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => test(indicatorId)}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-extrabold text-white hover:bg-orange-700"
                  >
                    <Droplets className="h-4 w-4" aria-hidden="true" />
                    {tr("Add 3 drops", "Weka matone 3")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => empty(state.selected ?? 0)}
                  className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 dark:text-slate-400"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {tr("Empty tube", "Mimina mrija")}
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {tr(
                  `Pour a sample, then select its tube. The rack holds ${TUBE_COUNT} tubes.`,
                  `Mimina sampuli, kisha chagua mrija wake. Rafu ina mirija ${TUBE_COUNT}.`,
                )}
              </p>
            )}
          </section>
          <GoalList
            title={{ en: "Sort the samples", sw: "Panga sampuli" }}
            steps={[
              {
                en: "Pour a sample into a tube.",
                sw: "Mimina sampuli kwenye mrija.",
              },
              {
                en: "Add the indicator and watch the colour.",
                sw: "Weka kiashiria na uangalie rangi.",
              },
              {
                en: "Match the colour to the pH scale.",
                sw: "Linganisha rangi na kipimo cha pH.",
              },
            ]}
            goals={goals}
            finish={{
              en: "Acids turn the indicator red or orange, bases turn it blue or purple, and neutral samples stay green.",
              sw: "Asidi hubadilisha kiashiria kuwa nyekundu au chungwa, besi huwa buluu au zambarau, na isiyoegemea hubaki kijani.",
            }}
          />
        </div>
      </div>
    </div>
  );
}
