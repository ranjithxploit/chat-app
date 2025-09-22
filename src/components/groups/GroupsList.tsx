import { useState } from "react";
import { Users, Plus, Hash, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: "admin" | "member";
}

interface Group {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  memberCount: number;
  unreadCount?: number;
  lastMessage?: string;
  lastActivity: Date;
  isPrivate: boolean;
  members: GroupMember[];
}

interface GroupsListProps {
  onSelectGroup: (groupId: string) => void;
  selectedGroup?: string;
}

const mockGroups: Group[] = [
  {
    id: "group1",
    name: "Weekend Hikers",
    description: "Planning our next adventure",
    avatar: "/placeholder.svg",
    memberCount: 8,
    unreadCount: 3,
    lastMessage: "Who's in for Saturday's hike?",
    lastActivity: new Date(Date.now() - 300000), // 5 min ago
    isPrivate: false,
    members: [
      { id: "1", name: "Sarah Wilson", avatar: "/placeholder.svg", role: "admin" },
      { id: "2", name: "Mike Chen", avatar: "/placeholder.svg", role: "member" },
      { id: "3", name: "Emma Davis", avatar: "/placeholder.svg", role: "member" },
    ],
  },
  {
    id: "group2",
    name: "Coffee Enthusiasts",
    description: "Sharing the best brewing tips",
    avatar: "/placeholder.svg",
    memberCount: 12,
    unreadCount: 1,
    lastMessage: "Found an amazing new roastery!",
    lastActivity: new Date(Date.now() - 1800000), // 30 min ago
    isPrivate: false,
    members: [
      { id: "4", name: "Alex Rodriguez", avatar: "/placeholder.svg", role: "admin" },
      { id: "5", name: "Lisa Chen", avatar: "/placeholder.svg", role: "member" },
    ],
  },
  {
    id: "group3",
    name: "Work Team",
    description: "Daily standup and updates",
    avatar: "/placeholder.svg",
    memberCount: 5,
    lastMessage: "Sprint review at 3 PM",
    lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
    isPrivate: true,
    members: [
      { id: "6", name: "John Smith", avatar: "/placeholder.svg", role: "admin" },
    ],
  },
];

export function GroupsList({ onSelectGroup, selectedGroup }: GroupsListProps) {
  const [groups] = useState<Group[]>(mockGroups);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Groups
          </h2>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary/50"
          />
        </div>
      </div>

      {/* Groups List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-secondary/50",
                selectedGroup === group.id && "bg-secondary"
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={group.avatar} />
                  <AvatarFallback>
                    <Hash className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                {group.isPrivate && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Settings className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{group.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {group.memberCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {group.unreadCount && group.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
                        {group.unreadCount}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatLastActivity(group.lastActivity)}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground truncate">
                  {group.lastMessage || group.description}
                </p>
                
                {/* Member Avatars Preview */}
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="h-6 w-6 border-2 border-card">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {group.memberCount > 3 && (
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          +{group.memberCount - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredGroups.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No groups found</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Plus className="h-4 w-4 mr-2" />
                Create your first group
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}