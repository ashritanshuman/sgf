import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Star, TrendingUp, Award, Flame } from "lucide-react";

const ProgressPage = () => {
  const badges = [
    { name: "Early Bird", icon: Star, description: "Complete 5 morning study sessions", unlocked: true },
    { name: "Team Player", icon: Trophy, description: "Join 3 study groups", unlocked: true },
    { name: "Knowledge Sharer", icon: Award, description: "Upload 10 resources", unlocked: true },
    { name: "Consistent Learner", icon: Flame, description: "Study for 7 days straight", unlocked: false },
    { name: "Master Achiever", icon: Target, description: "Complete all goals this month", unlocked: false },
  ];

  const stats = [
    { label: "Study Hours", value: 42, max: 50, color: "from-blue-500 to-cyan-500" },
    { label: "Goals Completed", value: 8, max: 10, color: "from-green-500 to-emerald-500" },
    { label: "Resources Shared", value: 15, max: 20, color: "from-purple-500 to-pink-500" },
    { label: "Group Sessions", value: 12, max: 15, color: "from-orange-500 to-red-500" },
  ];

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
                <Progress value={(stat.value / stat.max) * 100} className="h-3" />
                <div className={`h-3 w-full bg-gradient-to-r ${stat.color} rounded-full mt-[-12px] opacity-80`} 
                     style={{ width: `${(stat.value / stat.max) * 100}%` }} />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Leaderboard Position */}
        <Card className="glass-card mb-12 glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Leaderboard Rank</h2>
                <p className="text-muted-foreground">You're in the top 15% this week!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold gradient-text">#42</div>
              <p className="text-sm text-green-500">↑ 5 places</p>
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
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
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

        {/* Weekly Activity */}
        <Card className="glass-card mt-12">
          <h2 className="text-2xl font-bold mb-6">Weekly Activity</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm text-muted-foreground mb-2">{day}</div>
                <div className={`h-24 rounded-lg ${
                  index < 5 ? 'bg-gradient-to-t from-primary to-secondary glow' : 'bg-muted'
                }`} />
                <div className="text-xs mt-2 font-bold">{index < 5 ? `${2 + index}h` : '-'}</div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProgressPage;
