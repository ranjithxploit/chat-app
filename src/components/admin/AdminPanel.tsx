import { useState } from "react";
import { Users, MessageSquare, AlertTriangle, BarChart3, Ban, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  status: "active" | "banned" | "suspended";
  joinDate: Date;
  lastActive: Date;
  messageCount: number;
  friendCount: number;
}

interface Report {
  id: string;
  reportedUser: User;
  reportedBy: User;
  reason: string;
  description: string;
  timestamp: Date;
  status: "pending" | "reviewed" | "dismissed";
  severity: "low" | "medium" | "high";
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    username: "sarah_wilson",
    avatar: "/placeholder.svg",
    status: "active",
    joinDate: new Date(Date.now() - 2592000000), // 30 days ago
    lastActive: new Date(Date.now() - 300000), // 5 min ago
    messageCount: 234,
    friendCount: 42,
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    username: "mike_chen",
    avatar: "/placeholder.svg",
    status: "active",
    joinDate: new Date(Date.now() - 5184000000), // 60 days ago
    lastActive: new Date(Date.now() - 1800000), // 30 min ago
    messageCount: 156,
    friendCount: 28,
  },
  {
    id: "3",
    name: "Spam Bot",
    email: "spam@example.com",
    username: "spambot123",
    status: "banned",
    joinDate: new Date(Date.now() - 86400000), // 1 day ago
    lastActive: new Date(Date.now() - 3600000), // 1 hour ago
    messageCount: 1000,
    friendCount: 0,
  },
];

const mockReports: Report[] = [
  {
    id: "rep1",
    reportedUser: mockUsers[2],
    reportedBy: mockUsers[0],
    reason: "Spam",
    description: "User is sending excessive promotional messages",
    timestamp: new Date(Date.now() - 1800000), // 30 min ago
    status: "pending",
    severity: "high",
  },
  {
    id: "rep2",
    reportedUser: mockUsers[1],
    reportedBy: mockUsers[0],
    reason: "Inappropriate Content",
    description: "Sharing inappropriate images in group chat",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    status: "pending",
    severity: "medium",
  },
];

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [reports, setReports] = useState<Report[]>(mockReports);

  const handleBanUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: "banned" as const } : user
    ));
  };

  const handleUnbanUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: "active" as const } : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleResolveReport = (reportId: string, action: "reviewed" | "dismissed") => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: action } : report
    ));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const activeUsers = users.filter(u => u.status === "active").length;
  const bannedUsers = users.filter(u => u.status === "banned").length;
  const pendingReports = reports.filter(r => r.status === "pending").length;
  const totalMessages = users.reduce((sum, user) => sum + user.messageCount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Badge variant="secondary">Administrator</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers} active, {bannedUsers} banned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => (Date.now() - u.lastActive.getTime()) < 600000).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Online in last 10 min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="reports">
            Reports {pendingReports > 0 && <Badge className="ml-2">{pendingReports}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, view their activity, and take moderation actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{user.name}</h3>
                            <Badge
                              variant={user.status === "active" ? "default" : 
                                     user.status === "banned" ? "destructive" : "secondary"}
                            >
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Joined: {user.joinDate.toLocaleDateString()}</span>
                            <span>Messages: {user.messageCount}</span>
                            <span>Friends: {user.friendCount}</span>
                            <span>Last active: {formatDate(user.lastActive)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        {user.status === "active" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Ban className="h-4 w-4 mr-2" />
                                Ban
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ban User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to ban {user.name}? This will prevent them from accessing the platform.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleBanUser(user.id)}>
                                  Ban User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            Unban
                          </Button>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>
                Review reported users and take appropriate action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={report.severity === "high" ? "destructive" :
                                   report.severity === "medium" ? "default" : "secondary"}
                          >
                            {report.severity} priority
                          </Badge>
                          <Badge variant="outline">{report.status}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(report.timestamp)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Reported User</h4>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={report.reportedUser.avatar} />
                              <AvatarFallback>{report.reportedUser.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{report.reportedUser.name}</p>
                              <p className="text-sm text-muted-foreground">@{report.reportedUser.username}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Reported By</h4>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={report.reportedBy.avatar} />
                              <AvatarFallback>{report.reportedBy.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{report.reportedBy.name}</p>
                              <p className="text-sm text-muted-foreground">@{report.reportedBy.username}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Reason: {report.reason}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                      
                      {report.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleResolveReport(report.id, "reviewed")}
                          >
                            Take Action
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveReport(report.id, "dismissed")}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {reports.length === 0 && (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No reports found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}