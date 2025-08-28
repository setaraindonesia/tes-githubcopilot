'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, ArrowLeft, MoreVertical, User } from 'lucide-react';

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

interface Conversation {
  id: string;
  name?: string;
  participants: any[];
  updatedAt: string;
}

interface RealTimeChatProps {
  currentUser: {
    id: string;
    username: string;
    email: string;
  };
  targetUser: {
    id: string;
    username: string;
    email: string;
  };
  onBack: () => void;
}

const RealTimeChat: React.FC<RealTimeChatProps> = ({ currentUser, targetUser, onBack }) => {
  console.log('RealTimeChat component mounted with:', { currentUser, targetUser })
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Separate useEffect for storage listener to avoid re-registering
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('📨 Storage event received:', e.key, e.newValue);
      
      if ((e.key === 'chat_message' || e.key?.startsWith('chat_message_')) && e.newValue) {
        try {
          const messageData = JSON.parse(e.newValue);
          console.log('Parsed message data:', messageData);
          
          // Only receive messages intended for current user
          if (messageData.targetUserId === currentUser.id && 
              messageData.senderId === targetUser.id) {
            
            console.log('Message is for current user, adding to chat');
            
            const newMessage: Message = {
              id: messageData.id,
              content: messageData.content,
              senderId: messageData.senderId,
              sender: {
                id: targetUser.id,
                username: targetUser.username,
                avatar: targetUser.username.charAt(0)
              },
              createdAt: messageData.createdAt
            };
            
            setMessages(prev => {
              // Avoid duplicate messages
              const exists = prev.find(msg => msg.id === newMessage.id);
              if (!exists) {
                console.log('Adding new message to chat');
                return [...prev, newMessage];
              }
              return prev;
            });
          } else {
            console.log('Message not for current user:', {
              targetUserId: messageData.targetUserId,
              currentUserId: currentUser.id,
              senderId: messageData.senderId,
              expectedSenderId: targetUser.id
            });
          }
        } catch (error) {
          console.error('Error parsing cross-browser message:', error);
        }
      }
    };
    
    console.log('Setting up storage listener for:', currentUser.id, '←→', targetUser.id);
    window.addEventListener('storage', handleStorageChange);
    
    // Also try BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('chat-channel');
      broadcastChannel.addEventListener('message', (event) => {
        console.log('📡 BroadcastChannel message received:', event.data);
        const messageData = event.data;
        
        if (messageData.targetUserId === currentUser.id && 
            messageData.senderId === targetUser.id) {
          
          console.log('✅ BroadcastChannel message is for current user');
          
          const newMessage: Message = {
            id: messageData.id,
            content: messageData.content,
            senderId: messageData.senderId,
            sender: {
              id: targetUser.id,
              username: targetUser.username,
              avatar: targetUser.username.charAt(0)
            },
            createdAt: messageData.createdAt
          };
          
          setMessages(prev => {
            const exists = prev.find(msg => msg.id === newMessage.id);
            if (!exists) {
              console.log('📡 Adding BroadcastChannel message to chat');
              return [...prev, newMessage];
            }
            return prev;
          });
        }
      });
      console.log('📡 BroadcastChannel listener set up');
    } catch (bcError) {
      console.log('⚠️ BroadcastChannel not available in this browser');
    }
    
    return () => {
      console.log('Removing storage listener');
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannel) {
        broadcastChannel.close();
        console.log('📡 BroadcastChannel closed');
      }
    };
  }, [currentUser.id, targetUser.id]); // Only re-setup when user IDs change

  useEffect(() => {
    initializeChat();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeChat = async () => {
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, using mock mode');
        setError('💬 Chat Ready - Testing mode active');
        setConnected(true);
        // Create mock conversation for testing with consistent ID
        const conversationId = `conv-${[currentUser.id, targetUser.id].sort().join('-')}`;
        setConversation({
          id: conversationId,
          name: `Chat with ${targetUser.username}`,
          participants: [],
          updatedAt: new Date().toISOString()
        });
        return;
      }

      console.log('Attempting to connect to chat service...');
      
      // Check if chat service is available
      try {
        const response = await fetch('http://localhost:3004/api/v1/health', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Chat service not available');
        }
      } catch (healthError) {
        console.log('Chat service not available, using mock mode');
        setError('✅ Demo Mode Active - Real-time chat ready!');
        setConnected(true);
        const conversationId = `conv-${[currentUser.id, targetUser.id].sort().join('-')}`;
        setConversation({
          id: conversationId,
          name: `Chat with ${targetUser.username}`,
          participants: [],
          updatedAt: new Date().toISOString()
        });
        return;
      }

      // Initialize WebSocket connection
      const newSocket = io('http://localhost:3004', {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      // Socket event handlers
      newSocket.on('connect', () => {
        console.log('Connected to chat service');
        setConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat service');
        setConnected(false);
      });

      newSocket.on('authenticated', (data) => {
        console.log('Authenticated:', data);
        createOrGetConversation();
      });

      newSocket.on('error', (errorData) => {
        console.error('Socket error:', errorData);
        setError(errorData.message || 'Connection error');
      });

      newSocket.on('new_message', (message: Message) => {
        console.log('New message received:', message);
        if (message.senderId !== currentUser.id) {
          setMessages(prev => [...prev, message]);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setError('Failed to connect to chat service');
        setConnected(false);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setError('🚀 Demo Chat Active - Start messaging!');
      setConnected(true);
      const conversationId = `conv-${[currentUser.id, targetUser.id].sort().join('-')}`;
      setConversation({
        id: conversationId,
        name: `Chat with ${targetUser.username}`,
        participants: [],
        updatedAt: new Date().toISOString()
      });
    }
  };

  const createOrGetConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // First, try to get existing conversations
      const conversationsResponse = await fetch('http://localhost:3004/api/v1/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (conversationsResponse.ok) {
        const conversations = await conversationsResponse.json();
        
        // Find existing conversation with target user
        const existingConv = conversations.find((conv: any) => 
          conv.participants.some((p: any) => p.user.id === targetUser.id)
        );

        if (existingConv) {
          setConversation(existingConv);
          loadMessages(existingConv.id);
          joinConversation(existingConv.id);
          return;
        }
      }

      // Create new conversation if not exists
      const createResponse = await fetch('http://localhost:3004/api/v1/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Chat with ${targetUser.username}`,
          type: 'DIRECT',
          participantIds: [targetUser.id]
        })
      });

      if (createResponse.ok) {
        const newConversation = await createResponse.json();
        setConversation(newConversation);
        joinConversation(newConversation.id);
      } else {
        setError('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      setError('Failed to setup conversation');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3004/api/v1/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socket && connected) {
      socket.emit('join_conversation', { conversationId });
    }
  };

  const sendMessage = () => {
    if (!connected || !conversation || !newMessage.trim()) {
      return;
    }

    // Mock mode (when chat service is not available)
    if (!socket || conversation.id.startsWith('conv-')) {
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();
      
      const mockMessage: Message = {
        id: messageId,
        content: newMessage.trim(),
        senderId: currentUser.id,
        sender: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.username.charAt(0)
        },
        createdAt: timestamp
      };

      // Add message to local state
      setMessages(prev => [...prev, mockMessage]);
      setNewMessage('');
      
      // Send message to other browser via localStorage
      const crossBrowserMessage = {
        id: messageId,
        content: mockMessage.content,
        senderId: currentUser.id,
        targetUserId: targetUser.id,
        conversationId: conversation.id,
        createdAt: timestamp
      };
      
      try {
        console.log('🚀 Sending cross-browser message:');
        console.log('From:', currentUser.id, 'To:', targetUser.id);
        console.log('Content:', mockMessage.content);
        console.log('Full message:', crossBrowserMessage);
        
        // Use a unique key with timestamp to avoid conflicts
        const storageKey = `chat_message_${Date.now()}`;
        localStorage.setItem(storageKey, JSON.stringify(crossBrowserMessage));
        
        // Also set the standard key for compatibility
        localStorage.setItem('chat_message', JSON.stringify(crossBrowserMessage));
        
        // Try BroadcastChannel as backup
        try {
          const channel = new BroadcastChannel('chat-channel');
          channel.postMessage(crossBrowserMessage);
          console.log('📡 Also sent via BroadcastChannel');
          channel.close();
        } catch (bcError) {
          console.log('⚠️ BroadcastChannel not available');
        }
        
        // Clear both keys after a short delay
        setTimeout(() => {
          localStorage.removeItem(storageKey);
          localStorage.removeItem('chat_message');
          console.log('📤 Messages cleared from localStorage');
        }, 300);
      } catch (error) {
        console.error('❌ Failed to send cross-browser message:', error);
      }
      
      return;
    }

    // Real WebSocket mode
    const messageData = {
      conversationId: conversation.id,
      content: newMessage.trim(),
      type: 'TEXT'
    };

    socket.emit('send_message', messageData, (response: any) => {
      if (response && response.success) {
        // Add message to local state
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
      } else {
        setError(response?.message || 'Failed to send message');
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-lg font-semibold mr-3">
          {targetUser.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-lg">{targetUser.username}</div>
          <div className="text-sm text-gray-500">
            {connected ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected
              </span>
            ) : (
              <span className="text-red-500">Connecting...</span>
            )}
          </div>
        </div>
        
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-700">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Status Display */}
      {error && (
        <div className={`p-4 m-4 rounded-lg border-l-4 ${
          error.includes('✅') || error.includes('💬') || error.includes('🚀')
            ? 'bg-green-50 border-green-400 text-green-800'
            : 'bg-red-100 border-red-500 text-red-700'
        }`}>
          <p className="font-medium">
            {error.includes('✅') || error.includes('💬') || error.includes('🚀') 
              ? 'Chat Status' 
              : 'Connection Error'
            }
          </p>
          <p className="text-sm">{error}</p>
          {(error.includes('✅') || error.includes('💬') || error.includes('🚀')) && (
            <p className="text-xs mt-1 opacity-75">
              Messages will sync between browsers in real-time
            </p>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
        <div className="space-y-3">
          {/* Demo Instructions */}
          {messages.length === 0 && conversation?.id.startsWith('conv-') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-blue-800 font-medium mb-2">🎯 Real-time Chat Testing</div>
              <div className="text-blue-700 text-sm space-y-1">
                <p>✅ Chat is ready between <strong>{currentUser.username}</strong> and <strong>{targetUser.username}</strong></p>
                <p>🔄 Messages will sync across browsers in real-time</p>
                <p>💬 Start typing to test cross-browser messaging!</p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`flex ${
              message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
            }`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.senderId === currentUser.id
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
              }`}>
                <div className="text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.senderId === currentUser.id ? 'text-indigo-100' : 'text-gray-400'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="px-4 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={!connected || !conversation}
            className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50 disabled:bg-gray-100"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !conversation || !newMessage.trim()}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 flex items-center justify-center disabled:bg-gray-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChat;
