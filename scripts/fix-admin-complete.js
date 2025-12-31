#!/usr/bin/env node
/**
 * Complete fix for admin user - creates user, confirms email, and sets up profile
 * Requires service role key for full access
 * Run: node scripts/fix-admin-complete.js
 */

const https = require('https');

const SUPABASE_URL = 'https://amjjhdsbvpnjdgdlvoka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw';

const USER_DATA = {
  email: 'petermvita@hotmail.com',
  password: 'admin123',
  username: 'pmvita',
  first_name: 'Peter',
  last_name: 'Mvita',
  full_name: 'Peter Mvita'
};

console.log('🔧 Complete Admin User Fix\n');
console.log('⚠️  This script will guide you through the complete setup.\n');

// Step 1: Check current state
console.log('1️⃣ Checking current user state...\n');

// Check RPC function
const checkRPC = () => {
  return new Promise((resolve) => {
    const rpcBody = JSON.stringify({ username_lookup: USER_DATA.username });
    const rpcOptions = {
      hostname: 'amjjhdsbvpnjdgdlvoka.supabase.co',
      path: '/rest/v1/rpc/get_user_credentials_by_username',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(rpcOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            if (result && result.length > 0) {
              console.log('   ✅ Profile found with username:', result[0]);
              resolve({ profileExists: true, email: result[0].email });
            } else {
              console.log('   ❌ No profile with username "pmvita"');
              resolve({ profileExists: false });
            }
          } catch (e) {
            resolve({ profileExists: false, error: data });
          }
        } else {
          console.log(`   ⚠️  RPC function status: ${res.statusCode}`);
          resolve({ profileExists: false, error: data });
        }
      });
    });

    req.on('error', (e) => {
      console.log(`   ❌ Error: ${e.message}`);
      resolve({ profileExists: false, error: e.message });
    });

    req.write(rpcBody);
    req.end();
  });
};

// Check auth user
const checkAuth = () => {
  return new Promise((resolve) => {
    const signInBody = JSON.stringify({
      email: USER_DATA.email,
      password: USER_DATA.password
    });

    const signInOptions = {
      hostname: 'amjjhdsbvpnjdgdlvoka.supabase.co',
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(signInOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Auth user exists and password works!');
          resolve({ authExists: true, confirmed: true });
        } else {
          try {
            const error = JSON.parse(data);
            if (error.error_description?.includes('Email not confirmed')) {
              console.log('   ⚠️  Auth user exists but email not confirmed');
              resolve({ authExists: true, confirmed: false });
            } else {
              console.log('   ❌ Auth user issue:', error.error_description || error.msg);
              resolve({ authExists: false, error: error.error_description || error.msg });
            }
          } catch (e) {
            resolve({ authExists: false, error: data });
          }
        }
      });
    });

    req.on('error', (e) => {
      resolve({ authExists: false, error: e.message });
    });

    req.write(signInBody);
    req.end();
  });
};

(async () => {
  const rpcResult = await checkRPC();
  console.log('');
  const authResult = await checkAuth();
  console.log('');

  console.log('📋 Current Status:');
  console.log(`   Profile with username: ${rpcResult.profileExists ? '✅ Yes' : '❌ No'}`);
  console.log(`   Auth user exists: ${authResult.authExists ? '✅ Yes' : '❌ No'}`);
  console.log(`   Email confirmed: ${authResult.confirmed ? '✅ Yes' : '❌ No'}`);
  console.log('');

  if (!rpcResult.profileExists || !authResult.confirmed) {
    console.log('🔧 Required Fixes:\n');
    
    if (!rpcResult.profileExists) {
      console.log('1. Profile needs username and role set');
      console.log('   Run this SQL in Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/sql/new\n');
      console.log('   ```sql');
      console.log('   -- Get user ID first');
      console.log(`   SELECT id, email FROM auth.users WHERE email = '${USER_DATA.email}';`);
      console.log('');
      console.log('   -- Then create/update profile (replace USER_ID with actual ID)');
      console.log('   INSERT INTO profiles (id, email, username, role, first_name, last_name, full_name)');
      console.log(`   VALUES ('USER_ID', '${USER_DATA.email}', '${USER_DATA.username}', 'admin', '${USER_DATA.first_name}', '${USER_DATA.last_name}', '${USER_DATA.full_name}')`);
      console.log('   ON CONFLICT (id) DO UPDATE SET');
      console.log(`     username = '${USER_DATA.username}',`);
      console.log(`     role = 'admin',`);
      console.log(`     first_name = '${USER_DATA.first_name}',`);
      console.log(`     last_name = '${USER_DATA.last_name}',`);
      console.log(`     full_name = '${USER_DATA.full_name}';`);
      console.log('   ```\n');
    }

    if (!authResult.confirmed) {
      console.log('2. Email needs to be confirmed');
      console.log('   Run this SQL:');
      console.log('   ```sql');
      console.log(`   UPDATE auth.users`);
      console.log(`   SET email_confirmed_at = NOW()`);
      console.log(`   WHERE email = '${USER_DATA.email}';`);
      console.log('   ```\n');
    }

    console.log('💡 OR use the Supabase Dashboard:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/auth/users');
    console.log(`   2. Find user: ${USER_DATA.email}`);
    console.log('   3. Click "..." → "Send magic link" or manually confirm email');
    console.log('   4. Then run the profile SQL above\n');
  } else {
    console.log('✅ Everything looks good!');
    console.log('   Try logging in at: http://localhost:3000/login');
    console.log(`   Username: ${USER_DATA.username}`);
    console.log(`   Password: ${USER_DATA.password}\n`);
  }
})();

