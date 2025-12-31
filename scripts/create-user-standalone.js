#!/usr/bin/env node
/**
 * Standalone script to create dev user - uses only Node.js built-ins
 * No dependencies required!
 */

const https = require('https');

const PROJECT_URL = 'https://amjjhdsbvpnjdgdlvoka.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw';

const DEV_EMAIL = 'petermvita@hotmail.com';
const DEV_USERNAME = 'pmvita';
const DEV_PASSWORD = 'admin123';

function makeRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), ok: res.statusCode >= 200 && res.statusCode < 300 });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, ok: res.statusCode >= 200 && res.statusCode < 300 });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function createUser() {
  console.log('🚀 Creating dev user...\n');
  
  try {
    // Step 1: Sign up user
    console.log('📝 Step 1: Signing up user...');
    const signUpRes = await makeRequest(
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

    if (signUpRes.ok && signUpRes.data.user) {
      console.log('✅ User created:', signUpRes.data.user.email);
      
      // Wait for profile trigger
      console.log('\n⏳ Waiting for profile creation (2 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Sign in to get access token
      console.log('🔐 Step 2: Signing in to get session...');
      const signInRes = await makeRequest(
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

      if (signInRes.ok && signInRes.data.access_token) {
        console.log('✅ Signed in successfully');
        
        // Step 3: Update profile
        console.log('\n🔄 Step 3: Updating profile with username and admin role...');
        const updateRes = await makeRequest(
          `${PROJECT_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(DEV_EMAIL)}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': ANON_KEY,
              'Authorization': `Bearer ${signInRes.data.access_token}`,
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

        if (updateRes.ok) {
          console.log('✅ Profile updated successfully!');
          console.log('\n🎉 Setup Complete!');
          console.log('\n📋 Dev User Credentials:');
          console.log(`   Email: ${DEV_EMAIL}`);
          console.log(`   Username: ${DEV_USERNAME}`);
          console.log(`   Password: ${DEV_PASSWORD}`);
          console.log(`   Role: admin`);
          console.log('\n🚀 You can now login at http://localhost:3000/login');
        } else {
          console.log('⚠️  Profile update failed:', updateRes.data);
          console.log('\n📝 Run this SQL manually to update profile:');
          console.log(`UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
        }
      } else {
        console.log('⚠️  Sign in failed:', signInRes.data);
        console.log('\n📝 Run this SQL manually to update profile:');
        console.log(`UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
      }
    } else if (signUpRes.data && (signUpRes.data.message && signUpRes.data.message.includes('already'))) {
      console.log('ℹ️  User already exists');
      console.log('\n📝 Run this SQL to ensure profile is updated:');
      console.log(`UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin', first_name = 'Peter', last_name = 'Mvita', full_name = 'Peter Mvita' WHERE email = '${DEV_EMAIL}';`);
    } else {
      console.log('❌ Signup failed:', signUpRes.data);
      console.log('\n⚠️  Please create user manually via Supabase Dashboard');
      console.log(`   Email: ${DEV_EMAIL}`);
      console.log(`   Password: ${DEV_PASSWORD}`);
      console.log('\n📝 Then run this SQL:');
      console.log(`UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createUser();

