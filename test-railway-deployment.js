#!/usr/bin/env node

/**
 * Test Railway Deployment Script
 * Usage: node test-railway-deployment.js <auth-url> <chat-url>
 */

const https = require('https');
const http = require('http');

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    console.log(`Testing ${description}: ${url}`);
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ ${description} - Status: ${res.statusCode}`, parsed);
          resolve({ success: true, status: res.statusCode, data: parsed });
        } catch (e) {
          console.log(`⚠️  ${description} - Status: ${res.statusCode} (Non-JSON response)`);
          resolve({ success: false, status: res.statusCode, error: 'Non-JSON response' });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description} - Error:`, err.message);
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      req.abort();
      console.log(`⏰ ${description} - Timeout after 10s`);
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function main() {
  const [,, authUrl, chatUrl] = process.argv;
  
  if (!authUrl || !chatUrl) {
    console.log('Usage: node test-railway-deployment.js <auth-url> <chat-url>');
    console.log('Example: node test-railway-deployment.js https://auth-service.railway.app https://chat-service.railway.app');
    process.exit(1);
  }
  
  console.log('🚀 Testing Railway Deployment...\n');
  
  // Test Auth Service Health
  const authHealth = await testEndpoint(`${authUrl}/api/v1/health`, 'Auth Service Health');
  
  // Test Chat Service Health  
  const chatHealth = await testEndpoint(`${chatUrl}/api/v1/chat/health`, 'Chat Service Health');
  
  console.log('\n📊 Summary:');
  console.log(`Auth Service: ${authHealth.success ? '✅ Online' : '❌ Offline'}`);
  console.log(`Chat Service: ${chatHealth.success ? '✅ Online' : '❌ Offline'}`);
  
  if (authHealth.success && chatHealth.success) {
    console.log('\n🎉 All services are healthy! Ready for frontend integration.');
    console.log('\nNext steps:');
    console.log('1. Update Vercel environment variables:');
    console.log(`   NEXT_PUBLIC_CHAT_API_BASE=${chatUrl}`);
    console.log(`   NEXT_PUBLIC_CHAT_WS_URL=${chatUrl.replace('https://', 'wss://')}`);
    console.log('2. Redeploy Vercel frontend');
    console.log('3. Test end-to-end chat functionality');
  } else {
    console.log('\n⚠️  Some services are not responding. Check Railway logs.');
  }
}

main().catch(console.error);
