import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Plus, Users, BookOpen, Loader2, Trash2, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudyGroups } from "@/hooks/useStudyGroups";
import { useGroupRequests } from "@/hooks/useGroupRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    subject: "",
    description: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced" | "expert",
    is_public: true,
    max_members: 10,
  });
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [requesterProfiles, setRequesterProfiles] = useState<Record<string, { full_name: string; university: string }>>({});

  const { groups, loading, createGroup, leaveGroup, deleteGroup, isMember, getMemberCount, refetch } = useStudyGroups();
  const { incomingRequests, sendJoinRequest, acceptRequest, rejectRequest, getRequestStatus } = useGroupRequests();
  const { user } = useAuth();
  const { profile } = useProfile();

  // Filter groups by user's university
  const universityGroups = groups.filter(group => 
    group.university === profile?.university || group.created_by === user?.id
  );

  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      for (const group of universityGroups) {
        counts[group.id] = await getMemberCount(group.id);
      }
      setMemberCounts(counts);
    };
    if (universityGroups.length > 0) fetchCounts();
  }, [universityGroups]);

  // Fetch requester profiles for incoming requests
  useEffect(() => {
    const fetchRequesterProfiles = async () => {
      if (incomingRequests.length === 0) return;
      
      const requesterIds = [...new Set(incomingRequests.map(r => r.requester_id))];
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, university')
        .in('user_id', requesterIds);
      
      if (data) {
        const profilesMap: Record<string, { full_name: string; university: string }> = {};
        data.forEach(p => {
          profilesMap[p.user_id] = { full_name: p.full_name || 'Unknown', university: p.university || 'Unknown' };
        });
        setRequesterProfiles(profilesMap);
      }
    };
    fetchRequesterProfiles();
  }, [incomingRequests]);

  const filteredGroups = universityGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.subject) return;
    const result = await createGroup({ ...newGroup, university: profile?.university || null });
    if (result) {
      setDialogOpen(false);
      setNewGroup({ name: "", subject: "", description: "", difficulty: "beginner", is_public: true, max_members: 10 });
    }
  };

  const handleRequestJoin = async (group: typeof groups[0]) => {
    if (group.created_by) {
      await sendJoinRequest(group.id, group.created_by, group.name);
    }
  };

  const getGradient = (index: number) => {
    const gradients = [
      "from-gray-800 to-gray-600",
      "from-gray-700 to-gray-500",
      "from-gray-600 to-gray-400",
      "from-slate-700 to-slate-500",
      "from-zinc-700 to-zinc-500",
    ];
    return gradients[index % gradients.length];
  };

  const getGroupForRequest = (groupId: string) => groups.find(g => g.id === groupId);

  return (
    <div className="min-h-screen pt-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 gradient-text">University Groups</h1>
            <p className="text-xl text-muted-foreground">
              {profile?.university ? `Groups from ${profile.university}` : "Select your university in profile to see groups"}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold glow"
              >
                <Plus className="h-5 w-5" />
                Create Group
              </motion.button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10">
              <DialogHeader>
                <DialogTitle>Create New Study Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="e.g., Advanced Calculus Study"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newGroup.subject}
                    onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Describe your study group..."
                  />
                </div>
                <div>
                  <Label>Difficulty Level</Label>
                  <Select
                    value={newGroup.difficulty}
                    onValueChange={(value: "beginner" | "intermediate" | "advanced" | "expert") => 
                      setNewGroup({ ...newGroup, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {profile?.university && (
                  <p className="text-sm text-muted-foreground">
                    This group will be visible to students from {profile.university}
                  </p>
                )}
                <Button onClick={handleCreateGroup} className="w-full bg-gradient-to-r from-primary to-secondary">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="groups">
              University Groups
              <Badge className="ml-2 bg-primary text-primary-foreground">{filteredGroups.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="requests">
              Join Requests
              {incomingRequests.length > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground">{incomingRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="glass-card mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search groups by name or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 bg-transparent border-white/10 focus:border-primary text-lg"
                />
              </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredGroups.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No groups found</h3>
                <p className="text-muted-foreground">
                  {profile?.university 
                    ? "Be the first to create a study group for your university!"
                    : "Please set your university in your profile to see groups."}
                </p>
              </div>
            )}

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group, index) => {
                const requestStatus = getRequestStatus(group.id);
                const isGroupMember = isMember(group.id);
                const isCreator = group.created_by === user?.id;

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="glass-card group cursor-pointer glow-hover relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getGradient(index)}`} />
                    <div className="mt-2">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${getGradient(index)}`}>
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium glass border border-primary/30">
                          {group.is_public ? "Public" : "Private"}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {group.description || "No description provided"}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{group.subject}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">
                            {memberCounts[group.id] || 0} / {group.max_members} members
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-1 rounded-md text-xs glass border border-white/10 capitalize">
                          {group.difficulty}
                        </span>
                      </div>

                      {user && (
                        <div className="space-y-2">
                          {isGroupMember ? (
                            <Button
                              onClick={() => leaveGroup(group.id)}
                              variant="outline"
                              className="w-full"
                            >
                              Leave Group
                            </Button>
                          ) : isCreator ? (
                            <Badge variant="secondary" className="w-full justify-center py-2">
                              You created this group
                            </Badge>
                          ) : requestStatus === 'pending' ? (
                            <Button disabled variant="outline" className="w-full">
                              <Clock className="h-4 w-4 mr-2" />
                              Request Pending
                            </Button>
                          ) : requestStatus === 'rejected' ? (
                            <Button disabled variant="outline" className="w-full text-destructive">
                              Request Declined
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleRequestJoin(group)}
                              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                            >
                              Request to Join
                            </Button>
                          )}
                          {isCreator && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                >
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
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            {incomingRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  Join requests for your groups will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((request, index) => {
                  const group = getGroupForRequest(request.group_id);
                  const requesterProfile = requesterProfiles[request.requester_id];
                  
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">
                              {requesterProfile?.full_name || 'Unknown User'} wants to join
                            </h3>
                            <p className="text-muted-foreground mb-2">
                              Group: <span className="font-medium">{group?.name || 'Unknown Group'}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              University: {requesterProfile?.university || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Requested {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => rejectRequest(request.id, request.requester_id, group?.name || '')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => acceptRequest(request.id, request.requester_id, request.group_id, group?.name || '')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Groups;
