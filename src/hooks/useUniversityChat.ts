import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UniversityChatMessage {
  id: string;
  university: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

/**
 * Realtime chat scoped to a university. RLS restricts visibility to
 * members of that university (via profile.university), so the client
 * just queries by name and subscribes to inserts.
 */
export function useUniversityChat(university: string | null | undefined) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UniversityChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const hydrateProfiles = useCallback(
    async (rows: Omit<UniversityChatMessage, "profile">[]) => {
      const ids = [...new Set(rows.map((r) => r.user_id))];
      if (ids.length === 0) return [] as UniversityChatMessage[];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", ids);
      const map = new Map(profiles?.map((p) => [p.user_id, p]));
      return rows.map((r) => ({ ...r, profile: map.get(r.user_id) ?? undefined }));
    },
    []
  );

  const fetchMessages = useCallback(async () => {
    if (!university) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("university_messages")
      .select("*")
      .eq("university", university)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) {
      console.error("uni chat fetch", error);
      setLoading(false);
      return;
    }
    const withProfiles = await hydrateProfiles(data || []);
    setMessages(withProfiles);
    setLoading(false);
  }, [university, hydrateProfiles]);

  useEffect(() => {
    if (!university) return;
    fetchMessages();
    const channel = supabase
      .channel(`uni-chat-${university}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "university_messages",
          filter: `university=eq.${university}`,
        },
        async (payload) => {
          const row = payload.new as Omit<UniversityChatMessage, "profile">;
          const [hydrated] = await hydrateProfiles([row]);
          setMessages((prev) =>
            prev.some((m) => m.id === hydrated.id) ? prev : [...prev, hydrated]
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "university_messages",
          filter: `university=eq.${university}`,
        },
        (payload) => {
          const row = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== row.id));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [university, fetchMessages, hydrateProfiles]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !user || !university) return false;
      setSending(true);
      const { error } = await supabase.from("university_messages").insert({
        content: trimmed,
        university,
        user_id: user.id,
      });
      setSending(false);
      if (error) {
        console.error(error);
        toast.error("Couldn't send message");
        return false;
      }
      return true;
    },
    [user, university]
  );

  const deleteMessage = useCallback(async (id: string) => {
    const { error } = await supabase.from("university_messages").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Couldn't delete message");
    }
  }, []);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    deleteMessage,
    isOwn: (m: UniversityChatMessage) => m.user_id === user?.id,
  };
}
