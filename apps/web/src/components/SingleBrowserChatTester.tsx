'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  token: string;
}

interface UserConnection {
  user: User;
  socket: Socket | null;
  connected: boolean;
  conversations: any[];
  messages: Message[];
  currentConversation: string | null;
  newMessage: string;
  isTyping: { [key: string]: boolean };
}

// Test users - akan generate token secara dinamis melalui login API
const TEST_USERS: User[] = [
  {
    id: 'user1',
    username: 'user1',
    email: 'user1@setaradapps.com',
    token: ''
  },
  {
    id: 'user2',
    username: 'user2', 
    email: 'user2@setaradapps.com',
    token: ''
  }
];

// Function untuk generate real JWT token
const generateToken = async (username: string, password: string = 'test123'): Promise<string> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.access_token || data.token || '';
    } else {
      throw new Error(`Login failed for ${username}: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error(`Error generating token for ${username}:`, error);
    throw error;
  }
};

const SingleBrowserChatTester: React.FC = () => {
  const [userConnections, setUserConnections] = useState<{ [key: string]: UserConnection }>({});
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState<'split' | 'switch'>('split');
  const [currentUser, setCurrentUser] = useState<string>('user1');
  const messagesEndRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToBottom = (userId: string) => {
    messagesEndRefs.current[userId]?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize connections for both users
  const initializeUser = async (user: User) => {
    try {
      // Generate real token jika belum ada
      const token = user.token || await generateToken(user.username);
      
      const socket = io('http://localhost:3004', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      const userConnection: UserConnection = {
        user: { ...user, token }, // Update user dengan generated token
        socket,
        connected: false,
        conversations: [],
        messages: [],
        currentConversation: null,
        newMessage: '',
        isTyping: {}
      };

    // Socket event handlers
    socket.on('connect', () => {
      console.log(`${user.username} connected`);
      updateUserConnection(user.id, { connected: true });
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log(`${user.username} disconnected`);
      updateUserConnection(user.id, { connected: false });
    });

    socket.on('authenticated', (data) => {
      console.log(`${user.username} authenticated:`, data);
      loadConversations(user.id);
    });

    socket.on('error', (errorData) => {
      console.error(`${user.username} error:`, errorData);
      setError(`${user.username}: ${errorData.message}`);
    });

    socket.on('new_message', (message: Message) => {
      console.log(`${user.username} received message:`, message);
      if (message.senderId !== user.id) {
        updateUserConnection(user.id, (prev) => ({
          messages: [...prev.messages, message]
        }));
        setTimeout(() => scrollToBottom(user.id), 100);
      }
    });

    socket.on('user_typing', (data) => {
      if (data.userId !== user.id) {
        updateUserConnection(user.id, (prev) => ({
          isTyping: {
            ...prev.isTyping,
            [data.userId]: data.isTyping
          }
        }));
      }
    });

      setUserConnections(prev => ({
        ...prev,
        [user.id]: userConnection
      }));
    } catch (error: any) {
      console.error(`Failed to initialize user ${user.username}:`, error);
      setError(`Failed to authenticate ${user.username}: ${error?.message || String(error)}`);
    }
  };

  // Helper function to update user connection
  const updateUserConnection = (userId: string, updates: Partial<UserConnection> | ((prev: UserConnection) => Partial<UserConnection>)) => {
    setUserConnections(prev => {
      const currentConnection = prev[userId];
      if (!currentConnection) return prev;

      const updatesObj = typeof updates === 'function' ? updates(currentConnection) : updates;
      
      return {
        ...prev,
        [userId]: {
          ...currentConnection,
          ...updatesObj
        }
      };
    });
  };

  // Load conversations for user
  const loadConversations = async (userId: string) => {
    const connection = userConnections[userId];
    if (!connection) return;

    try {
      const response = await fetch('http://localhost:3004/api/v1/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${connection.user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const conversations = await response.json();
        updateUserConnection(userId, { conversations });
      }
    } catch (error: any) {
      console.error(`Error loading conversations for ${userId}:`, error);
    }
  };

  // Load messages for conversation
  const loadMessages = async (userId: string, conversationId: string) => {
    const connection = userConnections[userId];
    if (!connection) return;

    try {
      const response = await fetch(`http://localhost:3004/api/v1/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${connection.user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const messages = await response.json();
        updateUserConnection(userId, { 
          messages,
          currentConversation: conversationId 
        });
        setTimeout(() => scrollToBottom(userId), 100);
      }
    } catch (error: any) {
      console.error(`Error loading messages for ${userId}:`, error);
    }
  };

  // Join conversation
  const joinConversation = (userId: string, conversationId: string) => {
    const connection = userConnections[userId];
    if (connection?.socket && connection.connected) {
      connection.socket.emit('join_conversation', { conversationId });
      loadMessages(userId, conversationId);
    }
  };

  // Send message
  const sendMessage = (userId: string) => {
    const connection = userConnections[userId];
    if (!connection?.socket || !connection.connected || !connection.currentConversation || !connection.newMessage.trim()) {
      return;
    }

    const messageData = {
      conversationId: connection.currentConversation,
      content: connection.newMessage.trim(),
      type: 'TEXT'
    };

    connection.socket.emit('send_message', messageData, (response: any) => {
      if (response.success) {
        updateUserConnection(userId, (prev) => ({
          messages: [...prev.messages, response.data],
          newMessage: ''
        }));
        setTimeout(() => scrollToBottom(userId), 100);
      } else {
        setError(`${connection.user.username}: ${response.message}`);
      }
    });
  };

  // Create test conversation between alice and bob
  const createTestConversation = async () => {
    const aliceConnection = userConnections['user1'];
    if (!aliceConnection) return;

    try {
      const response = await fetch('http://localhost:3004/api/v1/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aliceConnection.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Alice & Bob Test Chat',
          type: 'DIRECT', 
          participantIds: ['user2'] // Bob's ID
        })
      });

      if (response.ok) {
        const newConversation = await response.json();
        
        // Reload conversations for both users
        await loadConversations('user1');
        await loadConversations('user2');
        
        // Auto-join both users to the conversation
        joinConversation('user1', newConversation.id);
        joinConversation('user2', newConversation.id);
        
        console.log('Test conversation created:', newConversation);
      }
    } catch (error: any) {
      console.error('Error creating test conversation:', error);
    }
  };

  // Initialize users on mount
  useEffect(() => {
    const initializeAllUsers = async () => {
      try {
        // Initialize users sequentially to avoid rate limiting
        for (const user of TEST_USERS) {
          await initializeUser(user);
          setActiveUsers(prev => [...prev, user.id]);
        }
      } catch (error: any) {
        console.error('Failed to initialize users:', error);
        setError('Failed to initialize chat users');
      }
    };

    initializeAllUsers();

    return () => {
      // Cleanup connections
      Object.values(userConnections).forEach(connection => {
        connection.socket?.disconnect();
      });
    };
  }, []);

  // Render user chat interface
  const renderUserChat = (userId: string, isFullWidth: boolean = false) => {
    const connection = userConnections[userId];
    if (!connection) return null;

    const { user, connected, conversations, messages, currentConversation, newMessage, isTyping } = connection;

    return (
      <div className={`${isFullWidth ? 'w-full' : 'w-1/2'} bg-white border rounded-lg shadow-lg overflow-hidden`}>
        {/* Header */}
        <div className="bg-blue-600 text-white p-3">
          <h2 className="text-lg font-bold">{user.username}</h2>
          <p className="text-sm">
            {connected ? 
              <span className="text-green-300">🟢 Connected</span> : 
              <span className="text-red-300">🔴 Disconnected</span>
            }
          </p>
        </div>

        <div className="flex h-80">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => joinConversation(userId, conversation.id)}
                  className={`p-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 text-xs ${
                    currentConversation === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="font-medium">
                    {conversation.name || 
                     conversation.participants
                       ?.filter((p: any) => p.user.id !== userId)
                       ?.map((p: any) => p.user.username)
                       ?.join(', ') || 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {currentConversation ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 text-sm">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-2 py-1 rounded text-xs ${
                          message.senderId === userId
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {message.senderId !== userId && (
                          <p className="font-medium mb-1">
                            {message.sender.username}
                          </p>
                        )}
                        <p>{message.content}</p>
                        <p className="opacity-75 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicators */}
                  {Object.entries(isTyping).map(([typingUserId, typing]) => 
                    typing && (
                      <div key={typingUserId} className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                          <p className="italic">typing...</p>
                        </div>
                      </div>
                    )
                  )}
                  
                  <div ref={(el) => { messagesEndRefs.current[userId] = el; }} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-2">
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        updateUserConnection(userId, { newMessage: e.target.value });
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendMessage(userId);
                        }
                      }}
                      placeholder="Type message..."
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={!connected}
                    />
                    <button
                      onClick={() => sendMessage(userId)}
                      disabled={!connected || !newMessage.trim()}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Select conversation
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h1 className="text-2xl font-bold mb-4">Single Browser Chat Tester</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setTestMode('split')}
            className={`px-3 py-1 rounded text-sm ${
              testMode === 'split' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Split Screen Mode
          </button>
          
          <button
            onClick={() => setTestMode('switch')}
            className={`px-3 py-1 rounded text-sm ${
              testMode === 'switch' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Switch User Mode
          </button>
          
          <button
            onClick={createTestConversation}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            Create Test Conversation
          </button>
          
          <button
            onClick={() => {
              loadConversations('user1');
              loadConversations('user2');
            }}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
          >
            Refresh Conversations
          </button>
        </div>

        {/* User Switcher for Switch Mode */}
        {testMode === 'switch' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Current User:</label>
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {TEST_USERS.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className={`${testMode === 'split' ? 'flex gap-4' : ''}`}>
        {testMode === 'split' ? (
          // Split screen mode - both users visible
          <>
            {renderUserChat('user1')}
            {renderUserChat('user2')}
          </>
        ) : (
          // Switch mode - one user at a time
          renderUserChat(currentUser, true)
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Testing Instructions:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Click "Create Test Conversation" to setup chat between Alice & Bob</li>
          <li>
            {testMode === 'split' 
              ? 'Type messages in either chat window - they will appear in real-time'
              : 'Switch between users and send messages to test real-time chat'
            }
          </li>
          <li>Test typing indicators by typing in one chat</li>
          <li>Test rate limiting by sending many messages quickly</li>
          <li>Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default SingleBrowserChatTester;

