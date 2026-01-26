#!/usr/bin/env node
/**
 * Test the login API endpoint directly
 * 
 * Usage:
 *   node scripts/test-login-api.js [username] [password]
 *   Or set TEST_USERNAME and TEST_PASSWORD environment variables
 */

const https = require('https');

const USERNAME = process.env.TEST_USERNAME || process.argv[2] || 'testuser';
const PASSWORD = process.env.TEST_PASSWORD || process.argv[3] || 'testpass';

console.log('🧪 Testing Login API Endpoint\n');
console.log('Username:', USERNAME);
console.log('Password:', '***' + PASSWORD.slice(-2)); // Only show last 2 chars
console.log('');

const loginBody = JSON.stringify({
  username: USERNAME,
  password: PASSWORD
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginBody)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:', data);
    
    if (res.statusCode === 307 || res.statusCode === 308) {
      const location = res.headers.location;
      console.log('\n✅ Redirect received!');
      console.log('Location:', location);
      console.log('Cookies:', res.headers['set-cookie']);
    } else if (res.statusCode === 401) {
      console.log('\n❌ Authentication failed');
      try {
        const error = JSON.parse(data);
        console.log('Error message:', error.error);
      } catch (e) {
        console.log('Raw error:', data);
      }
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  console.log('\n💡 Make sure the dev server is running: npm run dev:web');
});

req.write(loginBody);
req.end();

