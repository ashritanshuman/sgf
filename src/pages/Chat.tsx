import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Users, Loader2, X, FileIcon, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/useMessages";
import { useStudyGroups } from "@/hooks/useStudyGroups";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const Chat = () => {
  const { user } = useAuth();
  const { groups, myGroups, loading: groupsLoading } = useStudyGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myJoinedGroups = groups.filter(g => myGroups.includes(g.id));
  const { messages, loading: messagesLoading, sendMessage, isOwnMessage } = useMessages(selectedGroupId);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  useEffect(() => {
    if (myJoinedGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(myJoinedGroups[0].id);
    }
  }, [myJoinedGroups, selectedGroupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    setUploading(true);
    const success = await sendMessage(
      message.trim(),
      selectedFile ? { file: selectedFile, preview: filePreview || undefined } : undefined
    );

    if (success) {
      setMessage("");
      clearSelectedFile();
    }
    setUploading(false);
  };

  const isImageFile = (fileType: string | null) => fileType?.startsWith("image/");

  const renderAttachment = (msg: typeof messages[0]) => {
    if (!msg.file_url) return null;

    if (isImageFile(msg.file_type)) {
      return (
        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="block mt-2">
          <img
            src={msg.file_url}
            alt={msg.file_name || "Image"}
            className="max-w-full max-h-64 rounded-lg object-cover"
          />
        </a>
      );
    }

    return (
      <a
        href={msg.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-background/20 hover:bg-background/30 transition-colors"
      >
        <FileIcon className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm truncate">{msg.file_name || "Download file"}</span>
      </a>
    );
  };

  if (groupsLoading) {
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
        className="container mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">Messages</h1>

        {myJoinedGroups.length === 0 ? (
          <div className="glass-card text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No groups yet</h3>
            <p className="text-muted-foreground">Join a study group to start chatting with members!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Groups Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-1 glass-card glow-hover"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your Groups
              </h2>
              <div className="space-y-2">
                {myJoinedGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ x: 5 }}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedGroupId === group.id
                        ? "bg-primary/20 border border-primary/50"
                        : "glass border border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${selectedGroupId === group.id ? "text-primary" : ""}`}>
                        {group.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{group.subject}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Chat Area */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-3 glass-card glow-hover flex flex-col h-[600px]"
            >
              {/* Chat Header */}
              <div className="pb-4 border-b border-white/10">
                <h2 className="text-2xl font-bold">{selectedGroup?.name || "Select a group"}</h2>
                <p className="text-sm text-muted-foreground">{selectedGroup?.subject}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      className={`flex ${isOwnMessage(msg) ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${isOwnMessage(msg) ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        {!isOwnMessage(msg) && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {msg.profile?.full_name || "Anonymous"}
                          </span>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isOwnMessage(msg)
                              ? "bg-gradient-to-r from-primary to-secondary text-white"
                              : "glass border border-white/10"
                          }`}
                        >
                          {msg.content && <p>{msg.content}</p>}
                          {renderAttachment(msg)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), "h:mm a")}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* File Preview */}
              {selectedFile && (
                <div className="px-4 py-2 border-t border-white/10">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center rounded bg-muted">
                        <FileIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSelectedFile}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !uploading && handleSendMessage()}
                    className="flex-1 bg-transparent border-white/10 focus:border-primary"
                    disabled={!selectedGroupId || uploading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    size="icon"
                    disabled={!selectedGroupId || (!message.trim() && !selectedFile) || uploading}
                  >
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Chat;