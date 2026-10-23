import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { PhetFilters, PhetSort } from "../phet.types";

type FilterKey = "q" | "subject" | "topic" | "level" | "sort";

export function usePhetFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<PhetFilters>(
    () => ({
      query: searchParams.get("q") ?? "",
      subject: searchParams.get("subject"),
      topic: searchParams.get("topic"),
      level: searchParams.get("level"),
      sort: searchParams.get("sort") === "newest" ? "newest" : "title",
    }),
    [searchParams],
  );

  const update = useCallback(
    (patch: Partial<Record<FilterKey, string | null>>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
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
      filters.subject !== null ||
      filters.topic !== null ||
      filters.level !== null,
    setQuery: (query: string) => update({ q: query }),
    setSubject: (subject: string | null) => update({ subject, topic: null }),
    setTopic: (topic: string | null) => update({ topic }),
    setLevel: (level: string | null) => update({ level }),
    setSort: (sort: PhetSort) =>
      update({ sort: sort === "title" ? null : sort }),
    clear: () => update({ q: null, subject: null, topic: null, level: null }),
  };
}
