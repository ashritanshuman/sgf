import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, Brain, Clock, Target, X, Loader2, GraduationCap } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { UNIVERSITIES } from "@/lib/universities";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { profile, loading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    university: "",
    major: "",
    year_of_study: "",
    skill_level: "" as "beginner" | "intermediate" | "advanced" | "expert" | "",
    learning_style: "" as "visual" | "auditory" | "reading" | "kinesthetic" | "",
    subjects: [] as string[],
    interests: [] as string[],
    availability: {} as Record<string, boolean>,
  });

  const [newSubject, setNewSubject] = useState("");
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        university: profile.university || "",
        major: profile.major || "",
        year_of_study: profile.year_of_study || "",
        skill_level: profile.skill_level || "",
        learning_style: profile.learning_style || "",
        subjects: profile.subjects || [],
        interests: profile.interests || [],
        availability: (profile.availability as Record<string, boolean>) || {},
      });
    }
  }, [profile]);

  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData({ ...formData, subjects: [...formData.subjects, newSubject.trim()] });
      setNewSubject("");
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
      setNewInterest("");
    }
  };

  const removeSubject = (subject: string) => {
    setFormData({ ...formData, subjects: formData.subjects.filter(s => s !== subject) });
  };

  const removeInterest = (interest: string) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
  };

  const toggleAvailability = (time: string) => {
    setFormData({
      ...formData,
      availability: { ...formData.availability, [time]: !formData.availability[time] },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile({
      full_name: formData.full_name || null,
      bio: formData.bio || null,
      university: formData.university || null,
      major: formData.major || null,
      year_of_study: formData.year_of_study || null,
      skill_level: formData.skill_level || null,
      learning_style: formData.learning_style || null,
      subjects: formData.subjects,
      interests: formData.interests,
      availability: formData.availability,
    });
    setSaving(false);
    if (success) {
      navigate("/profile");
    }
  };

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
              <div>
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell others about your learning journey..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">University</Label>
                  <Select
                    value={formData.university}
                    onValueChange={(value) => setFormData({ ...formData, university: value })}
                  >
                    <SelectTrigger id="university">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {UNIVERSITIES.map((university) => (
                        <SelectItem key={university} value={university}>
                          {university}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="major">Major/Department</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="Computer Science"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="year">Academic Year</Label>
                <Select
                  value={formData.year_of_study}
                  onValueChange={(value) => setFormData({ ...formData, year_of_study: value })}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
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
                  {formData.subjects.map((subject) => (
                    <Badge key={subject} className="gap-1">
                      {subject}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSubject(subject)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
                    placeholder="Add a subject..."
                  />
                  <Button type="button" onClick={addSubject}>Add</Button>
                </div>
              </div>

              <div>
                <Label>Interests & Learning Goals</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {formData.interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="gap-1">
                      {interest}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                    placeholder="Add an interest..."
                  />
                  <Button type="button" variant="outline" onClick={addInterest}>Add</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="skill-level">Overall Skill Level</Label>
                  <Select
                    value={formData.skill_level}
                    onValueChange={(value: "beginner" | "intermediate" | "advanced" | "expert") => 
                      setFormData({ ...formData, skill_level: value })
                    }
                  >
                    <SelectTrigger id="skill-level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="learning-style">Preferred Learning Style</Label>
                  <Select
                    value={formData.learning_style}
                    onValueChange={(value: "visual" | "auditory" | "reading" | "kinesthetic") => 
                      setFormData({ ...formData, learning_style: value })
                    }
                  >
                    <SelectTrigger id="learning-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
                      <SelectItem value="kinesthetic">Practical/Kinesthetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    <Button
                      key={time}
                      type="button"
                      variant={formData.availability[time] ? "default" : "outline"}
                      className="w-full"
                      onClick={() => toggleAvailability(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Target className="mr-2 h-5 w-5" />
              )}
              Save Profile
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
