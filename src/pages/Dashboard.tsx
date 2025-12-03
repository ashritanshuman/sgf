import { motion } from "framer-motion";
import {
  Users,
  MessageCircle,
  Calendar,
  TrendingUp,
  Bell,
  BookOpen,
  Trophy,
  Clock,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStudyGroups } from "@/hooks/useStudyGroups";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useProfile } from "@/hooks/useProfile";
import { format, isAfter } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { myGroups, groups, loading: groupsLoading } = useStudyGroups();
  const { getTotalStats, loading: progressLoading } = useStudyProgress();
  const { sessions, loading: sessionsLoading } = useStudySessions();
  const { profile, loading: profileLoading } = useProfile();

  const isLoading = groupsLoading || progressLoading || sessionsLoading || profileLoading;
  const totals = getTotalStats();

  // Get upcoming sessions (future sessions only)
  const upcomingSessions = sessions
    .filter(session => isAfter(new Date(session.scheduled_at), new Date()))
    .slice(0, 3);

  // Calculate achievements based on real data
  const achievementCount = [
    totals.sessions_completed >= 5,
    myGroups.length >= 3,
    totals.hours_studied >= 10,
    totals.goals_met >= 5,
    totals.sessions_completed >= 10,
  ].filter(Boolean).length;

  // Calculate progress percentage
  const progressPercent = Math.min(
    Math.round(((totals.hours_studied / 50) + (totals.sessions_completed / 20) + (myGroups.length / 5)) / 3 * 100),
    100
  );

  const stats = [
    { icon: Users, label: "Active Groups", value: myGroups.length.toString(), color: "from-gray-800 to-gray-600" },
    { icon: Clock, label: "Study Hours", value: Math.round(totals.hours_studied).toString(), color: "from-gray-700 to-gray-500" },
    { icon: Trophy, label: "Achievements", value: achievementCount.toString(), color: "from-gray-600 to-gray-400" },
    { icon: TrendingUp, label: "Progress", value: `${progressPercent}%`, color: "from-gray-500 to-gray-300" },
  ];

  const sessionColors = [
    "from-gray-800 to-gray-600",
    "from-gray-700 to-gray-500",
    "from-gray-600 to-gray-400",
  ];

  // Get recent activity from groups the user is in
  const recentActivity = [
    myGroups.length > 0 ? { message: `You're a member of ${myGroups.length} study group${myGroups.length > 1 ? 's' : ''}`, time: "Current" } : null,
    totals.sessions_completed > 0 ? { message: `You've completed ${totals.sessions_completed} study session${totals.sessions_completed > 1 ? 's' : ''}`, time: "All time" } : null,
    upcomingSessions.length > 0 ? { message: `${upcomingSessions.length} upcoming session${upcomingSessions.length > 1 ? 's' : ''} scheduled`, time: "Soon" } : null,
  ].filter(Boolean).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto"
      >
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            {upcomingSessions.length > 0 
              ? `You have ${upcomingSessions.length} upcoming session${upcomingSessions.length > 1 ? 's' : ''}`
              : "Here's what's happening with your study groups today"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card glow-hover"
            >
              <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 glass-card glow-hover"
          >
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
            </div>
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming sessions scheduled</p>
                  <button 
                    onClick={() => navigate('/scheduler')}
                    className="mt-3 text-primary hover:underline"
                  >
                    Schedule a session
                  </button>
                </div>
              ) : (
                upcomingSessions.map((session, index) => {
                  const group = groups.find(g => g.id === session.group_id);
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      whileHover={{ x: 5 }}
                      className="p-4 rounded-xl glass border border-border/10 cursor-pointer"
                      onClick={() => navigate('/scheduler')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${sessionColors[index % sessionColors.length]}`}>
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold">{session.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(session.scheduled_at), "EEE, MMM d 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {group && (
                            <>
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{group.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Activity / Notifications */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card glow-hover"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Activity</h2>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                  <button 
                    onClick={() => navigate('/groups')}
                    className="mt-3 text-primary hover:underline"
                  >
                    Join a group to get started
                  </button>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ x: 5 }}
                    className="p-3 rounded-lg glass border border-border/10"
                  >
                    <p className="text-sm mb-1">{activity?.message}</p>
                    <p className="text-xs text-muted-foreground">{activity?.time}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card glow-hover text-left"
            onClick={() => navigate('/chat')}
          >
            <MessageCircle className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold text-lg mb-1">Start a Chat</h3>
            <p className="text-sm text-muted-foreground">Message your study groups</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card glow-hover text-left"
            onClick={() => navigate('/groups')}
          >
            <Users className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold text-lg mb-1">Find Groups</h3>
            <p className="text-sm text-muted-foreground">Discover new study partners</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card glow-hover text-left"
            onClick={() => navigate('/scheduler')}
          >
            <Calendar className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold text-lg mb-1">Schedule Session</h3>
            <p className="text-sm text-muted-foreground">Plan your next study time</p>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
