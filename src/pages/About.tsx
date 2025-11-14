import { motion } from "framer-motion";
import { Heart, Target, Users, Lightbulb } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Peer Learning",
      description: "We believe in the power of collaborative learning and peer support to enhance academic success.",
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "Our AI-powered algorithm ensures you connect with students who complement your learning style.",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a supportive community where every student can thrive and achieve their goals.",
    },
    {
      icon: Lightbulb,
      title: "Motivation",
      description: "Gamification and social features keep you engaged and motivated throughout your learning journey.",
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">About Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Study Group Finder was created to revolutionize how students collaborate and learn together.
            We connect ambitious learners worldwide to achieve academic excellence through peer support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card glow-hover"
          >
            <h2 className="text-3xl font-bold mb-4 gradient-text">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              To democratize education by making collaborative learning accessible to everyone. We believe that
              when students work together, they not only learn better but also build lasting connections and
              develop essential life skills. Our platform breaks down geographical barriers and creates a global
              classroom where knowledge flows freely.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card glow-hover"
          >
            <h2 className="text-3xl font-bold mb-4 gradient-text">Our Vision</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              To create the world's largest community of collaborative learners where every student has access
              to the perfect study group. We envision a future where isolation in learning is a thing of the past,
              and students everywhere can find peers who share their academic interests, goals, and challenges.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card text-center glow-hover"
              >
                <div className="inline-block p-4 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4">
                  <value.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card text-center max-w-4xl mx-auto p-12 glow"
        >
          <h2 className="text-3xl font-bold mb-4 gradient-text">Join Our Growing Community</h2>
          <p className="text-xl text-muted-foreground mb-6">
            Over 10,000 students have already discovered the power of collaborative learning.
            Be part of something bigger.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text">10K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">500+</div>
              <div className="text-muted-foreground">Study Groups</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">50+</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">95%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
