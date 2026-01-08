import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Target, Sparkles, TrendingUp, BookOpen, MessageCircle } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description: "AI-powered algorithm matches you with students who share your goals and learning style.",
    },
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Set academic goals and track progress together with your study group.",
    },
    {
      icon: Sparkles,
      title: "Gamification",
      description: "Earn badges, climb leaderboards, and stay motivated through friendly competition.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics and insights.",
    },
    {
      icon: BookOpen,
      title: "Resource Sharing",
      description: "Share notes, materials, and study resources seamlessly with your group.",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Collaborate instantly with integrated messaging and video calls.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-24 lg:pb-32 px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 rounded-full glass text-sm font-medium">
              welcome back
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 gradient-text"
          >
            Find Your Perfect
            <br />
            Study Group
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
          >
            Connect. Collaborate. Grow together.
            <br />
            Join thousands of students achieving academic excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link to="/groups" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Join a Group
              </Button>
            </Link>
          </motion.div>

          <div className="mt-24 lg:mt-32 relative">
            <div className="glass-card max-w-5xl mx-auto p-4 sm:p-8 lg:p-12 glow">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Study Groups</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to enhance your learning experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card group cursor-pointer glow-hover"
              >
                <div className="p-3 rounded-xl bg-foreground w-fit mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-background" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto"
        >
          <div className="glass-card text-center max-w-3xl mx-auto glow p-6 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              Join our community today and start collaborating with students worldwide.
            </p>
            <Link to="/signup">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
