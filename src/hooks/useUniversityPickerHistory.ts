import { useCallback, useEffect, useState } from "react";

const QUERY_KEY = "sgf:uni-picker:last-query";
const RECENTS_KEY = "sgf:uni-picker:recents";
const MAX_RECENTS = 5;

const safeRead = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / privacy-mode failures
  }
};

/**
 * Persists the picker's last query + most-recently selected universities to
 * localStorage so reopening feels instant. Keeps a short MRU list.
 */
export function useUniversityPickerHistory() {
  const [lastQuery, setLastQueryState] = useState<string>(() =>
    safeRead<string>(QUERY_KEY, "")
  );
  const [recents, setRecents] = useState<string[]>(() =>
    safeRead<string[]>(RECENTS_KEY, [])
  );

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === QUERY_KEY) setLastQueryState(safeRead<string>(QUERY_KEY, ""));
      if (e.key === RECENTS_KEY) setRecents(safeRead<string[]>(RECENTS_KEY, []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLastQuery = useCallback((q: string) => {
    setLastQueryState(q);
    safeWrite(QUERY_KEY, q);
  }, []);

  const recordSelection = useCallback((name: string) => {
    if (!name) return;
    setRecents((prev) => {
      const next = [name, ...prev.filter((n) => n !== name)].slice(0, MAX_RECENTS);
      safeWrite(RECENTS_KEY, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setLastQueryState("");
    setRecents([]);
    safeWrite(QUERY_KEY, "");
    safeWrite(RECENTS_KEY, []);
  }, []);

  return { lastQuery, setLastQuery, recents, recordSelection, clearHistory };
}
