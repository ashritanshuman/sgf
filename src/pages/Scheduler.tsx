import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar, Clock, Users, Plus, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useStudyGroups } from "@/hooks/useStudyGroups";
import { format, startOfWeek, addDays, isWithinInterval } from "date-fns";

const Scheduler = () => {
  const { sessions, loading, createSession } = useStudySessions();
  const { groups, myGroups } = useStudyGroups();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    scheduled_at: "",
    duration_minutes: 60,
    is_virtual: true,
    meeting_link: "",
    group_id: "",
  });

  const myJoinedGroups = groups.filter(g => myGroups.includes(g.id));
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSessionsForDay = (date: Date) => {
    return sessions.filter(s => {
      const sessionDate = new Date(s.scheduled_at);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const handleCreateSession = async () => {
    if (!newSession.title || !newSession.scheduled_at) return;
    const result = await createSession({
      title: newSession.title,
      description: newSession.description || null,
      scheduled_at: newSession.scheduled_at,
      duration_minutes: newSession.duration_minutes,
      is_virtual: newSession.is_virtual,
      meeting_link: newSession.meeting_link || null,
      group_id: newSession.group_id || null,
    });
    if (result) {
      setDialogOpen(false);
      setNewSession({
        title: "",
        description: "",
        scheduled_at: "",
        duration_minutes: 60,
        is_virtual: true,
        meeting_link: "",
        group_id: "",
      });
    }
  };

  const getGradient = (index: number) => {
    const gradients = [
      "from-gray-800 to-gray-600",
      "from-gray-700 to-gray-500",
      "from-gray-600 to-gray-400",
      "from-slate-700 to-slate-500",
    ];
    return gradients[index % gradients.length];
  };

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return "Personal Session";
    const group = groups.find(g => g.id === groupId);
    return group?.name || "Study Group";
  };

  return (
    <div className="min-h-screen pt-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">Study Scheduler</h1>
            <p className="text-xl text-muted-foreground">
              Manage your study sessions and stay organized
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold glow"
              >
                <Plus className="h-5 w-5" />
                Schedule Session
              </motion.button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10">
              <DialogHeader>
                <DialogTitle>Schedule New Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    placeholder="e.g., Calculus Review"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSession.description}
                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                    placeholder="What will you study?"
                  />
                </div>
                <div>
                  <Label htmlFor="datetime">Date & Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={newSession.scheduled_at}
                    onChange={(e) => setNewSession({ ...newSession, scheduled_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={newSession.duration_minutes.toString()}
                    onValueChange={(value) => setNewSession({ ...newSession, duration_minutes: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {myJoinedGroups.length > 0 && (
                  <div>
                    <Label>Study Group (optional)</Label>
                    <Select
                      value={newSession.group_id}
                      onValueChange={(value) => setNewSession({ ...newSession, group_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Personal Session</SelectItem>
                        {myJoinedGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="link">Meeting Link (optional)</Label>
                  <Input
                    id="link"
                    value={newSession.meeting_link}
                    onChange={(e) => setNewSession({ ...newSession, meeting_link: e.target.value })}
                    placeholder="https://zoom.us/..."
                  />
                </div>
                <Button onClick={handleCreateSession} className="w-full bg-gradient-to-r from-primary to-secondary">
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar View Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass-card mb-8 glow-hover"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">This Week's Schedule</h2>
          </div>
          
          <div className="grid grid-cols-7 gap-4 mb-6">
            {weekDays.map((day, index) => {
              const daySessions = getSessionsForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className={`text-center p-3 rounded-lg ${
                    isToday
                      ? "glass border border-primary/50 bg-primary/10"
                      : daySessions.length > 0
                      ? "glass border border-primary/30"
                      : "glass border border-white/10"
                  }`}
                >
                  <div className="text-sm text-muted-foreground mb-1">{format(day, "EEE")}</div>
                  <div className="text-xl font-bold">{format(day, "d")}</div>
                  {daySessions.length > 0 && (
                    <div className="mt-2 w-2 h-2 rounded-full bg-primary mx-auto" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-12 glass-card">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No sessions scheduled</h3>
            <p className="text-muted-foreground">Create your first study session to get started!</p>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="glass-card glow-hover relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getGradient(index)}`} />
              <div className="pl-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${getGradient(index)}`}>
                        {session.is_virtual ? (
                          <Video className="h-5 w-5 text-white" />
                        ) : (
                          <Users className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{session.title}</h3>
                        <p className="text-sm text-muted-foreground">{getGroupName(session.group_id)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {format(new Date(session.scheduled_at), "EEE, MMM d")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        {format(new Date(session.scheduled_at), "h:mm a")} ({session.duration_minutes} min)
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="glass border-primary/50 hover:border-primary">
                      View Details
                    </Button>
                    {session.meeting_link && (
                      <Button
                        className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                        onClick={() => window.open(session.meeting_link!, "_blank")}
                      >
                        Join Session
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Scheduler;
