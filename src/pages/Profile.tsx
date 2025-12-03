import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User, Mail, BookOpen, Target, Edit2, Camera, Loader2, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import { useStudyGroups } from "@/hooks/useStudyGroups";
import { useNavigate } from "react-router-dom";

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
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
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

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto max-w-5xl"
      >
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass-card mb-8 glow-hover relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary to-secondary" />
          <div className="relative pt-20 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                  <div className="w-full h-full rounded-full glass flex items-center justify-center text-4xl">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      "👤"
                    )}
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 p-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </motion.div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{profile?.full_name || "Anonymous User"}</h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {profile?.bio || "No bio yet"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {badges.length > 0 ? badges.map((badge, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="px-3 py-1 rounded-full glass border border-primary/30 text-sm"
                    >
                      {badge}
                    </motion.span>
                  )) : (
                    <span className="text-sm text-muted-foreground">Complete activities to earn badges!</span>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="glass border-primary/50 hover:border-primary"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
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
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card text-center glow-hover"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="glass-card glow-hover"
          >
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <Input
                  disabled={!isEditing}
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-transparent border-white/10"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <Input
                  disabled
                  value={user?.email || ""}
                  className="bg-transparent border-white/10"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <BookOpen className="h-4 w-4" />
                  Bio
                </label>
                <Textarea
                  disabled={!isEditing}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-transparent border-white/10 min-h-[100px]"
                />
              </div>
              {isEditing && (
                <Button onClick={handleSave} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Save Changes
                </Button>
              )}
            </div>
          </motion.div>

          {/* Interests & Goals */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="glass-card glow-hover">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Academic Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {interests.length > 0 ? interests.map((interest, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.1 }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white cursor-pointer"
                  >
                    {interest}
                  </motion.span>
                )) : (
                  <p className="text-muted-foreground">Update your profile to add subjects</p>
                )}
              </div>
            </div>

            <div className="glass-card glow-hover">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Profile Details
              </h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>University: {profile?.university || "Not set"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span>Major: {profile?.major || "Not set"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Year: {profile?.year_of_study || "Not set"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="capitalize">Learning Style: {profile?.learning_style || "Not set"}</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* My Created Groups Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 glass-card glow-hover"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Groups You Created
            </h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/groups')}
              className="glass border-primary/50"
            >
              View All Groups
            </Button>
          </div>
          
          {myCreatedGroups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">You haven't created any groups yet</p>
              <Button 
                onClick={() => navigate('/groups')}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Create Your First Group
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCreatedGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-4 border border-border/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{group.name}</h3>
                    <span className="px-2 py-1 rounded-full text-xs glass border border-primary/30 capitalize">
                      {group.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{group.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {group.description || "No description"}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Group
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Group</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{group.name}"? This action cannot be undone and will remove all members from the group.
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
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
