import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UNIVERSITIES } from "@/lib/universities";
import { scoreUniversity } from "@/lib/universitySearch";
import { useMemo } from "react";

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
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return UNIVERSITIES.slice(0, 200).map((name) => ({ name, score: 1 }));
    const scored = UNIVERSITIES
      .map((name) => ({ name, score: scoreUniversity(name, query) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 100);
    return scored;
  }, [query]);

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
          <CommandList>
            <CommandEmpty>No university found.</CommandEmpty>
            <CommandGroup>
              {results.map(({ name }) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={() => {
                    onChange(name);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
