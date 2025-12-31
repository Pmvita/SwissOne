#!/usr/bin/env node
/**
 * Diagnostic script to check if admin user is properly set up
 * Run: node scripts/check-user-setup.js
 */

const https = require('https');

const SUPABASE_URL = 'https://amjjhdsbvpnjdgdlvoka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw';

const USERNAME = 'pmvita';
const EMAIL = 'petermvita@hotmail.com';

console.log('🔍 Checking user setup...\n');
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Username: ${USERNAME}`);
console.log(`Email: ${EMAIL}\n`);

// Check 1: Test RPC function
console.log('1️⃣ Testing get_user_credentials_by_username RPC function...');
const rpcBody = JSON.stringify({
  username_lookup: USERNAME
});

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

const rpcReq = https.request(rpcOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`   Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      try {
        const result = JSON.parse(data);
        if (result && result.length > 0) {
          console.log(`   ✅ Found user:`, result[0]);
        } else {
          console.log(`   ❌ No user found with username "${USERNAME}"`);
          console.log(`   💡 You need to create/update the profile with username`);
        }
      } catch (e) {
        console.log(`   ⚠️  Response:`, data);
      }
    } else {
      console.log(`   ❌ Error: ${res.statusCode}`);
      console.log(`   Response:`, data);
      if (res.statusCode === 404 || data.includes('does not exist')) {
        console.log(`   💡 The RPC function might not exist. Run migration 002.`);
      }
    }
    
    // Check 2: Try to sign in
    console.log('\n2️⃣ Testing sign in with email and password...');
    const signInBody = JSON.stringify({
      email: EMAIL,
      password: 'admin123'
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
    
    const signInReq = https.request(signInOptions, (signInRes) => {
      let signInData = '';
      signInRes.on('data', (chunk) => { signInData += chunk; });
      signInRes.on('end', () => {
        console.log(`   Status: ${signInRes.statusCode}`);
        if (signInRes.statusCode === 200) {
          console.log(`   ✅ Sign in successful!`);
          try {
            const result = JSON.parse(signInData);
            console.log(`   User ID: ${result.user?.id}`);
            console.log(`   Email confirmed: ${result.user?.email_confirmed_at ? 'Yes' : 'No'}`);
          } catch (e) {
            console.log(`   Response:`, signInData);
          }
        } else {
          console.log(`   ❌ Sign in failed`);
          try {
            const error = JSON.parse(signInData);
            console.log(`   Error: ${error.error_description || error.message || JSON.stringify(error)}`);
            if (error.error_description?.includes('Invalid login')) {
              console.log(`   💡 User might not exist or password is wrong`);
              console.log(`   💡 Create user via Supabase Dashboard or check password`);
            }
          } catch (e) {
            console.log(`   Response:`, signInData);
          }
        }
        
        console.log('\n📋 Summary:');
        console.log('   If RPC function failed: Run migration 002_add_username_lookup_function.sql');
        console.log('   If sign in failed: Create user via Supabase Dashboard');
        console.log('   Dashboard: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/auth/users');
      });
    });
    
    signInReq.on('error', (e) => {
      console.error(`   ❌ Request error: ${e.message}`);
    });
    
    signInReq.write(signInBody);
    signInReq.end();
  });
});

rpcReq.on('error', (e) => {
  console.error(`   ❌ Request error: ${e.message}`);
});

rpcReq.write(rpcBody);
rpcReq.end();

