import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UniversityRow {
  id: string;
  name: string;
  normalized_name: string;
  country: string | null;
  aliases: string[] | null;
  source: string | null;
  created_at: string;
}

/**
 * Subscribes to the universities table and returns the live list.
 * Picker components consume this so admin uploads appear instantly.
 */
export function useUniversities() {
  const [universities, setUniversities] = useState<UniversityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    // Page through to avoid the 1000-row default limit
    const pageSize = 1000;
    let from = 0;
    const all: UniversityRow[] = [];
    while (true) {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("name", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) {
        console.error("fetch universities", error);
        break;
      }
      if (!data || data.length === 0) break;
      all.push(...(data as UniversityRow[]));
      if (data.length < pageSize) break;
      from += pageSize;
    }
    setUniversities(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("universities-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "universities" },
        () => fetchAll()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return { universities, loading, refresh: fetchAll };
}
