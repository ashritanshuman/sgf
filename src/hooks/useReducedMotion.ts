import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sgf:reduce-motion";

const readSystemPref = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const readStored = (): boolean | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return null;
  } catch {
    return null;
  }
};

/**
 * Returns whether motion should be reduced. Honors the OS-level
 * `prefers-reduced-motion` media query, but lets the user override it via a
 * persistent in-app toggle (stored in localStorage).
 */
export function useReducedMotion() {
  const [systemPref, setSystemPref] = useState<boolean>(() => readSystemPref());
  const [override, setOverride] = useState<boolean | null>(() => readStored());

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setSystemPref(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setOverride(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const reduceMotion = override ?? systemPref;

  const setReduceMotion = useCallback((value: boolean | null) => {
    setOverride(value);
    try {
      if (value === null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
    } catch {
      // ignore
    }
  }, []);

  return { reduceMotion, override, systemPref, setReduceMotion };
}
