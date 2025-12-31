#!/usr/bin/env node
/**
 * Complete setup script for new Supabase project
 * Creates env files, creates dev user, and sets up profile
 */

const fs = require('fs');
const path = require('path');

// Try to resolve @supabase/supabase-js from workspace
let createClient;
try {
  // Try from apps/web first (most likely location)
  const supabasePath = path.join(__dirname, '../apps/web/node_modules/@supabase/supabase-js');
  createClient = require(supabasePath).createClient;
} catch (e) {
  try {
    // Try from root node_modules
    createClient = require('@supabase/supabase-js').createClient;
  } catch (e2) {
    console.error('❌ Could not find @supabase/supabase-js');
    console.error('   Installing...');
    // Fallback: use fetch API directly
    createClient = null;
  }
}

// New project credentials
const PROJECT_URL = 'https://amjjhdsbvpnjdgdlvoka.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw';

// Dev user credentials
const DEV_EMAIL = 'petermvita@hotmail.com';
const DEV_USERNAME = 'pmvita';
const DEV_PASSWORD = 'admin123';

console.log('🚀 Starting SwissOne Project Setup...\n');

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
  console.log('⚠️  Could not create apps/web/.env.local (may be protected)');
  console.log('   Please create it manually with the content shown below');
}

try {
  fs.writeFileSync(mobileEnvPath, mobileEnvContent);
  console.log('✅ Created apps/mobile/.env');
} catch (error) {
  console.log('⚠️  Could not create apps/mobile/.env (may be protected)');
  console.log('   Please create it manually with the content shown below');
}

console.log('\n📋 Environment Variables:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('WEB (.env.local):');
console.log(webEnvContent);
console.log('MOBILE (.env):');
console.log(mobileEnvContent);

// Step 2: Create dev user via signup
console.log('\n👤 Step 2: Creating dev user...');

if (!createClient) {
  console.log('⚠️  @supabase/supabase-js not found, using fetch API instead...');
  // Use fetch API directly
  async function createUserViaFetch() {
    try {
      // Sign up user
      const signUpResponse = await fetch(`${PROJECT_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: DEV_EMAIL,
          password: DEV_PASSWORD,
          data: {
            username: DEV_USERNAME,
            first_name: 'Peter',
            last_name: 'Mvita',
          }
        })
      });

      const signUpData = await signUpResponse.json();

      if (signUpResponse.ok) {
        console.log('✅ User created successfully!');
        console.log(`   Email: ${DEV_EMAIL}`);
        console.log('\n🔄 Updating profile...');
        
        // Sign in to get session token
        const signInResponse = await fetch(`${PROJECT_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: DEV_EMAIL,
            password: DEV_PASSWORD,
          })
        });

        const signInData = await signInResponse.json();

        if (signInData.access_token) {
          // Update profile
          const updateResponse = await fetch(`${PROJECT_URL}/rest/v1/profiles?email=eq.${DEV_EMAIL}`, {
            method: 'PATCH',
            headers: {
              'apikey': ANON_KEY,
              'Authorization': `Bearer ${signInData.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              username: DEV_USERNAME,
              role: 'admin',
              first_name: 'Peter',
              last_name: 'Mvita',
              full_name: 'Peter Mvita'
            })
          });

          if (updateResponse.ok) {
            console.log('✅ Profile updated successfully!');
            console.log('\n✅ Setup Complete!');
            console.log('\n📋 Dev User Credentials:');
            console.log(`   Email: ${DEV_EMAIL}`);
            console.log(`   Username: ${DEV_USERNAME}`);
            console.log(`   Password: ${DEV_PASSWORD}`);
            console.log(`   Role: admin`);
            console.log('\n🎉 You can now login at http://localhost:3000/login');
            return;
          }
        }
      } else if (signUpData.message && signUpData.message.includes('already')) {
        console.log('ℹ️  User already exists');
        console.log('   Run this SQL to update profile:');
        console.log(`   UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
        return;
      } else {
        console.error('❌ Error:', signUpData.message || JSON.stringify(signUpData));
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    console.log('\n⚠️  Manual setup required:');
    console.log('1. Create user via Supabase Dashboard:');
    console.log(`   - Email: ${DEV_EMAIL}`);
    console.log(`   - Password: ${DEV_PASSWORD}`);
    console.log('2. Run this SQL:');
    console.log(`   UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
  }
  
  createUserViaFetch();
  process.exit(0);
}

const supabase = createClient(PROJECT_URL, ANON_KEY);

async function setupDevUser() {
  try {
    // Try to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      options: {
        data: {
          username: DEV_USERNAME,
          first_name: 'Peter',
          last_name: 'Mvita',
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
        console.log('ℹ️  User already exists, signing in to update profile...');
        
        // Sign in to get session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: DEV_EMAIL,
          password: DEV_PASSWORD,
        });

        if (signInError) {
          console.error('❌ Error signing in:', signInError.message);
          console.log('\n⚠️  Please create the user manually via Supabase Dashboard:');
          console.log(`   Email: ${DEV_EMAIL}`);
          console.log(`   Password: ${DEV_PASSWORD}`);
          return;
        }

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            username: DEV_USERNAME,
            role: 'admin',
            first_name: 'Peter',
            last_name: 'Mvita',
            full_name: 'Peter Mvita'
          })
          .eq('email', DEV_EMAIL);

        if (profileError) {
          console.error('❌ Error updating profile:', profileError.message);
          console.log('\n⚠️  Please update the profile manually via SQL:');
          console.log(`UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
          return;
        }

        console.log('✅ Profile updated successfully!');
        console.log(`   Username: ${DEV_USERNAME}`);
        console.log(`   Role: admin`);
      } else {
        console.error('❌ Error creating user:', signUpError.message);
        return;
      }
    } else {
      console.log('✅ User created successfully!');
      console.log(`   Email: ${DEV_EMAIL}`);
      
      // Wait a moment for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update profile with username and admin role
      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            username: DEV_USERNAME,
            role: 'admin',
            first_name: 'Peter',
            last_name: 'Mvita',
            full_name: 'Peter Mvita'
          })
          .eq('id', signUpData.user.id);

        if (profileError) {
          console.log('⚠️  Profile created but could not update automatically');
          console.log('   Run this SQL to update profile:');
          console.log(`   UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
        } else {
          console.log('✅ Profile updated with username and admin role!');
        }
      }
    }

    console.log('\n✅ Setup Complete!');
    console.log('\n📋 Dev User Credentials:');
    console.log(`   Email: ${DEV_EMAIL}`);
    console.log(`   Username: ${DEV_USERNAME}`);
    console.log(`   Password: ${DEV_PASSWORD}`);
    console.log(`   Role: admin`);
    console.log('\n🎉 You can now login at http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n⚠️  Manual setup required:');
    console.log('1. Create user via Supabase Dashboard:');
    console.log(`   - Email: ${DEV_EMAIL}`);
    console.log(`   - Password: ${DEV_PASSWORD}`);
    console.log('2. Run this SQL:');
    console.log(`   UPDATE profiles SET username = '${DEV_USERNAME}', role = 'admin' WHERE email = '${DEV_EMAIL}';`);
  }
}

setupDevUser();

