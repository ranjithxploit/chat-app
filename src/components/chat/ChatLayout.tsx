import { ReactNode } from "react";
import { MessageCircle, Users, Hash, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type View = "chat" | "profile" | "friends" | "groups" | "settings";

interface ChatLayoutProps {
  children: ReactNode;
  onViewChange?: (view: View) => void;
  currentView?: View;
}

export function ChatLayout({ children, onViewChange, currentView = "chat" }: ChatLayoutProps) {
  const navItems = [
    { id: "chat" as View, icon: MessageCircle, label: "Chats" },
    { id: "friends" as View, icon: Users, label: "Friends" },
    { id: "groups" as View, icon: Hash, label: "Groups" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-16 lg:w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="hidden lg:flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-warm flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-lg">ChatApp</h1>
          </div>
          <div className="lg:hidden flex justify-center">
            <div className="h-8 w-8 rounded-full bg-gradient-warm flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-2">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start lg:justify-start",
                  "lg:px-3 px-0 lg:h-10 h-12",
                  currentView === item.id && "bg-secondary"
                )}
                onClick={() => onViewChange?.(item.id)}
              >
                <item.icon className="h-5 w-5 lg:mr-3" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        {/* User Profile & Settings */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start lg:justify-start lg:px-3 px-0"
            onClick={() => onViewChange?.("settings")}
          >
            <Settings className="h-5 w-5 lg:mr-3" />
            <span className="hidden lg:inline">Settings</span>
          </Button>
          
          <div className="hidden lg:flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">You</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="lg:hidden flex justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {children}
      </div>
    </div>
  );
}