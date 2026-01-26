#!/usr/bin/env node
/**
 * Create admin user in Supabase
 * Run: node scripts/create-admin-user.js
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

console.log('🚀 Creating admin user...\n');
console.log('Email:', USER_DATA.email);
console.log('Username:', USER_DATA.username);
console.log('Password:', USER_DATA.password);
console.log('');

// Step 1: Create auth user
console.log('1️⃣ Creating auth user...');
const signUpBody = JSON.stringify({
  email: USER_DATA.email,
  password: USER_DATA.password,
  data: {
    username: USER_DATA.username,
    first_name: USER_DATA.first_name,
    last_name: USER_DATA.last_name,
    full_name: USER_DATA.full_name
  }
});

const signUpOptions = {
  hostname: 'amjjhdsbvpnjdgdlvoka.supabase.co',
  path: '/auth/v1/signup',
  method: 'POST',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  }
};

const signUpReq = https.request(signUpOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`   Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      try {
        const result = JSON.parse(data);
        console.log(`   ✅ Auth user created!`);
        console.log(`   User ID: ${result.user?.id}`);
        console.log(`   Email confirmed: ${result.user?.email_confirmed_at ? 'Yes' : 'No'}`);
        
        if (!result.user?.email_confirmed_at) {
          console.log(`   ⚠️  Email not confirmed. You may need to confirm via Dashboard.`);
        }
        
        // Step 2: Update profile with username and role
        console.log('\n2️⃣ Updating profile with username and admin role...');
        console.log('   ⚠️  This requires running SQL in Supabase Dashboard:');
        console.log('   Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/sql/new');
        console.log('');
        console.log('   Run this SQL:');
        console.log('   ```sql');
        console.log(`   UPDATE profiles`);
        console.log(`   SET username = '${USER_DATA.username}',`);
        console.log(`       role = 'admin',`);
        console.log(`       first_name = '${USER_DATA.first_name}',`);
        console.log(`       last_name = '${USER_DATA.last_name}',`);
        console.log(`       full_name = '${USER_DATA.full_name}'`);
        console.log(`   WHERE email = '${USER_DATA.email}';`);
        console.log('   ```');
        console.log('');
        console.log('   Or if profile doesn\'t exist yet, create it:');
        console.log('   ```sql');
        console.log(`   INSERT INTO profiles (id, email, username, role, first_name, last_name, full_name)`);
        console.log(`   SELECT id, email, '${USER_DATA.username}', 'admin', '${USER_DATA.first_name}', '${USER_DATA.last_name}', '${USER_DATA.full_name}'`);
        console.log(`   FROM auth.users`);
        console.log(`   WHERE email = '${USER_DATA.email}';`);
        console.log('   ```');
        
      } catch (e) {
        console.log(`   Response:`, data);
      }
    } else if (res.statusCode === 422) {
      try {
        const error = JSON.parse(data);
        if (error.message?.includes('already registered')) {
          console.log(`   ⚠️  User already exists!`);
          console.log(`   💡 You can reset password via Dashboard or update profile directly.`);
          console.log(`   Dashboard: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/auth/users`);
        } else {
          console.log(`   ❌ Error:`, error.message || JSON.stringify(error));
        }
      } catch (e) {
        console.log(`   ❌ Error response:`, data);
      }
    } else {
      console.log(`   ❌ Failed with status ${res.statusCode}`);
      console.log(`   Response:`, data);
    }
    
    console.log('\n✅ Done! Next steps:');
    console.log('   1. If user was created, run the SQL above to set username and role');
    console.log('   2. If user already exists, reset password via Dashboard if needed');
    console.log('   3. Test login at: http://localhost:3000/login');
    console.log('      Username: pmvita');
    console.log('      Password: admin123');
  });
});

signUpReq.on('error', (e) => {
  console.error(`   ❌ Request error: ${e.message}`);
});

signUpReq.write(signUpBody);
signUpReq.end();

