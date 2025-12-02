import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Star, TrendingUp, Award, Flame, Loader2 } from "lucide-react";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useStudyGroups } from "@/hooks/useStudyGroups";

const ProgressPage = () => {
  const { progress, loading, getTotalStats } = useStudyProgress();
  const { myGroups } = useStudyGroups();

  const totals = getTotalStats();

  const badges = [
    { name: "Early Bird", icon: Star, description: "Complete 5 morning study sessions", unlocked: totals.sessions_completed >= 5 },
    { name: "Team Player", icon: Trophy, description: "Join 3 study groups", unlocked: myGroups.length >= 3 },
    { name: "Knowledge Seeker", icon: Award, description: "Study for 10 hours total", unlocked: totals.hours_studied >= 10 },
    { name: "Goal Crusher", icon: Target, description: "Complete 5 goals", unlocked: totals.goals_met >= 5 },
    { name: "Dedicated Learner", icon: Flame, description: "Complete 10 sessions", unlocked: totals.sessions_completed >= 10 },
  ];

  const stats = [
    { label: "Study Hours", value: Math.round(totals.hours_studied), max: 50, color: "from-gray-600 to-gray-400" },
    { label: "Goals Completed", value: totals.goals_met, max: 10, color: "from-gray-500 to-gray-300" },
    { label: "Sessions Done", value: totals.sessions_completed, max: 20, color: "from-slate-600 to-slate-400" },
    { label: "Groups Joined", value: myGroups.length, max: 5, color: "from-zinc-600 to-zinc-400" },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto max-w-6xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Progress & Achievements</h1>
          <p className="text-xl text-muted-foreground">
            Track your learning journey and earn rewards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{stat.label}</h3>
                  <span className="text-2xl font-bold gradient-text">
                    {stat.value}/{stat.max}
                  </span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden bg-muted">
                  <div 
                    className={`absolute h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min((stat.value / stat.max) * 100, 100)}%` }}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Achievements Summary */}
        <Card className="glass-card mb-12 glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Your Progress</h2>
                <p className="text-muted-foreground">
                  You've unlocked {unlockedCount} of {badges.length} achievements!
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold gradient-text">{Math.round((unlockedCount / badges.length) * 100)}%</div>
              <p className="text-sm text-muted-foreground">completion</p>
            </div>
          </div>
        </Card>

        {/* Badges */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Achievements & Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className={`glass-card text-center ${badge.unlocked ? 'glow' : 'opacity-50'}`}>
                  <div className={`inline-block p-6 rounded-full mb-4 ${
                    badge.unlocked 
                      ? 'bg-gradient-to-br from-primary to-secondary' 
                      : 'bg-muted'
                  }`}>
                    <badge.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{badge.description}</p>
                  {badge.unlocked ? (
                    <Badge className="bg-green-500">Unlocked</Badge>
                  ) : (
                    <Badge variant="outline">Locked</Badge>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress by Subject */}
        {progress.length > 0 && (
          <Card className="glass-card mt-12">
            <h2 className="text-2xl font-bold mb-6">Progress by Subject</h2>
            <div className="space-y-4">
              {progress.slice(0, 5).map((p, index) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-lg glass">
                  <div>
                    <h4 className="font-bold">{p.subject}</h4>
                    <p className="text-sm text-muted-foreground">Week of {p.week_start}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{Number(p.hours_studied).toFixed(1)}h studied</div>
                    <div className="text-sm text-muted-foreground">{p.sessions_completed} sessions</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default ProgressPage;
