import { motion } from "framer-motion";
import {
  Users,
  MessageCircle,
  Calendar,
  BookOpen,
  Trophy,
  Brain,
  Video,
  Bell,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "User Profiles",
      description: "Create detailed profiles showcasing your academic interests, goals, and learning preferences.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: Brain,
      title: "Smart Matching",
      description: "AI-powered algorithm matches you with compatible study partners based on your profile.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: MessageCircle,
      title: "Group Chat",
      description: "Real-time messaging with file sharing, voice notes, and collaborative features.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: Calendar,
      title: "Study Scheduler",
      description: "Coordinate study sessions with built-in calendar and automated reminders.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: BookOpen,
      title: "Resource Sharing",
      description: "Share notes, documents, and study materials securely with your group.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Earn badges, compete on leaderboards, and unlock achievements as you study.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: Video,
      title: "Video Sessions",
      description: "Host virtual study sessions with integrated video conferencing tools.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay updated with intelligent notifications about group activities and deadlines.",
      gradient: "from-primary to-secondary",
    },
  ];

  return (
    <div className="min-h-screen pt-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto"
      >
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Powerful Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create, manage, and thrive in your study groups.
            Discover the tools that make collaborative learning seamless and effective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="glass-card group cursor-pointer glow-hover relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--primary), var(--secondary))`,
                }}
              />
              <div className={`inline-block p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card max-w-4xl mx-auto p-12 text-center glow"
        >
          <h2 className="text-4xl font-bold mb-6 gradient-text">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students who are already transforming their learning experience.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Get Started for Free
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Features;
