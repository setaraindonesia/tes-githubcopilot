#!/usr/bin/env node

/**
 * Railway Services Health Check & Testing Script
 * 
 * Usage:
 * 1. Get URLs from Railway Dashboard
 * 2. Run: node test-railway-services.js <auth-url> <chat-url>
 * 
 * Example:
 * node test-railway-services.js https://auth-service-production-1234.up.railway.app https://chat-service-production-5678.up.railway.app
 */

const https = require('https');
const http = require('http');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(url, description, expectedContent = null) {
  return new Promise((resolve) => {
    if (!url) {
      log('yellow', `⏭️  ${description}: URL not provided`);
      resolve({ success: false, reason: 'No URL' });
      return;
    }

    const client = url.startsWith('https') ? https : http;
    log('blue', `🔍 Testing ${description}: ${url}`);
    
    const startTime = Date.now();
    const req = client.get(url, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const statusOk = res.statusCode >= 200 && res.statusCode < 300;
        const contentOk = !expectedContent || data.includes(expectedContent);
        
        if (statusOk && contentOk) {
          log('green', `✅ ${description} - ${res.statusCode} (${duration}ms)`);
          try {
            const parsed = JSON.parse(data);
            console.log(`   Response:`, parsed);
          } catch {
            console.log(`   Response:`, data.substring(0, 100));
          }
          resolve({ success: true, status: res.statusCode, duration, data });
        } else {
          log('red', `❌ ${description} - ${res.statusCode} (${duration}ms)`);
          console.log(`   Response:`, data.substring(0, 200));
          resolve({ success: false, status: res.statusCode, duration, data });
        }
      });
    });
    
    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      log('red', `❌ ${description} - Error: ${err.message} (${duration}ms)`);
      resolve({ success: false, error: err.message, duration });
    });
    
    req.setTimeout(15000, () => {
      req.abort();
      log('yellow', `⏰ ${description} - Timeout after 15s`);
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function testChatAPI(chatUrl) {
  if (!chatUrl) return { success: false, reason: 'No Chat URL' };
  
  // Test conversations endpoint (should require auth, but should respond)
  const conversationsUrl = `${chatUrl}/api/v1/chat/conversations`;
  return await testEndpoint(conversationsUrl, 'Chat API (Conversations)', null);
}

async function main() {
  const [,, authUrl, chatUrl] = process.argv;
  
  log('bright', '🚀 RAILWAY SERVICES HEALTH CHECK');
  log('cyan', '================================\n');
  
  if (!authUrl && !chatUrl) {
    log('yellow', '📖 Usage Instructions:');
    log('white', '1. Go to Railway Dashboard:');
    log('cyan', '   https://railway.app/project/6462810f-8c5e-42f7-a39c-4226ad83e9a2\n');
    log('white', '2. Get service URLs:');
    log('cyan', '   • Click "auth service" → Settings → Domains → Copy URL');
    log('cyan', '   • Click "chat service" → Settings → Domains → Copy URL\n');
    log('white', '3. Run this script:');
    log('green', '   node test-railway-services.js <auth-url> <chat-url>\n');
    log('yellow', 'Example:');
    log('cyan', '   node test-railway-services.js https://auth-service-production.up.railway.app https://chat-service-production.up.railway.app');
    return;
  }
  
  const tests = [];
  
  // Auth Service Tests
  if (authUrl) {
    tests.push(
      testEndpoint(`${authUrl}/api/v1/health`, 'Auth Service Health'),
      testEndpoint(`${authUrl}/api/v1/auth/test`, 'Auth API (Test endpoint)', null)
    );
  }
  
  // Chat Service Tests  
  if (chatUrl) {
    tests.push(
      testEndpoint(`${chatUrl}/api/v1/chat/health`, 'Chat Service Health'),
      testChatAPI(chatUrl)
    );
  }
  
  log('cyan', 'Starting tests...\n');
  const results = await Promise.all(tests);
  
  // Summary
  log('bright', '\n📊 DEPLOYMENT SUMMARY');
  log('cyan', '====================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  if (authUrl) {
    const authHealth = results.find(r => r.data && r.data.includes && r.data.includes('Auth'));
    log(authHealth?.success ? 'green' : 'red', 
        `Auth Service: ${authHealth?.success ? '✅ ONLINE' : '❌ OFFLINE'}`);
  }
  
  if (chatUrl) {
    const chatHealth = results.find(r => r.data && r.data.includes && r.data.includes('Chat'));
    log(chatHealth?.success ? 'green' : 'red', 
        `Chat Service: ${chatHealth?.success ? '✅ ONLINE' : '❌ OFFLINE'}`);
  }
  
  log('cyan', `\nOverall: ${successful}/${total} tests passed`);
  
  if (successful === total && total > 0) {
    log('green', '\n🎉 ALL SERVICES HEALTHY!');
    log('white', '\n✅ Next Steps:');
    log('cyan', '1. Update Vercel environment variables with these URLs');
    log('cyan', '2. Test end-to-end chat functionality from frontend');
    log('cyan', '3. Verify real-time messaging works');
  } else {
    log('red', '\n⚠️  SOME SERVICES HAVE ISSUES');
    log('white', '\n🔧 Troubleshooting:');
    log('cyan', '1. Check Railway Dashboard → Services → Deployments');
    log('cyan', '2. Look for error messages in build/runtime logs');
    log('cyan', '3. Verify environment variables are set');
    log('cyan', '4. Try non-Docker deployment if Docker continues to fail');
    
    if (!authUrl || !chatUrl) {
      log('yellow', '\n💡 TIP: Provide both URLs for complete testing');
    }
  }
  
  log('white', '\n📄 Deployment guides available:');
  log('cyan', '• RAILWAY_NON_DOCKER_SETUP.md (backup plan)');
  log('cyan', '• EMERGENCY_BACKUP_PLAN.md (fallback options)');
}

main().catch(console.error);
