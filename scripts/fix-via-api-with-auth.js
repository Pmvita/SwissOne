#!/usr/bin/env node
/**
 * Fix profile by signing in first (to get session), then updating profile
 * This should work because the user can update their own profile
 */

const https = require('https');

const SUPABASE_URL = 'https://amjjhdsbvpnjdgdlvoka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw';

const USER_EMAIL = 'petermvita@hotmail.com';
const USER_PASSWORD = 'admin123';
const USER_ID = 'b55ef620-c283-48f1-9127-90be294d160e';

console.log('🔧 Fixing profile via authenticated session...\n');

// Step 1: Sign in to get access token
const signIn = () => {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      email: USER_EMAIL,
      password: USER_PASSWORD
    });

    const options = {
      hostname: 'amjjhdsbvpnjdgdlvoka.supabase.co',
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            resolve({ success: true, accessToken: result.access_token });
          } catch (e) {
            resolve({ success: false, error: data });
          }
        } else {
          resolve({ success: false, error: data });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });

    req.write(body);
    req.end();
  });
};

// Step 2: Update profile with access token
const updateProfile = (accessToken) => {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      username: 'pmvita',
      role: 'admin',
      first_name: 'Peter',
      last_name: 'Mvita',
      full_name: 'Peter Mvita'
    });

    const options = {
      hostname: 'amjjhdsbvpnjdgdlvoka.supabase.co',
      path: `/rest/v1/profiles?id=eq.${USER_ID}`,
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          try {
            const result = JSON.parse(data);
            resolve({ success: true, data: result });
          } catch (e) {
            resolve({ success: true, data });
          }
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });

    req.write(body);
    req.end();
  });
};

(async () => {
  console.log('1️⃣ Signing in to get access token...\n');
  const signInResult = await signIn();

  if (!signInResult.success) {
    console.log('❌ Sign in failed:', signInResult.error);
    return;
  }

  console.log('✅ Signed in successfully\n');
  console.log('2️⃣ Updating profile with authenticated session...\n');
  
  const updateResult = await updateProfile(signInResult.accessToken);

  if (updateResult.success) {
    console.log('✅ Profile updated successfully!');
    console.log('   Result:', updateResult.data);
    console.log('\n🎉 Try logging in now at: http://localhost:3000/login');
    console.log('   Username: pmvita');
    console.log('   Password: admin123\n');
  } else {
    console.log('❌ Profile update failed');
    console.log('   Status:', updateResult.statusCode);
    console.log('   Error:', updateResult.error);
    console.log('\n💡 This might require running SQL directly in Supabase Dashboard');
  }
})();

