import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User, Mail, BookOpen, Target, Edit2, Camera, Loader2, Users, Trash2, GraduationCap, Calendar, Brain, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useStudyGroups } from "@/hooks/useStudyGroups";
import { useNavigate } from "react-router-dom";
import { UNIVERSITIES } from "@/lib/universities";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { getTotalStats } = useStudyProgress();
  const { myGroups, myCreatedGroups, deleteGroup } = useStudyGroups();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    university: "",
    major: "",
    year_of_study: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        university: profile.university || "",
        major: profile.major || "",
        year_of_study: profile.year_of_study || "",
      });
    }
  }, [profile]);

  const stats = getTotalStats();
  const statsDisplay = [
    { label: "Study Hours", value: Math.round(stats.hours_studied).toString(), icon: "⏰" },
    { label: "Groups Joined", value: myGroups.length.toString(), icon: "👥" },
    { label: "Sessions", value: stats.sessions_completed.toString(), icon: "📚" },
    { label: "Goals Met", value: stats.goals_met.toString(), icon: "🎯" },
  ];

  const interests = profile?.subjects || [];
  const badges = [
    myGroups.length >= 1 ? "👥 Team Player" : null,
    stats.hours_studied >= 10 ? "⏰ Dedicated Learner" : null,
    stats.sessions_completed >= 5 ? "📚 Session Master" : null,
    stats.goals_met >= 3 ? "🎯 Goal Achiever" : null,
  ].filter(Boolean);

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      university: profile?.university || "",
      major: profile?.major || "",
      year_of_study: profile?.year_of_study || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto max-w-6xl"
      >
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden border border-border/50 bg-card mb-8"
        >
          {/* Cover Image */}
          <div className="h-40 md:h-52 bg-gradient-to-r from-primary via-primary/80 to-secondary relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bS0xMCAwYzAtMiAyLTQgMi00czIgMiAyIDQtMiA0LTIgNC0yLTItMi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative group cursor-pointer"
              >
                <div className="w-32 h-32 rounded-full border-4 border-background bg-gradient-to-br from-primary to-secondary p-0.5">
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-5xl overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 p-2 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Camera className="h-4 w-4" />
                </div>
              </motion.div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-end pt-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Name & Bio Section */}
            <div className="mt-8 md:mt-4">
              {isEditing ? (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your name"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="bg-background min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name || "Anonymous User"}</h1>
                  <p className="text-muted-foreground mt-1 max-w-2xl">
                    {profile?.bio || "No bio added yet. Click edit to add one!"}
                  </p>
                </>
              )}
            </div>

            {/* Quick Info Pills */}
            <div className="flex flex-wrap gap-3 mt-4">
              {profile?.university && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <GraduationCap className="h-4 w-4" />
                  {profile.university}
                </span>
              )}
              {profile?.major && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  {profile.major}
                </span>
              )}
              {profile?.year_of_study && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  {profile.year_of_study}
                </span>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                {badges.map((badge, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-sm"
                  >
                    {badge}
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {statsDisplay.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-border/50 bg-card p-5 text-center"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - About & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="rounded-xl border border-border/50 bg-card p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                About
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-3 border-b border-border/30">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email || "Not available"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-3 border-b border-border/30">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">University</p>
                    {isEditing ? (
                      <Select
                        value={formData.university}
                        onValueChange={(value) => setFormData({ ...formData, university: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background">
                          <SelectValue placeholder="Select your university" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIVERSITIES.map((uni) => (
                            <SelectItem key={uni} value={uni}>
                              {uni}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{profile?.university || "Not set"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 py-3 border-b border-border/30">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Major</p>
                    {isEditing ? (
                      <Input
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        placeholder="Enter your major"
                        className="mt-1 bg-background"
                      />
                    ) : (
                      <p className="font-medium">{profile?.major || "Not set"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 py-3 border-b border-border/30">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Year of Study</p>
                    {isEditing ? (
                      <Select
                        value={formData.year_of_study}
                        onValueChange={(value) => setFormData({ ...formData, year_of_study: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                          <SelectItem value="Graduate">Graduate</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">{profile?.year_of_study || "Not set"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 py-3">
                  <Brain className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Learning Style</p>
                    <p className="font-medium capitalize">{profile?.learning_style || "Not set"}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Created Groups */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="rounded-xl border border-border/50 bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Your Groups
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/groups')}
                >
                  View All
                </Button>
              </div>
              
              {myCreatedGroups.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">You haven't created any groups yet</p>
                  <Button 
                    onClick={() => navigate('/groups')}
                    size="sm"
                  >
                    Create Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myCreatedGroups.slice(0, 3).map((group, index) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/30"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.subject}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary capitalize">
                          {group.difficulty}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Group</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{group.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteGroup(group.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  ))}
                  {myCreatedGroups.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{myCreatedGroups.length - 3} more groups
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Interests & Quick Actions */}
          <div className="space-y-6">
            {/* Academic Interests */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="rounded-xl border border-border/50 bg-card p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {interests.length > 0 ? interests.map((interest, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05, duration: 0.4 }}
                    className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm"
                  >
                    {interest}
                  </motion.span>
                )) : (
                  <p className="text-sm text-muted-foreground">No interests added yet</p>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="rounded-xl border border-border/50 bg-card p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/groups')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Browse Groups
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile-setup')}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Complete Profile Setup
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/progress')}
                >
                  <Target className="h-4 w-4 mr-2" />
                  View Progress
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
