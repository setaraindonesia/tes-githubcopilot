'use client';

import React, { useState } from 'react';
import ChatTester from '../../components/ChatTester';

// Test users - updated untuk user1 dan user2 yang baru
const TEST_USERS = [
  {
    id: 'user1',
    username: 'user1',
    email: 'user1@setaradapps.com',
    password: 'test123',
    token: ''
  },
  {
    id: 'user2', 
    username: 'user2',
    email: 'user2@setaradapps.com',
    password: 'test123',
    token: ''
  }
];

export default function ChatTestPage() {
  const [selectedUser, setSelectedUser] = useState<typeof TEST_USERS[0] | null>(null);
  const [customToken, setCustomToken] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [customUserId, setCustomUserId] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const generateTestToken = async (userId: string, username: string) => {
    try {
      // Memanggil auth service yang actual
      const response = await fetch('http://localhost:3002/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password: 'test123' // Test password
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.access_token;
      }
    } catch (error) {
      console.error('Error generating token:', error);
    }
    return null;
  };

  const handleLogin = async (user: typeof TEST_USERS[0]) => {
    const token = await generateTestToken(user.id, user.username);
    if (token) {
      setSelectedUser({ ...user, token });
    } else {
      // Fallback ke test token
      setSelectedUser(user);
    }
  };

  if (selectedUser || (useCustom && customToken && customUsername && customUserId)) {
    const userToUse = useCustom 
      ? { id: customUserId, username: customUsername, token: customToken }
      : selectedUser!;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Chat Testing Environment
            </h1>
            <button
              onClick={() => {
                setSelectedUser(null);
                setUseCustom(false);
                setCustomToken('');
                setCustomUsername('');
                setCustomUserId('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Switch User
            </button>
          </div>
          
          <ChatTester
            userToken={userToUse.token}
            username={userToUse.username}
            userId={userToUse.id}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Chat Test Login</h1>
        
        <div className="space-y-4">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h2 className="text-lg font-semibold mb-3">Choose Testing Mode:</h2>
            <div className="space-y-3">
              <a
                href="/chat-demo"
                className="block w-full p-3 text-center bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                🎭 Demo Mode (No Backend Required)
              </a>
              <p className="text-sm text-gray-600 text-center">
                Simulated chat for presentations and demos - works offline!
              </p>
              
              <a
                href="/chat-test-single"
                className="block w-full p-3 text-center bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                🖥️ Single Browser Testing (Recommended)
              </a>
              <p className="text-sm text-gray-600 text-center">
                Test both users in one browser with split-screen or user switching
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold">Or Select Test User for Multi-Browser:</h2></div>
          
          {TEST_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user)}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-xs text-gray-400">ID: {user.id}</div>
            </button>
          ))}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-3">Or use custom credentials:</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="text"
                placeholder="User ID"
                value={customUserId}
                onChange={(e) => setCustomUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <textarea
                placeholder="JWT Token"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button
                onClick={() => setUseCustom(true)}
                disabled={!customToken || !customUsername || !customUserId}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
              >
                Use Custom Credentials
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">Testing Instructions:</h4>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Open this page in 2 browser windows/tabs</li>
            <li>2. Login as different users in each window</li>
            <li>3. Create a conversation and start chatting</li>
            <li>4. Test real-time messaging, typing indicators, etc.</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">Services Required:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Auth Service: http://localhost:3002</li>
            <li>• Chat Service: http://localhost:3002</li>
            <li>• Web App Port 1: http://localhost:3000</li>
            <li>• Web App Port 2: http://localhost:3001</li>
          </ul>
        </div>
        
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h4 className="font-semibold text-green-800 mb-2">🚀 Multi-Port Testing Instructions:</h4>
          <ol className="text-sm text-green-700 space-y-1">
            <li>1. Login sebagai <strong>user1</strong> di tab ini (port 3000)</li>
            <li>2. Buka tab baru: <code className="bg-gray-200 px-1 rounded">http://localhost:3001/chat-test</code></li>
            <li>3. Login sebagai <strong>user2</strong> di tab baru (port 3001)</li>
            <li>4. Gunakan conversation ID yang sama di kedua tab</li>
            <li>5. Mulai chat real-time!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
