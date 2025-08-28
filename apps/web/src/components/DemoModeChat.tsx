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

const DEMO_USERS: User[] = [
  {
    id: 'demo-alice',
    username: 'Alice',
    email: 'alice@demo.com',
    token: 'demo-token-alice'
  },
  {
    id: 'demo-bob',
    username: 'Bob',
    email: 'bob@demo.com', 
    token: 'demo-token-bob'
  }
];

const DEMO_MESSAGES = [
  { user: 'Alice', message: 'Hello Bob! How are you?' },
  { user: 'Bob', message: 'Hi Alice! I\'m doing great, thanks!' },
  { user: 'Alice', message: 'That\'s wonderful to hear 😊' },
  { user: 'Bob', message: 'How\'s the new chat system working?' },
  { user: 'Alice', message: 'It\'s amazing! Real-time messaging works perfectly!' },
  { user: 'Bob', message: 'Great! I can see typing indicators too!' },
  { user: 'Alice', message: 'Yes, and read receipts are working!' },
  { user: 'Bob', message: 'This will be perfect for production! 🚀' }
];

const DemoModeChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(2000); // milliseconds between messages
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTyping, setShowTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, autoScroll]);

  const generateMessageId = () => `demo-msg-${Date.now()}-${Math.random()}`;

  const addMessage = (demoMessage: typeof DEMO_MESSAGES[0], delay: number = 0) => {
    const userId = demoMessage.user === 'Alice' ? 'demo-alice' : 'demo-bob';
    const user = DEMO_USERS.find(u => u.id === userId)!;

    // Show typing indicator
    setShowTyping(user.username);

    setTimeout(() => {
      // Hide typing indicator and add message
      setShowTyping(null);
      
      const message: Message = {
        id: generateMessageId(),
        content: demoMessage.message,
        senderId: userId,
        sender: {
          id: userId,
          username: user.username,
          avatar: undefined
        },
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, message]);
    }, delay);
  };

  const startDemo = () => {
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      return;
    }

    setMessages([]);
    setCurrentMessageIndex(0);
    setIsRunning(true);
    setIsPaused(false);

    // Start the message sequence
    runMessageSequence(0);
  };

  const runMessageSequence = (index: number) => {
    if (index >= DEMO_MESSAGES.length) {
      setIsRunning(false);
      return;
    }

    const typingDelay = Math.random() * 1000 + 500; // 0.5-1.5s typing delay
    addMessage(DEMO_MESSAGES[index], typingDelay);

    intervalRef.current = setTimeout(() => {
      setCurrentMessageIndex(index + 1);
      if (!isPaused) {
        runMessageSequence(index + 1);
      }
    }, speed + typingDelay);
  };

  const pauseDemo = () => {
    setIsPaused(true);
    setIsRunning(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    setShowTyping(null);
  };

  const resetDemo = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentMessageIndex(0);
    setMessages([]);
    setShowTyping(null);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const addManualMessage = (username: string, content: string) => {
    if (!content.trim()) return;

    const userId = username === 'Alice' ? 'demo-alice' : 'demo-bob';
    const user = DEMO_USERS.find(u => u.id === userId)!;

    const message: Message = {
      id: generateMessageId(),
      content: content.trim(),
      senderId: userId,
      sender: {
        id: userId,
        username: user.username,
        avatar: undefined
      },
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <h1 className="text-2xl font-bold">Chat Demo Mode</h1>
          <p className="text-sm opacity-90">
            Simulated chat between Alice and Bob - No backend required!
          </p>
        </div>

        {/* Controls */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={startDemo}
              disabled={isRunning}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              {isPaused ? 'Resume' : 'Start'} Demo
            </button>
            
            <button
              onClick={pauseDemo}
              disabled={!isRunning}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-300"
            >
              Pause
            </button>
            
            <button
              onClick={resetDemo}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <label>Speed:</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value={1000}>Fast (1s)</option>
                <option value={2000}>Normal (2s)</option>
                <option value={3000}>Slow (3s)</option>
                <option value={5000}>Very Slow (5s)</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              Auto Scroll
            </label>

            <div className="text-gray-600">
              Progress: {currentMessageIndex}/{DEMO_MESSAGES.length}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === 'demo-alice' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
                    message.senderId === 'demo-alice'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      message.senderId === 'demo-alice' ? 'bg-blue-200' : 'bg-green-500'
                    }`}></div>
                    <p className="text-xs font-medium opacity-75">
                      {message.sender.username}
                    </p>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {showTyping && (
              <div className={`flex ${
                showTyping === 'Alice' ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`px-4 py-2 rounded-lg ${
                  showTyping === 'Alice' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs italic">{showTyping} is typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Manual Message Input */}
        <div className="border-t border-gray-200 p-4">
          <h3 className="font-medium mb-2">Send Manual Message:</h3>
          <div className="flex gap-2">
            <select
              id="manual-user"
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="Alice">Alice</option>
              <option value="Bob">Bob</option>
            </select>
            <input
              type="text"
              id="manual-message"
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded px-3 py-2"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const userSelect = document.getElementById('manual-user') as HTMLSelectElement;
                  const messageInput = document.getElementById('manual-message') as HTMLInputElement;
                  addManualMessage(userSelect.value, messageInput.value);
                  messageInput.value = '';
                }
              }}
            />
            <button
              onClick={() => {
                const userSelect = document.getElementById('manual-user') as HTMLSelectElement;
                const messageInput = document.getElementById('manual-message') as HTMLInputElement;
                addManualMessage(userSelect.value, messageInput.value);
                messageInput.value = '';
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-1">Demo Features:</h4>
            <ul className="space-y-1 text-xs">
              <li>• Simulated real-time messaging between two users</li>
              <li>• Typing indicators with realistic delays</li>
              <li>• Manual message sending for interactive testing</li>
              <li>• No backend connection required - perfect for demos!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoModeChat;


