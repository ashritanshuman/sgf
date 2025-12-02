import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Users, Brain, Clock, BookOpen, Star, Loader2 } from "lucide-react";
import { useProfiles } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";

const Matching = () => {
  const { user } = useAuth();
  const { profiles, loading } = useProfiles();
  const [matchScore, setMatchScore] = useState(50);
  const [filters, setFilters] = useState({
    subject: "",
    level: "",
    learningStyle: "",
    availability: "",
  });

  // Filter out current user and apply filters
  const filteredProfiles = profiles.filter(profile => {
    if (profile.user_id === user?.id) return false;
    if (filters.level && profile.skill_level !== filters.level) return false;
    if (filters.learningStyle && profile.learning_style !== filters.learningStyle) return false;
    if (filters.subject && !profile.subjects?.includes(filters.subject)) return false;
    return true;
  });

  // Calculate a simple match score based on common interests
  const calculateMatchScore = (profile: typeof profiles[0]) => {
    let score = 70;
    if (profile.subjects && profile.subjects.length > 0) score += 10;
    if (profile.learning_style) score += 5;
    if (profile.skill_level) score += 5;
    if (profile.availability && Object.keys(profile.availability).length > 0) score += 10;
    return Math.min(score, 99);
  };

  const matchedUsers = filteredProfiles
    .map(profile => ({
      ...profile,
      matchScore: calculateMatchScore(profile),
    }))
    .filter(profile => profile.matchScore >= matchScore)
    .sort((a, b) => b.matchScore - a.matchScore);

  // Get unique subjects from all profiles
  const allSubjects = [...new Set(profiles.flatMap(p => p.subjects || []))];

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
            Find your perfect study partners based on compatible profiles
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
                  <Select
                    value={filters.subject}
                    onValueChange={(value) => setFilters({ ...filters, subject: value })}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Subjects</SelectItem>
                      {allSubjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Skill Level</Label>
                  <Select
                    value={filters.level}
                    onValueChange={(value) => setFilters({ ...filters, level: value })}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Level</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="learning-style">Learning Style</Label>
                  <Select
                    value={filters.learningStyle}
                    onValueChange={(value) => setFilters({ ...filters, learningStyle: value })}
                  >
                    <SelectTrigger id="learning-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Style</SelectItem>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="kinesthetic">Practical</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
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

                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  onClick={() => setFilters({ subject: "", level: "", learningStyle: "", availability: "" })}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Matched Users */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : matchedUsers.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No matches found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or lowering the match score</p>
              </Card>
            ) : (
              matchedUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card glow-hover hover:scale-[1.02] transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="h-8 w-8 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{user.full_name || "Anonymous User"}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-green-500">{user.matchScore}% Match</span>
                          </div>
                        </div>
                      </div>
                      {user.skill_level && (
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground capitalize">
                          {user.skill_level}
                        </Badge>
                      )}
                    </div>

                    {user.bio && (
                      <p className="text-sm text-muted-foreground mb-4">{user.bio}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {user.subjects && user.subjects.length > 0 && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex gap-2 flex-wrap">
                            {user.subjects.slice(0, 3).map((subject, i) => (
                              <Badge key={i} variant="outline">{subject}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {user.learning_style && (
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{user.learning_style} Learner</span>
                        </div>
                      )}
                      {user.university && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.university}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">Send Request</Button>
                      <Button variant="outline">View Profile</Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Matching;
