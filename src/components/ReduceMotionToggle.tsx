import { Sparkles, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ReduceMotionToggleProps {
  className?: string;
}

export const ReduceMotionToggle = ({ className }: ReduceMotionToggleProps) => {
  const { reduceMotion, override, systemPref, setReduceMotion } = useReducedMotion();
  const id = "reduce-motion-toggle";
  const isFollowingOS = override === null;

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
              {isFollowingOS
                ? "Following your OS setting."
                : "Custom override active."}
              {isFollowingOS && (
                <span className="ml-1">
                  OS is currently{" "}
                  <span className="text-foreground font-medium">
                    {systemPref ? "on" : "off"}
                  </span>
                  .
                </span>
              )}
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

      {!isFollowingOS && (
        <button
          type="button"
          onClick={() => setReduceMotion(null)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded"
          aria-label="Reset reduce motion to operating system preference"
        >
          <RotateCcw className="h-3 w-3" />
          Reset to OS setting
        </button>
      )}
    </div>
  );
};
