import { motion } from "motion/react";
import { useId, useState } from "react";

type Props = { items: { title: string; text: string }[] };

/** A list on a vertical rail; the item in focus is highlighted on the rail. */
export function FeatureRail({ items }: Props) {
  const [active, setActive] = useState(0);
  const railId = useId();
  return (
    <ul className="relative space-y-2 border-l-4 border-stone-200 dark:border-stone-800">
      {items.map((item, index) => (
        <li key={item.title} className="relative">
          {active === index && (
            <motion.span
              layoutId={railId}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
              className="absolute -left-1 inset-y-0 w-1 bg-linear-to-b from-kenya-green to-emerald-500"
            />
          )}
          <button
            type="button"
            aria-pressed={active === index}
            onClick={() => setActive(index)}
            onPointerEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            className={`block w-full py-4 pl-8 text-left transition-opacity ${active === index ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
          >
            <span className="mb-2 block text-xl font-bold">{item.title}</span>
            <span className="block leading-relaxed text-stone-500 dark:text-stone-400">
              {item.text}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
