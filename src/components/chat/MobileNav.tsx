import { useState } from "react";
import { Menu, X, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "offline";
  lastMessage?: string;
  unreadCount?: number;
}

interface MobileNavProps {
  friends: Friend[];
  selectedFriend: string;
  onSelectFriend: (friendId: string) => void;
}

export function MobileNav({ friends, selectedFriend, onSelectFriend }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectFriend = (friendId: string) => {
    onSelectFriend(friendId);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full bg-card">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-foreground">ChitChat</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
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
                    Friends ({friends.length})
                  </span>
                </div>
                
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => handleSelectFriend(friend.id)}
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
        </SheetContent>
      </Sheet>
    </div>
  );
}