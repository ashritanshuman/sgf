import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageCircle, Users, Calendar, Trophy, CheckCheck, Loader2, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/useNotifications";

const Notifications = () => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'join_request':
        return UserPlus;
      case 'request_accepted':
        return CheckCircle;
      case 'request_rejected':
        return XCircle;
      case 'message':
        return MessageCircle;
      case 'group':
        return Users;
      case 'session':
        return Calendar;
      case 'achievement':
        return Trophy;
      default:
        return Bell;
    }
  };

  const getFilteredNotifications = (type: string) => {
    if (type === 'all') return notifications;
    if (type === 'messages') return notifications.filter(n => n.type === 'message');
    if (type === 'groups') return notifications.filter(n => 
      ['join_request', 'request_accepted', 'request_rejected', 'group'].includes(n.type)
    );
    if (type === 'sessions') return notifications.filter(n => n.type === 'session');
    return notifications;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

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
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="all">
                All
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            {['all', 'messages', 'groups', 'sessions'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {getFilteredNotifications(tab).length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">No notifications</h3>
                    <p className="text-muted-foreground">
                      {tab === 'all' ? "You're all caught up!" : `No ${tab} notifications yet`}
                    </p>
                  </div>
                ) : (
                  getFilteredNotifications(tab).map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                      >
                        <Card className={`glass-card glow-hover hover:scale-[1.01] transition-all cursor-pointer ${
                          !notification.is_read ? 'border-l-4 border-l-primary' : ''
                        }`}>
                          <div className="flex items-start gap-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                              !notification.is_read 
                                ? 'bg-gradient-to-br from-primary to-secondary' 
                                : 'bg-muted'
                            }`}>
                              <IconComponent className={`h-6 w-6 ${
                                !notification.is_read ? 'text-primary-foreground' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h3 className="font-bold mb-1">{notification.title}</h3>
                                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                                </div>
                                {!notification.is_read && (
                                  <Badge variant="default" className="shrink-0">New</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatTime(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}

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
