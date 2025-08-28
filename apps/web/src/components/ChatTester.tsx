'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiFetch, getChatWsUrl } from '@/lib/chatApi';

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
  role: string;
}

interface Conversation {
  id: string;
  name?: string;
  type: string;
  participants: Array<{
    user: User;
  }>;
  messages: Message[];
}

interface ChatTesterProps {
  userToken: string;
  username: string;
  userId: string;
}

const ChatTester: React.FC<ChatTesterProps> = ({ userToken, username, userId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(getChatWsUrl(), {
      auth: {
        token: userToken
      },
      transports: ['websocket', 'polling']
    });

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
      console.log('Authentication successful:', data);
      loadConversations();
    });

    newSocket.on('error', (errorData) => {
      console.error('Chat error:', errorData);
      setError(errorData.message);
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('New message received:', message);
      if (message.senderId !== userId) {
        setMessages(prev => [...prev, message]);
      }
    });

    newSocket.on('user_joined', (data) => {
      console.log('User joined:', data);
    });

    newSocket.on('user_left', (data) => {
      console.log('User left:', data);
    });

    newSocket.on('user_typing', (data) => {
      if (data.userId !== userId) {
        setIsTyping(prev => ({
          ...prev,
          [data.userId]: data.isTyping
        }));
      }
    });

    newSocket.on('message_read', (data) => {
      console.log('Message read:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userToken, userId]);

  const loadConversations = async () => {
    try {
      const data = await apiFetch<Conversation[]>('conversations', { token: userToken });
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const createConversation = async (participantUsername: string) => {
    try {
      // First, we need to find the user by username (this would typically be a search endpoint)
      const participantId = prompt('Enter participant user ID:');
      if (!participantId) return;

      const newConversation = await apiFetch<Conversation>('conversations', {
        method: 'POST',
        token: userToken,
        body: JSON.stringify({
          name: `Chat with ${participantUsername}`,
          type: 'DIRECT',
          participantIds: [participantId]
        })
      });
      setConversations(prev => [...prev, newConversation]);
      setCurrentConversation(newConversation.id);
      loadMessages(newConversation.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await apiFetch<Message[]>(`conversations/${conversationId}/messages`, { token: userToken });
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socket && connected) {
      socket.emit('join_conversation', { conversationId });
      setCurrentConversation(conversationId);
      loadMessages(conversationId);
    }
  };

  const sendMessage = () => {
    if (socket && connected && currentConversation && newMessage.trim()) {
      const messageData = {
        conversationId: currentConversation,
        content: newMessage.trim(),
        type: 'TEXT'
      };

      socket.emit('send_message', messageData, (response: any) => {
        if (response.success) {
          setMessages(prev => [...prev, response.data]);
          setNewMessage('');
        } else {
          setError(response.message);
        }
      });
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && connected && currentConversation) {
      const event = isTyping ? 'typing_start' : 'typing_stop';
      socket.emit(event, { conversationId: currentConversation });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      handleTyping(false);
    }
  };

  const currentConversationData = conversations.find(c => c.id === currentConversation);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">Chat Tester - {username}</h1>
          <p className="text-sm">
            Status: {connected ? 
              <span className="text-green-300">🟢 Connected</span> : 
              <span className="text-red-300">🔴 Disconnected</span>
            }
          </p>
          {error && (
            <p className="text-red-300 text-sm mt-1">Error: {error}</p>
          )}
        </div>

        <div className="flex h-96">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <button
                onClick={() => {
                  const username = prompt('Enter username to chat with:');
                  if (username) createConversation(username);
                }}
                className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                New Chat
              </button>
            </div>
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => joinConversation(conversation.id)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 ${
                    currentConversation === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="font-medium text-sm">
                    {conversation.name || 
                     conversation.participants
                       .filter(p => p.user.id !== userId)
                       .map(p => p.user.username)
                       .join(', ') || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {conversation.messages[0]?.content.substring(0, 30) || 'No messages'}
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
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.senderId === userId
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {message.senderId !== userId && (
                          <p className="text-xs font-medium mb-1">
                            {message.sender.username}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicators */}
                  {Object.entries(isTyping).map(([userId, typing]) => 
                    typing && (
                      <div key={userId} className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg">
                          <p className="text-sm italic">typing...</p>
                        </div>
                      </div>
                    )
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (e.target.value) {
                          handleTyping(true);
                        } else {
                          handleTyping(false);
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      onBlur={() => handleTyping(false)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!connected}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!connected || !newMessage.trim()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTester;

