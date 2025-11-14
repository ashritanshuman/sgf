import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageCircle, Users, Calendar, Trophy, CheckCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Notifications = () => {
  const notifications = [
    {
      type: "message",
      icon: MessageCircle,
      title: "New message from Sarah",
      description: "Hey! Are you free for a study session tomorrow?",
      time: "2 minutes ago",
      unread: true,
    },
    {
      type: "group",
      icon: Users,
      title: "Invited to Mathematics Study Group",
      description: "Mike Chen invited you to join their study group",
      time: "1 hour ago",
      unread: true,
    },
    {
      type: "session",
      icon: Calendar,
      title: "Upcoming study session",
      description: "Physics study session starts in 30 minutes",
      time: "2 hours ago",
      unread: false,
    },
    {
      type: "achievement",
      icon: Trophy,
      title: "New badge unlocked!",
      description: "You've earned the 'Team Player' badge",
      time: "1 day ago",
      unread: false,
    },
    {
      type: "message",
      icon: MessageCircle,
      title: "New comment on your resource",
      description: "Emma commented on your Calculus Notes",
      time: "2 days ago",
      unread: false,
    },
  ];

  return (
    <div className="min-h-screen pt-32 px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto max-w-4xl"
      >
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-4 gradient-text">Notifications</h1>
            <p className="text-xl text-muted-foreground">
              Stay updated with your study groups
            </p>
          </div>
          <Button variant="outline" size="sm">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">
              All
              <Badge className="ml-2 bg-primary text-primary-foreground">5</Badge>
            </TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`glass-card glow-hover hover:scale-[1.01] transition-all cursor-pointer ${
                  notification.unread ? 'border-l-4 border-l-primary' : ''
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      notification.unread 
                        ? 'bg-gradient-to-br from-primary to-secondary' 
                        : 'bg-muted'
                    }`}>
                      <notification.icon className={`h-6 w-6 ${
                        notification.unread ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                        </div>
                        {notification.unread && (
                          <Badge variant="default" className="shrink-0">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="messages">
            <p className="text-center text-muted-foreground py-12">Message notifications will appear here</p>
          </TabsContent>

          <TabsContent value="groups">
            <p className="text-center text-muted-foreground py-12">Group notifications will appear here</p>
          </TabsContent>

          <TabsContent value="sessions">
            <p className="text-center text-muted-foreground py-12">Session notifications will appear here</p>
          </TabsContent>
        </Tabs>

        {/* Notification Settings */}
        <Card className="glass-card mt-12">
          <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              "New messages",
              "Group invitations",
              "Study session reminders",
              "Achievement unlocked",
              "Weekly summary",
            ].map((pref, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{pref}</span>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Notifications;
