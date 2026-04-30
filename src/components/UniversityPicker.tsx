import { useEffect, useState, useMemo, useDeferredValue } from "react";
import { Check, ChevronsUpDown, Clock, X } from "lucide-react";
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

  const handleSelect = (name: string) => {
    onChange(name);
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
          <CommandInput
            placeholder="Search (e.g. IIT Bombay, MIT, VIT)..."
            value={query}
            onValueChange={setQuery}
          />
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
