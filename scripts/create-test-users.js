const axios = require('axios');

const TEST_USERS = [
  {
    username: 'alice',
    email: 'alice@test.com',
    password: 'test123',
    firstName: 'Alice',
    lastName: 'Johnson'
  },
  {
    username: 'bob',
    email: 'bob@test.com', 
    password: 'test123',
    firstName: 'Bob',
    lastName: 'Smith'
  },
  {
    username: 'charlie',
    email: 'charlie@test.com',
    password: 'test123', 
    firstName: 'Charlie',
    lastName: 'Brown'
  }
];

const AUTH_SERVICE_URL = 'http://localhost:3003/api/v1/auth';

async function createTestUsers() {
  console.log('🚀 Creating test users for chat testing...\n');

  for (const user of TEST_USERS) {
    try {
      // Try to create user
      const registerResponse = await axios.post(`${AUTH_SERVICE_URL}/register`, user);
      console.log(`✅ Created user: ${user.username} (${registerResponse.data.id})`);
      
      // Login to get token
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/login`, {
        username: user.username,
        password: user.password
      });
      
      console.log(`🔑 Token for ${user.username}:`);
      console.log(`   ${loginResponse.data.access_token}\n`);
      
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  User ${user.username} already exists, getting token...`);
        
        try {
          // Try to login existing user
          const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/login`, {
            username: user.username,
            password: user.password
          });
          
          console.log(`🔑 Token for ${user.username}:`);
          console.log(`   ${loginResponse.data.access_token}\n`);
          
        } catch (loginError) {
          console.error(`❌ Failed to login ${user.username}:`, loginError.response?.data || loginError.message);
        }
      } else {
        console.error(`❌ Failed to create ${user.username}:`, error.response?.data || error.message);
      }
    }
  }

  console.log('🎉 Test users setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Copy the tokens above');
  console.log('2. Open http://localhost:3000/chat-test');
  console.log('3. Use the tokens or login with username/password');
  console.log('4. Open multiple browser windows/tabs to test chat');
}

// Check if auth service is running
async function checkAuthService() {
  try {
    await axios.get(`${AUTH_SERVICE_URL.replace('/api/v1/auth', '')}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if auth service is running...');
  
  const isRunning = await checkAuthService();
  if (!isRunning) {
    console.log('❌ Auth service is not running on http://localhost:3003');
    console.log('Please start the auth service first:\n');
    console.log('cd services/auth-service');
    console.log('npm run start:dev\n');
    process.exit(1);
  }
  
  console.log('✅ Auth service is running\n');
  await createTestUsers();
}

main().catch(console.error);

