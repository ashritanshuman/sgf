import { useEffect, useRef, useState, useMemo, useDeferredValue } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsUpDown, Clock, Sparkles, History, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UNIVERSITIES } from "@/lib/universities";
import { explainMatch, type MatchExplanation } from "@/lib/universitySearch";
import { useUniversities } from "@/hooks/useUniversities";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUniversityPickerHistory } from "@/hooks/useUniversityPickerHistory";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface UniversityPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export const UniversityPicker = ({
  value,
  onChange,
  placeholder = "Select your university",
  id,
  className,
}: UniversityPickerProps) => {
  const [open, setOpen] = useState(false);
  const { lastQuery, setLastQuery, recents, recordSelection, clearHistory } =
    useUniversityPickerHistory();
  const { reduceMotion } = useReducedMotion();

  // Restore the last query on first mount so reopening picks up where you left off.
  const [query, setQuery] = useState(lastQuery);

  // Persist query (debounced) so it survives reloads without thrashing storage.
  const persistedQuery = useDebouncedValue(query, 250);
  useEffect(() => {
    if (persistedQuery !== lastQuery) setLastQuery(persistedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedQuery]);

  const { universities: dbUniversities } = useUniversities();

  // Two-stage smoothing: debounce keystrokes (120ms) AND let React deprioritize
  // the heavy ranking work so typing stays buttery on low-end mobile CPUs.
  const debouncedQuery = useDebouncedValue(query, 120);
  const deferredQuery = useDeferredValue(debouncedQuery);
  const isStale = deferredQuery !== query;

  // Prefer live DB list when available, fall back to bundled static list.
  const source = useMemo<string[]>(() => {
    if (dbUniversities.length > 0) {
      const names = dbUniversities.map((u) => u.name);
      if (!names.includes("Other")) names.push("Other");
      return names;
    }
    return [...UNIVERSITIES];
  }, [dbUniversities]);

  // Only show recents that still exist in the current source list.
  const visibleRecents = useMemo(() => {
    if (recents.length === 0) return [];
    const set = new Set(source);
    return recents.filter((r) => set.has(r));
  }, [recents, source]);

  const results = useMemo<Array<{ name: string; explanation: MatchExplanation }>>(() => {
    if (!deferredQuery.trim()) {
      return source.slice(0, 200).map((name) => ({
        name,
        explanation: { score: 1, reason: "none", segments: [{ text: name, highlight: false }] },
      }));
    }
    return source
      .map((name) => ({ name, explanation: explainMatch(name, deferredQuery) }))
      .filter((r) => r.explanation.score > 0)
      .sort(
        (a, b) =>
          b.explanation.score - a.explanation.score || a.name.localeCompare(b.name)
      )
      .slice(0, 100);
  }, [deferredQuery, source]);

  // Filter recents out of main results so we don't show them twice.
  const recentsSet = useMemo(() => new Set(visibleRecents), [visibleRecents]);
  const showRecentsGroup = visibleRecents.length > 0;
  const filteredResults = useMemo(
    () => (showRecentsGroup ? results.filter((r) => !recentsSet.has(r.name)) : results),
    [results, recentsSet, showRecentsGroup]
  );

  // Autocomplete suggestions: surface up to 5 short hints under the input
  // so the user can complete their query in one tap. Combines a previous
  // remembered query (when relevant) with the top matching university names.
  // Debounce suggestion input separately so the strip doesn't thrash on every
  // keystroke. Slightly longer than the results debounce — suggestions are
  // secondary UI and benefit from waiting for the user to settle.
  const suggestionQuery = useDebouncedValue(query, 180);
  const suggestions = useMemo<Array<{ text: string; kind: "history" | "match" }>>(() => {
    const q = suggestionQuery.trim();
    if (!q) return [];
    const lower = q.toLowerCase();
    const out: Array<{ text: string; kind: "history" | "match" }> = [];
    const seen = new Set<string>([lower]);

    const remembered = lastQuery.trim();
    if (
      remembered &&
      remembered.toLowerCase() !== lower &&
      remembered.toLowerCase().startsWith(lower)
    ) {
      out.push({ text: remembered, kind: "history" });
      seen.add(remembered.toLowerCase());
    }

    for (const r of results) {
      if (out.length >= 5) break;
      const key = r.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ text: r.name, kind: "match" });
    }
    return out;
  }, [suggestionQuery, lastQuery, results]);

    const handleSelect = (name: string) => {
    recordSelection(name);
    setOpen(false);
    // Clear active query so the next open starts fresh — but keep the
    // selection in `recents` so it's still one tap away.
    setQuery("");
    setLastQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal bg-background",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate text-left">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover"
        align="start"
      >
        <Command shouldFilter={false}>
          <div className="relative">
            <CommandInput
              placeholder="Search (e.g. IIT Bombay, MIT, VIT)..."
              value={query}
              onValueChange={setQuery}
            />
            <AnimatePresence initial={false}>
              {query && (
                <motion.button
                  key="clear-query"
                  type="button"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                  animate={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                  exit={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}
                  onClick={() => {
                    setQuery("");
                    setLastQuery("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                  aria-label="Clear search query"
                  title="Clear search (keeps recent selections)"
                >
                  <X className="h-3 w-3" />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          {suggestions.length > 0 && (
            <SuggestionStrip
              suggestions={suggestions}
              query={query}
              onPick={setQuery}
            />
          )}
          <CommandList
            className={cn("transition-opacity", isStale && "opacity-60")}
            aria-busy={isStale}
          >
            <CommandEmpty>No university found.</CommandEmpty>

            {showRecentsGroup && (
              <>
                <CommandGroup
                  heading={
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Recent
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearHistory();
                        }}
                        className="text-[10px] uppercase tracking-wide text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                  }
                >
                  {visibleRecents.map((name) => (
                    <CommandItem
                      key={`recent-${name}`}
                      value={`__recent__${name}`}
                      onSelect={() => handleSelect(name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value === name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate flex-1">{name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup heading={deferredQuery.trim() ? "Results" : "All universities"}>
              {filteredResults.map(({ name, explanation }) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={() => handleSelect(name)}
                  className="items-start"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 mt-0.5 shrink-0",
                      value === name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">
                      {explanation.segments.map((seg, i) =>
                        seg.highlight ? (
                          <mark
                            key={i}
                            className="bg-primary/20 text-foreground rounded px-0.5"
                          >
                            {seg.text}
                          </mark>
                        ) : (
                          <span key={i}>{seg.text}</span>
                        )
                      )}
                    </div>
                    {query.trim() && explanation.label && (
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {explanation.label}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface SuggestionStripProps {
  suggestions: Array<{ text: string; kind: "history" | "match" }>;
  query: string;
  onPick: (text: string) => void;
}

const SuggestionStrip = ({ suggestions, query, onPick }: SuggestionStripProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = "uni-picker-suggestions";

  // Reset active when the suggestion list changes underneath us.
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions.map((s) => `${s.kind}:${s.text}`).join("|")]);

  // Keep DOM focus + screen-reader announcement in sync with active chip.
  useEffect(() => {
    if (activeIndex < 0) return;
    btnRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  const move = (delta: number, e: React.KeyboardEvent) => {
    e.preventDefault();
    setActiveIndex((prev) => {
      const n = suggestions.length;
      if (n === 0) return -1;
      const base = prev < 0 ? (delta > 0 ? -1 : 0) : prev;
      return (base + delta + n) % n;
    });
  };

  const activeId =
    activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined;

  return (
    <div
      role="listbox"
      id={listId}
      aria-label="Search suggestions"
      aria-activedescendant={activeId}
      className="flex flex-wrap gap-1.5 px-3 py-2 border-b bg-muted/30"
    >
      {suggestions.map((s, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={`${s.kind}-${s.text}`}
            id={`${listId}-opt-${i}`}
            ref={(el) => (btnRefs.current[i] = el)}
            type="button"
            role="option"
            tabIndex={isActive || (activeIndex < 0 && i === 0) ? 0 : -1}
            aria-selected={isActive || query === s.text}
            aria-label={
              s.kind === "history"
                ? `Use previous search: ${s.text}`
                : `Autocomplete to ${s.text}`
            }
            onFocus={() => setActiveIndex(i)}
            onClick={() => onPick(s.text)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowRight") move(1, e);
              else if (e.key === "ArrowUp" || e.key === "ArrowLeft") move(-1, e);
              else if (e.key === "Home") {
                e.preventDefault();
                setActiveIndex(0);
              } else if (e.key === "End") {
                e.preventDefault();
                setActiveIndex(suggestions.length - 1);
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPick(s.text);
              }
            }}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[11px] text-foreground hover:bg-accent hover:text-accent-foreground transition-colors max-w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              isActive && "ring-2 ring-ring ring-offset-1 ring-offset-background"
            )}
            title={s.kind === "history" ? "From your last search" : "Tap to autocomplete"}
          >
            {s.kind === "history" ? (
              <History aria-hidden="true" className="h-3 w-3 shrink-0 opacity-70" />
            ) : (
              <Sparkles aria-hidden="true" className="h-3 w-3 shrink-0 opacity-70" />
            )}
            <span className="truncate">{s.text}</span>
          </button>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {activeIndex >= 0 && suggestions[activeIndex]
          ? `Suggestion ${activeIndex + 1} of ${suggestions.length}: ${suggestions[activeIndex].text}`
          : ""}
      </span>
    </div>
  );
};
