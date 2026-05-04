import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ReduceMotionToggleProps {
  className?: string;
}

/**
 * User-facing toggle for the "Reduce motion" preference. Overrides the OS
 * `prefers-reduced-motion` setting and is honored across micro-animations
 * (e.g. the picker's Clear button).
 */
export const ReduceMotionToggle = ({ className }: ReduceMotionToggleProps) => {
  const { reduceMotion, setReduceMotion } = useReducedMotion();
  const id = "reduce-motion-toggle";

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-3 rounded-lg border bg-background p-3">
        <div className="flex items-start gap-2 min-w-0">
          <Sparkles aria-hidden="true" className="h-4 w-4 mt-0.5 text-primary-foreground shrink-0" />
          <div className="min-w-0">
            <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
              Reduce motion
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Disable fade and scale micro-animations across the app.
            </p>
          </div>
        </div>
        <Switch
          id={id}
          checked={reduceMotion}
          onCheckedChange={(v) => setReduceMotion(v)}
          aria-label="Reduce motion"
        />
      </div>
    </div>
  );
};
