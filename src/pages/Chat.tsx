import { useState } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ProfileView } from "@/components/profile/ProfileView";
import { FriendsList } from "@/components/friends/FriendsList";
import { GroupsList } from "@/components/groups/GroupsList";
import { Settings } from "@/components/settings/Settings";

type View = "chat" | "profile" | "friends" | "groups" | "settings";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "offline";
  lastMessage?: string;
  unreadCount?: number;
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

export default function Chat() {
  const [currentView, setCurrentView] = useState<View>("chat");
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<string>("1");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleViewProfile = (userId: string) => {
    setSelectedProfile(userId);
    setCurrentView("profile");
  };

  const handleBackToChat = () => {
    setCurrentView("chat");
    setSelectedProfile(null);
  };

  const handleMessage = () => {
    setCurrentView("chat");
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroup(groupId);
    setCurrentView("chat");
  };

  if (currentView === "profile" && selectedProfile) {
    return (
      <ProfileView
        userId={selectedProfile}
        isOwnProfile={selectedProfile === "current-user"}
        onBack={handleBackToChat}
        onMessage={handleMessage}
      />
    );
  }

  if (currentView === "friends") {
    return (
      <ChatLayout onViewChange={handleViewChange} currentView={currentView}>
        <FriendsList
          onSelectFriend={setSelectedFriend}
          selectedFriend={selectedFriend}
        />
      </ChatLayout>
    );
  }

  if (currentView === "groups") {
    return (
      <ChatLayout onViewChange={handleViewChange} currentView={currentView}>
        <GroupsList
          onSelectGroup={handleSelectGroup}
          selectedGroup={selectedGroup}
        />
      </ChatLayout>
    );
  }

  if (currentView === "settings") {
    return <Settings onBack={handleBackToChat} />;
  }

  const currentFriend = mockFriends.find(f => f.id === selectedFriend) || mockFriends[0];

  return (
    <ChatLayout onViewChange={handleViewChange} currentView={currentView}>
      <ChatWindow
        friendName={currentFriend.name}
        friendAvatar={currentFriend.avatar}
        friendStatus={currentFriend.status}
        friends={mockFriends}
        selectedFriend={selectedFriend}
        onSelectFriend={setSelectedFriend}
      />
    </ChatLayout>
  );
}