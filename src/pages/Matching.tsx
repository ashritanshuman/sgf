import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Users, Brain, Clock, BookOpen, Star } from "lucide-react";

const Matching = () => {
  const [matchScore, setMatchScore] = useState(85);

  const matchedUsers = [
    {
      name: "Sarah Johnson",
      subjects: ["Mathematics", "Physics"],
      level: "Intermediate",
      availability: "Evenings",
      matchScore: 92,
      learningStyle: "Visual",
    },
    {
      name: "Mike Chen",
      subjects: ["Computer Science", "Mathematics"],
      level: "Advanced",
      availability: "Weekends",
      matchScore: 88,
      learningStyle: "Practical",
    },
    {
      name: "Emma Davis",
      subjects: ["Biology", "Chemistry"],
      level: "Beginner",
      availability: "Mornings",
      matchScore: 85,
      learningStyle: "Auditory",
    },
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
          <h1 className="text-5xl font-bold mb-4 gradient-text">Smart Matching</h1>
          <p className="text-xl text-muted-foreground">
            Find your perfect study partners based on AI-powered matching
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Matching Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="subject">Primary Subject</Label>
                  <Select>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="bio">Biology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Skill Level</Label>
                  <Select>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="learning-style">Learning Style</Label>
                  <Select>
                    <SelectTrigger id="learning-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select>
                    <SelectTrigger id="availability">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mornings">Mornings</SelectItem>
                      <SelectItem value="afternoons">Afternoons</SelectItem>
                      <SelectItem value="evenings">Evenings</SelectItem>
                      <SelectItem value="weekends">Weekends</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Minimum Match Score: {matchScore}%</Label>
                  <Slider
                    value={[matchScore]}
                    onValueChange={(value) => setMatchScore(value[0])}
                    min={50}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                  <Brain className="mr-2 h-4 w-4" />
                  Find Matches
                </Button>
              </div>
            </Card>
          </div>

          {/* Matched Users */}
          <div className="lg:col-span-2 space-y-4">
            {matchedUsers.map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card glow-hover hover:scale-[1.02] transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{user.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-green-500">{user.matchScore}% Match</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                      {user.level}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div className="flex gap-2 flex-wrap">
                        {user.subjects.map((subject, i) => (
                          <Badge key={i} variant="outline">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.availability}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.learningStyle} Learner</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">Send Request</Button>
                    <Button variant="outline">View Profile</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Matching;
