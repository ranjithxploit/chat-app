import { useState } from "react";
import { UserPlus, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface FriendRequest {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  mutualFriends: number;
  type: "incoming" | "outgoing";
}

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  status: "online" | "away" | "offline";
  lastSeen?: Date;
}

interface FriendsListProps {
  onSelectFriend: (friendId: string) => void;
  selectedFriend?: string;
}

const mockFriendRequests: FriendRequest[] = [
  {
    id: "req1",
    name: "John Smith",
    username: "@johnsmith",
    avatar: "/placeholder.svg",
    mutualFriends: 3,
    type: "incoming",
  },
  {
    id: "req2",
    name: "Lisa Anderson",
    username: "@lisa_a",
    avatar: "/placeholder.svg",
    mutualFriends: 1,
    type: "incoming",
  },
  {
    id: "req3",
    name: "David Wilson",
    username: "@dwilson",
    avatar: "/placeholder.svg",
    mutualFriends: 0,
    type: "outgoing",
  },
];

const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    username: "@sarah_wilson",
    avatar: "/placeholder.svg",
    status: "online",
  },
  {
    id: "2",
    name: "Mike Chen",
    username: "@mike_chen",
    avatar: "/placeholder.svg",
    status: "away",
    lastSeen: new Date(Date.now() - 1800000), // 30 min ago
  },
  {
    id: "3",
    name: "Emma Davis",
    username: "@emma_davis",
    avatar: "/placeholder.svg",
    status: "online",
  },
  {
    id: "4",
    name: "Alex Rodriguez",
    username: "@alex_r",
    avatar: "/placeholder.svg",
    status: "offline",
    lastSeen: new Date(Date.now() - 7200000), // 2 hours ago
  },
];

export function FriendsList({ onSelectFriend, selectedFriend }: FriendsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(mockFriendRequests);
  const [friends] = useState<Friend[]>(mockFriends);

  const handleAcceptRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const incomingRequests = friendRequests.filter(req => req.type === "incoming");
  const outgoingRequests = friendRequests.filter(req => req.type === "outgoing");

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Friends</h2>
          <Button size="sm" variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="friends" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="friends">
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({incomingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="flex-1 m-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => onSelectFriend(friend.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-secondary/50",
                    selectedFriend === friend.id && "bg-secondary"
                  )}
                >
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
                      <p className="font-medium truncate">{friend.name}</p>
                      {friend.status !== "online" && friend.lastSeen && (
                        <span className="text-xs text-muted-foreground">
                          {formatLastSeen(friend.lastSeen)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {friend.username}
                    </p>
                  </div>
                </div>
              ))}
              
              {filteredFriends.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No friends found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requests" className="flex-1 m-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {incomingRequests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                    Incoming Requests
                  </h3>
                  <div className="space-y-3">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.avatar} />
                          <AvatarFallback>{request.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{request.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {request.username}
                          </p>
                          {request.mutualFriends > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {request.mutualFriends} mutual friends
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {outgoingRequests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                    Sent Requests
                  </h3>
                  <div className="space-y-3">
                    {outgoingRequests.map((request) => (
                      <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.avatar} />
                          <AvatarFallback>{request.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{request.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {request.username}
                          </p>
                        </div>
                        
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {friendRequests.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No friend requests</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}