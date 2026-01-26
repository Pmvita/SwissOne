#!/usr/bin/env node
/**
 * Simple setup script using only Node.js built-ins (no dependencies)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// New project credentials
const PROJECT_URL = 'https://amjjhdsbvpnjdgdlvoka.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw';

// Dev user credentials
const DEV_EMAIL = 'petermvita@hotmail.com';
const DEV_USERNAME = 'pmvita';
const DEV_PASSWORD = 'admin123';

console.log('🚀 Starting SwissOne Project Setup...\n');

// Helper to make HTTP requests
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, ok: res.statusCode >= 200 && res.statusCode < 300 });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, ok: res.statusCode >= 200 && res.statusCode < 300 });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Step 1: Create environment files
console.log('📝 Step 1: Creating environment files...');

const webEnvPath = path.join(__dirname, '../apps/web/.env.local');
const mobileEnvPath = path.join(__dirname, '../apps/mobile/.env');

const webEnvContent = `# Supabase Configuration - New Project
NEXT_PUBLIC_SUPABASE_URL=${PROJECT_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}

# Service Role Key - Get from Dashboard: Settings > API > service_role key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
`;

const mobileEnvContent = `# Supabase Configuration - New Project
EXPO_PUBLIC_SUPABASE_URL=${PROJECT_URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
`;

try {
  fs.writeFileSync(webEnvPath, webEnvContent);
  console.log('✅ Created apps/web/.env.local');
} catch (error) {
  console.log('⚠️  Could not create apps/web/.env.local');
  console.log('   Content:');
  console.log(webEnvContent);
}

try {
  fs.writeFileSync(mobileEnvPath, mobileEnvContent);
  console.log('✅ Created apps/mobile/.env');
} catch (error) {
  console.log('⚠️  Could not create apps/mobile/.env');
  console.log('   Content:');
  console.log(mobileEnvContent);
}

// Step 2: Create dev user
console.log('\n👤 Step 2: Creating dev user...');

async function setupDevUser() {
  try {
    // Sign up user
    console.log('   Creating user via signup...');
    const signUpResponse = await makeRequest(
      `${PROJECT_URL}/auth/v1/signup`,
      {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json',
        }
      },
      {
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
        data: {
          username: DEV_USERNAME,
          first_name: 'Peter',
          last_name: 'Mvita',
        }
      }
    );

    if (signUpResponse.ok && signUpResponse.data.user) {
      console.log('✅ User created successfully!');
      console.log(`   Email: ${DEV_EMAIL}`);
      
      // Wait for profile trigger
      console.log('   Waiting for profile creation...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sign in to get session
      console.log('   Signing in to update profile...');
      const signInResponse = await makeRequest(
        `${PROJECT_URL}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'apikey': ANON_KEY,
            'Content-Type': 'application/json',
          }
        },
        {
          email: DEV_EMAIL,
          password: DEV_PASSWORD,
        }
      );

      if (signInResponse.ok && signInResponse.data.access_token) {
        // Update profile
        console.log('   Updating profile with username and admin role...');
        const updateResponse = await makeRequest(
          `${PROJECT_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(DEV_EMAIL)}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': ANON_KEY,
              'Authorization': `Bearer ${signInResponse.data.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            }
          },
          {
            username: DEV_USERNAME,
            role: 'admin',
            first_name: 'Peter',
            last_name: 'Mvita',
            full_name: 'Peter Mvita'
          }
        );

        if (updateResponse.ok) {
          console.log('✅ Profile updated successfully!');
        } else {
          console.log('⚠️  Profile update failed, run SQL manually:');
          console.log(`   UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
        }
      }
    } else if (signUpResponse.data.message && (signUpResponse.data.message.includes('already') || signUpResponse.data.message.includes('registered'))) {
      console.log('ℹ️  User already exists');
      console.log('   Run this SQL to ensure profile is updated:');
      console.log(`   UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
    } else {
      console.log('⚠️  User creation issue:', signUpResponse.data.message || JSON.stringify(signUpResponse.data));
      console.log('\n   Please create user manually via Dashboard and run SQL above');
    }

    console.log('\n✅ Setup Complete!');
    console.log('\n📋 Dev User Credentials:');
    console.log(`   Email: ${DEV_EMAIL}`);
    console.log(`   Username: ${DEV_USERNAME}`);
    console.log(`   Password: ${DEV_PASSWORD}`);
    console.log(`   Role: admin`);
    console.log('\n🎉 You can now login at http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Manual setup required:');
    console.log('1. Create user via Supabase Dashboard:');
    console.log(`   - Email: ${DEV_EMAIL}`);
    console.log(`   - Password: ${DEV_PASSWORD}`);
    console.log('2. Run this SQL:');
    console.log(`   UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
  }
}

setupDevUser();

