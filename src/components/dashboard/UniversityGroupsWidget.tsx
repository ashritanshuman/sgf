import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type StudyGroup = Tables<"study_groups">;

interface UniversityGroupsWidgetProps {
  university: string | null | undefined;
  groups: StudyGroup[];
}

export const UniversityGroupsWidget = ({
  university,
  groups,
}: UniversityGroupsWidgetProps) => {
  const navigate = useNavigate();
  // Local mirror of groups so realtime inserts/deletes update the count
  // even if the parent hook hasn't refetched yet.
  const [liveGroups, setLiveGroups] = useState<StudyGroup[]>(groups);

  useEffect(() => {
    setLiveGroups(groups);
  }, [groups]);

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-university-groups")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "study_groups" },
        (payload) => {
          setLiveGroups((prev) => {
            if (payload.eventType === "INSERT") {
              const next = payload.new as StudyGroup;
              if (prev.some((g) => g.id === next.id)) return prev;
              return [next, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const next = payload.new as StudyGroup;
              return prev.map((g) => (g.id === next.id ? next : g));
            }
            if (payload.eventType === "DELETE") {
              const old = payload.old as StudyGroup;
              return prev.filter((g) => g.id !== old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const matchingGroups = useMemo(() => {
    if (!university) return [];
    const normalized = university.trim().toLowerCase();
    return liveGroups.filter(
      (g) =>
        g.is_public !== false &&
        (g.university ?? "").trim().toLowerCase() === normalized
    );
  }, [liveGroups, university]);

  const count = matchingGroups.length;
  const subjects = Array.from(
    new Set(matchingGroups.map((g) => g.subject).filter(Boolean))
  ).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card glow-hover"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">University Groups</h2>
            <p className="text-sm text-muted-foreground">
              {university ? `Active at ${university}` : "Set your university to see matches"}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(university ? "/groups" : "/profile")}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 shrink-0"
          aria-label={university ? "Browse university groups" : "Set university"}
        >
          {university ? "Browse" : "Set"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {!university ? (
        <div className="text-center py-6 text-muted-foreground">
          <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Add your university in your profile to discover groups around you.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-3 mb-3">
            <motion.span
              key={count}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="text-5xl font-bold"
            >
              {count}
            </motion.span>
            <span className="text-muted-foreground">
              active group{count === 1 ? "" : "s"}
            </span>
          </div>

          {count === 0 ? (
            <p className="text-sm text-muted-foreground">
              No groups yet at your university.{" "}
              <button
                onClick={() => navigate("/groups")}
                className="text-primary hover:underline"
              >
                Be the first to create one
              </button>
              .
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                >
                  {s}
                </span>
              ))}
              {matchingGroups.length > subjects.length && (
                <span className="px-2.5 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                  +{matchingGroups.length - subjects.length} more
                </span>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
