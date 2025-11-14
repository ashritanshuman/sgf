import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, Brain, Clock, Target, X } from "lucide-react";

const ProfileSetup = () => {
  const [subjects, setSubjects] = useState(["Mathematics", "Physics"]);
  const [interests, setInterests] = useState(["Problem Solving", "Theory"]);

  const removeItem = (arr: string[], setter: (arr: string[]) => void, item: string) => {
    setter(arr.filter(i => i !== item));
  };

  return (
    <div className="min-h-screen pt-32 px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto max-w-4xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Academic Profile Setup</h1>
          <p className="text-xl text-muted-foreground">
            Help us find your perfect study partners
          </p>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstname">First Name</Label>
                  <Input id="firstname" placeholder="John" />
                </div>
                <div>
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input id="lastname" placeholder="Doe" />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell others about your learning journey..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Academic Year</Label>
                  <Select>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Year</SelectItem>
                      <SelectItem value="2">Second Year</SelectItem>
                      <SelectItem value="3">Third Year</SelectItem>
                      <SelectItem value="4">Fourth Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="major">Major/Department</Label>
                  <Input id="major" placeholder="Computer Science" />
                </div>
              </div>
            </div>
          </Card>

          {/* Academic Details */}
          <Card className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Academic Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Current Subjects</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {subjects.map((subject) => (
                    <Badge key={subject} className="gap-1">
                      {subject}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem(subjects, setSubjects, subject)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add a subject..." />
                  <Button>Add</Button>
                </div>
              </div>

              <div>
                <Label>Interests & Learning Goals</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="gap-1">
                      {interest}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem(interests, setInterests, interest)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add an interest..." />
                  <Button variant="outline">Add</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="skill-level">Overall Skill Level</Label>
                  <Select>
                    <SelectTrigger id="skill-level">
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
                  <Label htmlFor="learning-style">Preferred Learning Style</Label>
                  <Select>
                    <SelectTrigger id="learning-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="practical">Practical/Kinesthetic</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Learning Preferences */}
          <Card className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Learning Preferences</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="strengths">Strengths</Label>
                <Textarea 
                  id="strengths" 
                  placeholder="What are you good at? (e.g., Quick problem solving, Visual thinking...)"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="difficulties">Areas for Improvement</Label>
                <Textarea 
                  id="difficulties" 
                  placeholder="What would you like to improve? (e.g., Abstract concepts, Time management...)"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="goals">Academic Goals</Label>
                <Textarea 
                  id="goals" 
                  placeholder="What do you want to achieve? (e.g., Master calculus, Prepare for exams...)"
                  rows={2}
                />
              </div>
            </div>
          </Card>

          {/* Availability */}
          <Card className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Availability</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Preferred Study Times</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {["Mornings", "Afternoons", "Evenings", "Weekends"].map((time) => (
                    <Button key={time} variant="outline" className="w-full">
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">PST (UTC-8)</SelectItem>
                    <SelectItem value="est">EST (UTC-5)</SelectItem>
                    <SelectItem value="gmt">GMT (UTC+0)</SelectItem>
                    <SelectItem value="cet">CET (UTC+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg">
              Cancel
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
              <Target className="mr-2 h-5 w-5" />
              Save Profile
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
