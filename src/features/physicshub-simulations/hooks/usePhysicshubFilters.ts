import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { difficulties, levels } from "../data/filterLabels";
import { physicshubTopics } from "../physicshub.filters";
import type { PhysicshubFilters } from "../physicshub.types";

type FilterKey = "q" | "level" | "topic" | "difficulty";

export function usePhysicshubFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<PhysicshubFilters>(() => {
    const topic = searchParams.get("topic");
    return {
      query: searchParams.get("q") ?? "",
      level:
        levels.find((item) => item.id === searchParams.get("level"))?.id ??
        null,
      topic: physicshubTopics.find((item) => item === topic) ?? null,
      difficulty:
        difficulties.find((item) => item.id === searchParams.get("difficulty"))
          ?.id ?? null,
    };
  }, [searchParams]);

  const update = useCallback(
    (key: FilterKey, value: string | null) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    filters,
    hasActiveFilters:
      filters.query !== "" ||
      filters.level !== null ||
      filters.topic !== null ||
      filters.difficulty !== null,
    setQuery: (query: string) => update("q", query),
    setLevel: (level: string | null) => update("level", level),
    setTopic: (topic: string | null) => update("topic", topic),
    setDifficulty: (difficulty: string | null) =>
      update("difficulty", difficulty),
    clear: () => setSearchParams({}, { replace: true }),
  };
}
