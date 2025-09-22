import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Send, Smile, Paperclip, Mic, MicOff, X, Upload, Download, UserPlus } from 'lucide-react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import io from 'socket.io-client';

interface User {
  id: string;
  userCode: string;
  name: string;
  avatar?: string;
  lastSeen: string;
  online: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'file';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  fileUrl?: string;
  duration?: number;
}

interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

interface FileShare {
  shareCode: string;
  fileName: string;
  fileSize: number;
  expiresAt: string;
  canDownload: boolean;
}

export default function Chat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser] = useState<User>({
    id: '1',
    userCode: 'CHL001',
    name: 'You',
    online: true,
    lastSeen: 'now'
  });
  
  // Voice recording hook
  const {
    isRecording,
    recordingTime,
    audioBlob,
    hasPermission,
    requestPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime
  } = useVoiceRecording();

  // Friend request states
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);

  // File sharing states
  const [showFileShare, setShowFileShare] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [downloadCode, setDownloadCode] = useState('');
  const [fileInfo, setFileInfo] = useState<FileShare | null>(null);

  // Socket connection
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3001');
    
    socketRef.current.emit('user_online', currentUser);

    // Listen for real-time messages
    socketRef.current.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for user status changes
    socketRef.current.on('user_status_change', (data: { userId: string; online: boolean }) => {
      setChats(prev => prev.map(chat => ({
        ...chat,
        participants: chat.participants.map(p => 
          p.id === data.userId ? { ...p, online: data.online } : p
        )
      })));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  // Sample data initialization
  useEffect(() => {
    const sampleChats: Chat[] = [
      {
        id: '1',
        participants: [
          currentUser,
          { id: '2', userCode: 'CHL002', name: 'Alice Smith', online: true, lastSeen: 'now' }
        ],
        lastMessage: {
          id: '1',
          senderId: '2',
          receiverId: '1',
          content: 'Hey! How are you doing?',
          type: 'text',
          timestamp: new Date().toISOString(),
          status: 'delivered'
        },
        unreadCount: 1
      },
      {
        id: '2',
        participants: [
          currentUser,
          { id: '3', userCode: 'CHL003', name: 'Bob Johnson', online: false, lastSeen: '2 hours ago' }
        ],
        unreadCount: 0
      }
    ];
    setChats(sampleChats);
  }, [currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedChat.participants.find(p => p.id !== currentUser.id)?.id || '',
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Send via socket
    if (socketRef.current) {
      socketRef.current.emit('send_message', message);
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append('voice', audioBlob, 'voice-message.wav');
      formData.append('senderId', currentUser.id);
      formData.append('receiverId', selectedChat.participants.find(p => p.id !== currentUser.id)?.id || '');

      const response = await fetch('http://localhost:3001/api/upload/voice', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const voiceMessage: Message = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          receiverId: selectedChat.participants.find(p => p.id !== currentUser.id)?.id || '',
          content: 'Voice message',
          type: 'voice',
          timestamp: new Date().toISOString(),
          status: 'sent',
          fileUrl: data.url,
          duration: recordingTime
        };

        setMessages(prev => [...prev, voiceMessage]);

        // Send via socket
        if (socketRef.current) {
          socketRef.current.emit('send_message', voiceMessage);
        }
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  };

  const handleVoiceRecording = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    if (isRecording) {
      stopRecording();
      // Send the voice message after stopping
      setTimeout(() => {
        sendVoiceMessage();
      }, 100);
    } else {
      startRecording();
    }
  };

  const searchFriend = async () => {
    if (!friendCode.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/users/search/${friendCode}`);
      if (response.ok) {
        const user = await response.json();
        setSearchResult(user);
      } else {
        setSearchResult(null);
        alert('User not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult(null);
    }
  };

  const sendFriendRequest = async () => {
    if (!searchResult) return;

    try {
      const response = await fetch('http://localhost:3001/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: currentUser.id,
          toUserId: searchResult.id
        })
      });

      if (response.ok) {
        alert('Friend request sent!');
        setShowAddFriend(false);
        setFriendCode('');
        setSearchResult(null);
      }
    } catch (error) {
      console.error('Friend request error:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('uploaderId', currentUser.id);

      const response = await fetch('http://localhost:3001/api/files/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setShareCode(data.shareCode);
        setFileInfo({
          shareCode: data.shareCode,
          fileName: uploadFile.name,
          fileSize: uploadFile.size,
          expiresAt: data.expiresAt,
          canDownload: true
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleFileDownload = async () => {
    if (!downloadCode.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/files/download/${downloadCode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.canDownload) {
          // Create download link
          const link = document.createElement('a');
          link.href = data.downloadUrl;
          link.download = data.fileName;
          link.click();
        } else {
          alert('File expired or already downloaded');
        }
      } else {
        alert('Invalid download code');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    }
  };

  const formatChatTime = (timestamp: string) => {
    const now = new Date();
    const msgDate = new Date(timestamp);
    const diffInHours = (now.getTime() - msgDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatTime(timestamp);
    } else {
      return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-full bg-[#0f1419]">
      {/* Sidebar */}
      <div className="w-80 bg-[#1f2937] border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#374151] border-b border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser.userCode.slice(-2)}
              </div>
              <div>
                <h3 className="text-white font-medium">{currentUser.name}</h3>
                <p className="text-xs text-gray-400">Code: {currentUser.userCode}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <UserPlus 
                className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" 
                onClick={() => setShowAddFriend(true)}
              />
              <Upload 
                className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => setShowFileShare(true)}
              />
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-[#4b5563] text-white placeholder-gray-400 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const otherUser = chat.participants.find(p => p.id !== currentUser.id);
            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-[#374151] transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-[#4b5563]' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {otherUser?.userCode.slice(-2)}
                    </div>
                    {otherUser?.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1f2937]"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium truncate">{otherUser?.name}</h4>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatChatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <div className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-[#374151] border-b border-gray-600 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedChat.participants.find(p => p.id !== currentUser.id)?.userCode.slice(-2)}
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {selectedChat.participants.find(p => p.id !== currentUser.id)?.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {selectedChat.participants.find(p => p.id !== currentUser.id)?.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === currentUser.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-[#374151] text-white'
                    }`}
                  >
                    {message.type === 'voice' ? (
                      <div className="flex items-center space-x-2">
                        <Mic className="w-4 h-4" />
                        <span>Voice message ({formatTime(message.duration || 0)}s)</span>
                        {message.fileUrl && (
                          <audio controls className="w-full mt-2">
                            <source src={message.fileUrl} type="audio/wav" />
                          </audio>
                        )}
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.senderId === currentUser.id && (
                        <span className="text-xs opacity-70">{message.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voice Recording Overlay */}
            {isRecording && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-[#374151] p-8 rounded-lg text-center">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-white text-lg mb-2">Recording voice message...</p>
                  <p className="text-gray-400 text-2xl mb-4">{formatTime(recordingTime)}</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={cancelRecording}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVoiceRecording}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 bg-[#374151] border-t border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="flex-1 flex items-center space-x-2 bg-[#4b5563] rounded-lg px-3 py-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 border-none focus:outline-none"
                  />
                  <Smile className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                  <Paperclip className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                </div>
                <button
                  onClick={handleVoiceRecording}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={sendMessage}
                  className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0f1419]">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to ChillChat</h2>
              <p className="text-gray-400">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#374151] p-6 rounded-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">Add Friend</h3>
              <X 
                className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => setShowAddFriend(false)}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm">Friend Code</label>
                <input
                  type="text"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value)}
                  placeholder="Enter friend code (e.g., CHL002)"
                  className="w-full mt-1 px-3 py-2 bg-[#4b5563] text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <button
                onClick={searchFriend}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg"
              >
                Search
              </button>
              
              {searchResult && (
                <div className="bg-[#4b5563] p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {searchResult.userCode.slice(-2)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{searchResult.name}</h4>
                      <p className="text-gray-400 text-sm">Code: {searchResult.userCode}</p>
                    </div>
                  </div>
                  <button
                    onClick={sendFriendRequest}
                    className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                  >
                    Send Friend Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Share Modal */}
      {showFileShare && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#374151] p-6 rounded-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">File Sharing</h3>
              <X 
                className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => setShowFileShare(false)}
              />
            </div>
            
            <div className="space-y-4">
              {/* Upload Section */}
              <div>
                <h4 className="text-gray-300 text-sm mb-2">Upload File (ZIP only, max 100MB)</h4>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                />
                {uploadFile && (
                  <p className="text-gray-400 text-sm mt-1">
                    {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                )}
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile}
                  className="w-full mt-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white py-2 rounded-lg"
                >
                  Upload & Generate Code
                </button>
              </div>
              
              {shareCode && (
                <div className="bg-[#4b5563] p-3 rounded-lg">
                  <p className="text-gray-300 text-sm">Share Code (expires in 5 minutes):</p>
                  <p className="text-white font-mono text-lg">{shareCode}</p>
                </div>
              )}
              
              {/* Download Section */}
              <div>
                <h4 className="text-gray-300 text-sm mb-2">Download File</h4>
                <input
                  type="text"
                  value={downloadCode}
                  onChange={(e) => setDownloadCode(e.target.value)}
                  placeholder="Enter download code"
                  className="w-full px-3 py-2 bg-[#4b5563] text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleFileDownload}
                  className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                >
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}