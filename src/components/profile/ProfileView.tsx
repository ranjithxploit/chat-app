import { useState } from "react";
import { ArrowLeft, Camera, Settings, UserPlus, MessageCircle, Heart, MessageSquare, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface ProfileViewProps {
  userId: string;
  isOwnProfile: boolean;
  onBack: () => void;
  onMessage?: () => void;
}

const mockPosts: Post[] = [
  {
    id: "1",
    imageUrl: "/placeholder.svg",
    caption: "Beautiful sunset at the beach today! 🌅 Perfect way to end the weekend.",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    likes: 24,
    comments: 8,
    isLiked: true,
  },
  {
    id: "2",
    imageUrl: "/placeholder.svg",
    caption: "Homemade pasta night! 🍝 Recipe coming soon on my story.",
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    likes: 18,
    comments: 12,
    isLiked: false,
  },
  {
    id: "3",
    imageUrl: "/placeholder.svg",
    caption: "Morning hike with the best company 🐕‍🦺 Nature therapy hits different.",
    timestamp: new Date(Date.now() - 259200000), // 3 days ago
    likes: 31,
    comments: 6,
    isLiked: true,
  },
];

export function ProfileView({ userId, isOwnProfile, onBack, onMessage }: ProfileViewProps) {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [activeTab, setActiveTab] = useState("posts");

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold">Profile</h1>
        </div>
        
        {isOwnProfile && (
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {/* Profile Header */}
        <div className="p-6 bg-gradient-soft">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 shadow-soft">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-2xl">SW</AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary-glow"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <h2 className="text-xl font-bold mb-1">Sarah Wilson</h2>
            <p className="text-muted-foreground mb-2">@sarah_wilson</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-status-online"></div>
              <span className="text-sm text-status-online font-medium">Online</span>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Coffee enthusiast ☕ | Dog lover 🐕 | Adventure seeker 🏔️
            </p>
            
            {/* Stats */}
            <div className="flex gap-6 mb-6">
              <div className="text-center">
                <div className="font-bold text-lg">{posts.length}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">42</div>
                <div className="text-xs text-muted-foreground">Friends</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">1.2k</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button variant="outline" className="flex-1">
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={onMessage} className="flex-1 bg-gradient-warm hover:opacity-90">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Friend
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="px-4 pb-4">
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden shadow-soft">
                  <CardContent className="p-0">
                    {/* Post Image */}
                    <div className="aspect-square bg-muted relative">
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Post Content */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikePost(post.id)}
                            className={cn(
                              "p-0 h-auto hover:bg-transparent",
                              post.isLiked && "text-red-500"
                            )}
                          >
                            <Heart className={cn("h-5 w-5", post.isLiked && "fill-current")} />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                            <MessageSquare className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                            <Share className="h-5 w-5" />
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(post.timestamp)}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <span className="font-medium text-sm">{post.likes} likes</span>
                        {post.comments > 0 && (
                          <span className="text-muted-foreground text-sm ml-3">
                            {post.comments} comments
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm leading-relaxed">{post.caption}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="px-4 pb-4">
            <Card className="shadow-soft">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">
                    Passionate about life, always looking for new adventures and great conversations. 
                    Love connecting with people and sharing moments that matter.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Photography", "Hiking", "Coffee", "Travel", "Dogs", "Cooking"].map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Joined</h3>
                  <p className="text-sm text-muted-foreground">March 2024</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}