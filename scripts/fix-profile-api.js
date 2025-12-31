#!/usr/bin/env node
/**
 * Fix profile using Supabase REST API
 * This uses the service role key if available, or tries with anon key
 */

const https = require('https');

const SUPABASE_URL = 'https://amjjhdsbvpnjdgdlvoka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw';

const USER_ID = 'b55ef620-c283-48f1-9127-90be294d160e';
const USER_EMAIL = 'petermvita@hotmail.com';

const PROFILE_DATA = {
  id: USER_ID,
  email: USER_EMAIL,
  username: 'pmvita',
  role: 'admin',
  first_name: 'Peter',
  last_name: 'Mvita',
  full_name: 'Peter Mvita'
};

console.log('🔧 Fixing profile via Supabase REST API...\n');
console.log('User ID:', USER_ID);
console.log('Email:', USER_EMAIL);
console.log('Username:', PROFILE_DATA.username);
console.log('');

// Method 1: Try upsert with anon key (might fail due to RLS)
const updateProfile = (useServiceRole = false) => {
  return new Promise((resolve) => {
    const body = JSON.stringify(PROFILE_DATA);
    
    const options = {
      hostname: 'amjjhdsbvpnjdgdlvoka.supabase.co',
      path: '/rest/v1/profiles',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log(`   ✅ Profile updated successfully!`);
          try {
            const result = JSON.parse(data);
            console.log('   Result:', result);
            resolve({ success: true, data: result });
          } catch (e) {
            resolve({ success: true, data });
          }
        } else {
          console.log(`   ❌ Failed with status ${res.statusCode}`);
          console.log(`   Response:`, data);
          
          // If 401/403, might need service role key
          if (res.statusCode === 401 || res.statusCode === 403) {
            console.log('\n   💡 This requires service role key for RLS bypass.');
            console.log('   Get it from: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/settings/api');
            console.log('   Then set SUPABASE_SERVICE_ROLE_KEY in .env.local and run again.\n');
          }
          
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`   ❌ Request error: ${e.message}`);
      resolve({ success: false, error: e.message });
    });

    req.write(body);
    req.end();
  });
};

// Method 2: Use PATCH to update existing profile
const patchProfile = () => {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      username: PROFILE_DATA.username,
      role: PROFILE_DATA.role,
      first_name: PROFILE_DATA.first_name,
      last_name: PROFILE_DATA.last_name,
      full_name: PROFILE_DATA.full_name
    });
    
    const options = {
      hostname: 'amjjhdsbvpnjdgdlvoka.supabase.co',
      path: `/rest/v1/profiles?id=eq.${USER_ID}`,
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          console.log(`   ✅ Profile patched successfully!`);
          try {
            const result = JSON.parse(data);
            console.log('   Result:', result);
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
  console.log('1️⃣ Trying to upsert profile...\n');
  const upsertResult = await updateProfile();
  
  if (!upsertResult.success) {
    console.log('\n2️⃣ Trying to patch existing profile...\n');
    const patchResult = await patchProfile();
    
    if (!patchResult.success) {
      console.log('\n❌ Both methods failed. This is likely due to RLS (Row Level Security) policies.');
      console.log('\n📋 Solution: Run SQL directly in Supabase Dashboard');
      console.log('   URL: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/sql/new');
      console.log('\n   SQL:');
      console.log('   ```sql');
      console.log(`   INSERT INTO profiles (id, email, username, role, first_name, last_name, full_name)`);
      console.log(`   VALUES ('${USER_ID}', '${USER_EMAIL}', '${PROFILE_DATA.username}', '${PROFILE_DATA.role}', '${PROFILE_DATA.first_name}', '${PROFILE_DATA.last_name}', '${PROFILE_DATA.full_name}')`);
      console.log(`   ON CONFLICT (id) DO UPDATE SET`);
      console.log(`     username = '${PROFILE_DATA.username}',`);
      console.log(`     role = '${PROFILE_DATA.role}',`);
      console.log(`     first_name = '${PROFILE_DATA.first_name}',`);
      console.log(`     last_name = '${PROFILE_DATA.last_name}',`);
      console.log(`     full_name = '${PROFILE_DATA.full_name}';`);
      console.log('   ```\n');
    } else {
      console.log('\n✅ Profile fixed! Try logging in now.');
    }
  } else {
    console.log('\n✅ Profile fixed! Try logging in now.');
  }
  
  // Verify
  console.log('\n3️⃣ Verifying profile...\n');
  const verifyOptions = {
    hostname: 'amjjhdsbvpnjdgdlvoka.supabase.co',
    path: `/rest/v1/profiles?username=eq.${PROFILE_DATA.username}&select=email,username,role`,
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept': 'application/json'
    }
  };

  const verifyReq = https.request(verifyOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          if (result && result.length > 0) {
            console.log('   ✅ Profile verified:');
            console.log('   ', result[0]);
          } else {
            console.log('   ⚠️  Profile not found with username');
          }
        } catch (e) {
          console.log('   Response:', data);
        }
      }
    });
  });

  verifyReq.on('error', () => {});
  verifyReq.end();
})();

