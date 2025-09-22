import { useState } from "react";
import { MessageCircle, Users, User, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "offline";
  lastMessage?: string;
  unreadCount?: number;
}

interface ChatLayoutProps {
  children: React.ReactNode;
}

const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    avatar: "/placeholder.svg",
    status: "online",
    lastMessage: "Hey! How's your day going?",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Mike Chen",
    avatar: "/placeholder.svg",
    status: "away",
    lastMessage: "Did you see the new photos?",
  },
  {
    id: "3",
    name: "Emma Davis",
    avatar: "/placeholder.svg",
    status: "online",
    lastMessage: "Coffee tomorrow? ☕",
    unreadCount: 1,
  },
  {
    id: "4",
    name: "Alex Rodriguez",
    avatar: "/placeholder.svg",
    status: "offline",
    lastMessage: "Thanks for the help earlier!",
  },
];

export function ChatLayout({ children }: ChatLayoutProps) {
  const [selectedFriend, setSelectedFriend] = useState<string>("1");

  return (
    <div className="flex h-screen bg-chat-background">
      {/* Sidebar */}
      <div className="w-80 md:flex hidden bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-foreground">ChitChat</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">Your Name</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-status-online"></div>
          </div>
        </div>

        {/* Friends List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Friends ({mockFriends.length})
              </span>
            </div>
            
            <div className="space-y-2">
              {mockFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend.id)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all duration-200 hover:bg-accent/50",
                    selectedFriend === friend.id && "bg-primary/10 ring-1 ring-primary/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                          {
                            "bg-status-online": friend.status === "online",
                            "bg-status-away": friend.status === "away",
                            "bg-status-offline": friend.status === "offline",
                          }
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{friend.name}</p>
                        {friend.unreadCount && (
                          <Badge variant="secondary" className="h-5 min-w-5 text-xs bg-primary text-primary-foreground">
                            {friend.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {friend.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {friend.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}