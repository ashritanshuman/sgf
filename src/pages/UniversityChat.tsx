import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Trash2, Users, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useUniversityChat } from "@/hooks/useUniversityChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const initials = (name?: string | null) =>
  (name || "U")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const UniversityChat = () => {
  const { profile, loading: profileLoading } = useProfile();
  const university = profile?.university || null;
  const { messages, loading, sending, sendMessage, deleteMessage, isOwn } =
    useUniversityChat(university);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const ok = await sendMessage(draft);
    if (ok) setDraft("");
  };

  if (profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h1 className="text-2xl font-semibold mb-2">Pick your university first</h1>
        <p className="text-muted-foreground mb-6">
          The university chat is scoped to students from your campus.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/profile-setup">Set university</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">University Chat</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Users className="h-3.5 w-3.5" />
            {university}
          </p>
        </div>
      </header>

      <Card className="rounded-lg overflow-hidden flex flex-col h-[70vh]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground">
              Be the first to say hi to {university} 👋
            </div>
          ) : (
            messages.map((m) => {
              const own = isOwn(m);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2 group", own && "flex-row-reverse")}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={m.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {initials(m.profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("max-w-[75%] flex flex-col", own && "items-end")}>
                    <div className="text-[11px] text-muted-foreground mb-0.5 px-1">
                      <span className="font-medium text-foreground/80">
                        {own ? "You" : m.profile?.full_name || "Student"}
                      </span>
                      <span className="mx-1">·</span>
                      {formatTime(m.created_at)}
                    </div>
                    <div className="flex items-end gap-1">
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words border",
                          own
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-foreground border-border"
                        )}
                      >
                        {m.content}
                      </div>
                      {own && (
                        <button
                          type="button"
                          onClick={() => deleteMessage(m.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                          aria-label="Delete message"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="border-t p-3 flex gap-2 bg-background">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${university}…`}
            maxLength={1000}
            disabled={sending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shrink-0"
            disabled={sending || !draft.trim()}
            aria-label="Send"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default UniversityChat;
