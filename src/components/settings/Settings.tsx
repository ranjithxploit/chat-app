import { useState } from "react";
import { User, Bell, Shield, Palette, Globe, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const [profileData, setProfileData] = useState({
    name: "Your Name",
    username: "your_username",
    email: "your@email.com",
    bio: "Hey there! I'm using ChatApp",
  });

  const [notifications, setNotifications] = useState({
    messages: true,
    friendRequests: true,
    groupInvites: true,
    soundEnabled: true,
  });

  const [privacy, setPrivacy] = useState({
    onlineStatus: true,
    lastSeen: false,
    readReceipts: true,
    profilePhotoPublic: true,
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-semibold text-lg">Settings</h1>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="profile" className="h-full">
          <div className="border-b border-border bg-card sticky top-0 z-10">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">About</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information and photo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Photo */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-2xl">ME</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        Change Photo
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Upload a new profile picture (max 5MB)
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        placeholder="@username"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  <Button className="bg-gradient-warm hover:opacity-90">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Messages</h4>
                        <p className="text-sm text-muted-foreground">
                          Get notified when you receive new messages
                        </p>
                      </div>
                      <Switch
                        checked={notifications.messages}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, messages: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Friend Requests</h4>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone sends you a friend request
                        </p>
                      </div>
                      <Switch
                        checked={notifications.friendRequests}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, friendRequests: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Group Invites</h4>
                        <p className="text-sm text-muted-foreground">
                          Get notified when you're invited to join a group
                        </p>
                      </div>
                      <Switch
                        checked={notifications.groupInvites}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, groupInvites: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Sound Effects</h4>
                        <p className="text-sm text-muted-foreground">
                          Play sound when receiving notifications
                        </p>
                      </div>
                      <Switch
                        checked={notifications.soundEnabled}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, soundEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Control who can see your information and activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Show Online Status</h4>
                        <p className="text-sm text-muted-foreground">
                          Let friends see when you're online
                        </p>
                      </div>
                      <Switch
                        checked={privacy.onlineStatus}
                        onCheckedChange={(checked) =>
                          setPrivacy({ ...privacy, onlineStatus: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Last Seen</h4>
                        <p className="text-sm text-muted-foreground">
                          Show when you were last active
                        </p>
                      </div>
                      <Switch
                        checked={privacy.lastSeen}
                        onCheckedChange={(checked) =>
                          setPrivacy({ ...privacy, lastSeen: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Read Receipts</h4>
                        <p className="text-sm text-muted-foreground">
                          Show when you've read messages
                        </p>
                      </div>
                      <Switch
                        checked={privacy.readReceipts}
                        onCheckedChange={(checked) =>
                          setPrivacy({ ...privacy, readReceipts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Public Profile Photo</h4>
                        <p className="text-sm text-muted-foreground">
                          Allow non-friends to see your profile photo
                        </p>
                      </div>
                      <Switch
                        checked={privacy.profilePhotoPublic}
                        onCheckedChange={(checked) =>
                          setPrivacy({ ...privacy, profilePhotoPublic: checked })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Data & Storage</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        Download My Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Clear Chat History
                      </Button>
                      <Button variant="destructive" className="w-full justify-start">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About ChatApp</CardTitle>
                  <CardDescription>
                    Information about the application and support
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Version</h4>
                      <p className="text-sm text-muted-foreground">1.0.0</p>
                    </div>

                    <div>
                      <h4 className="font-medium">Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• End-to-end encrypted messaging</li>
                        <li>• Real-time chat with friends</li>
                        <li>• Group conversations</li>
                        <li>• Image sharing</li>
                        <li>• User profiles and posts</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium">Support</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          Help Center
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Report a Bug
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Contact Support
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium">Legal</h4>
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                          Terms of Service
                        </Button>
                        <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                          Privacy Policy
                        </Button>
                        <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                          Cookie Policy
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}