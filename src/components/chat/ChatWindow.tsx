import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "me" | "other";
  timestamp: Date;
  type: "text" | "image";
  imageUrl?: string;
}

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "offline";
  lastMessage?: string;
  unreadCount?: number;
}

interface ChatWindowProps {
  friendName: string;
  friendAvatar?: string;
  friendStatus: "online" | "away" | "offline";
  friends?: Friend[];
  selectedFriend?: string;
  onSelectFriend?: (friendId: string) => void;
}

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey! How's your day going?",
    sender: "other",
    timestamp: new Date(Date.now() - 60000 * 30),
    type: "text",
  },
  {
    id: "2",
    content: "Pretty good! Just finished my morning run. How about you?",
    sender: "me",
    timestamp: new Date(Date.now() - 60000 * 25),
    type: "text",
  },
  {
    id: "3",
    content: "That's awesome! I'm thinking of starting to run too. Any tips?",
    sender: "other",
    timestamp: new Date(Date.now() - 60000 * 20),
    type: "text",
  },
  {
    id: "4",
    content: "Start slow and be consistent! Even 15 minutes is great to begin with 🏃‍♀️",
    sender: "me",
    timestamp: new Date(Date.now() - 60000 * 15),
    type: "text",
  },
  {
    id: "5",
    content: "Thanks for the advice! I'll start tomorrow morning",
    sender: "other",
    timestamp: new Date(Date.now() - 60000 * 10),
    type: "text",
  },
];

export function ChatWindow({ friendName, friendAvatar, friendStatus, friends = [], selectedFriend, onSelectFriend }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "me",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {friends.length > 0 && onSelectFriend && selectedFriend && (
            <MobileNav
              friends={friends}
              selectedFriend={selectedFriend}
              onSelectFriend={onSelectFriend}
            />
          )}
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={friendAvatar} />
              <AvatarFallback>{friendName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                {
                  "bg-status-online": friendStatus === "online",
                  "bg-status-away": friendStatus === "away",
                  "bg-status-offline": friendStatus === "offline",
                }
              )}
            />
          </div>
          <div>
            <h2 className="font-semibold">{friendName}</h2>
            <p className="text-sm text-muted-foreground capitalize">{friendStatus}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;
            const showTimestamp = 
              index === messages.length - 1 || 
              messages[index + 1].sender !== message.sender ||
              messages[index + 1].timestamp.getTime() - message.timestamp.getTime() > 300000; // 5 minutes

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender === "me" ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === "other" && (
                  <Avatar className={cn("h-8 w-8", showAvatar ? "opacity-100" : "opacity-0")}>
                    <AvatarImage src={friendAvatar} />
                    <AvatarFallback className="text-xs">{friendName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn("max-w-xs lg:max-w-md", message.sender === "me" && "order-first")}>
                  <div
                    className={cn(
                      "px-4 py-2 rounded-2xl shadow-message transition-all duration-200 hover:shadow-soft",
                      message.sender === "me"
                        ? "bg-chat-sent text-chat-sent-foreground ml-auto"
                        : "bg-chat-received text-chat-received-foreground"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  {showTimestamp && (
                    <p className={cn(
                      "text-xs text-muted-foreground mt-1",
                      message.sender === "me" ? "text-right" : "text-left"
                    )}>
                      {formatTime(message.timestamp)}
                    </p>
                  )}
                </div>
                
                {message.sender === "me" && (
                  <div className="w-8" /> // Spacer for alignment
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-warm hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}