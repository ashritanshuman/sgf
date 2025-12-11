import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useAIChat } from '@/hooks/useAIChat';
import { Send, Bot, User, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAssistant = () => {
  const { messages, isLoading, error, sendMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const suggestedPrompts = [
    { icon: "🧬", text: "Explain photosynthesis in simple terms" },
    { icon: "📐", text: "Help me study for my calculus exam" },
    { icon: "📝", text: "Give me tips for better note-taking" },
    { icon: "🌍", text: "Create a quiz about World War II" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex flex-col container mx-auto px-4 py-4 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 flex-shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">AI Study Assistant</h1>
              <p className="text-xs text-muted-foreground">Powered by AI • Always ready to help</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearMessages}
              className="gap-1.5 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Clear</span>
            </Button>
          )}
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <Card className="flex-1 flex flex-col border overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center px-4">
                  {/* Empty State */}
                  <div className="p-4 rounded-full bg-muted border mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h2 className="text-lg font-semibold mb-1">How can I help you study?</h2>
                  <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                    I can explain concepts, help with homework, create quizzes, and provide study tips.
                  </p>

                  {/* Suggested Prompts */}
                  <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                    {suggestedPrompts.map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="text-left justify-start h-auto py-2.5 px-3 hover:bg-accent"
                        onClick={() => {
                          setInput(prompt.text);
                          inputRef.current?.focus();
                        }}
                      >
                        <span className="text-base mr-2 flex-shrink-0">{prompt.icon}</span>
                        <span className="text-xs truncate">{prompt.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap break-words">
                            {message.content || (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Thinking...
                              </span>
                            )}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>

            {/* Error Message */}
            {error && (
              <div className="px-3 py-2 bg-destructive/10 text-destructive text-xs border-t flex items-center gap-1.5">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 border-t bg-card">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  disabled={isLoading}
                  className="flex-1 h-10"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="h-10 w-10 p-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AIAssistant;
