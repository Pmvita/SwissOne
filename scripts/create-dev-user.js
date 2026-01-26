/**
 * Script to create the dev user in the new Supabase project
 * Run this after updating .env.local with the new project credentials
 * 
 * Usage: node scripts/create-dev-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in apps/web/.env.local');
  process.exit(1);
}

// Create Supabase client with service role key (admin access)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDevUser() {
  try {
    console.log('🔄 Creating dev user...');
    
    const email = 'petermvita@hotmail.com';
    const password = 'admin123';
    const username = 'pmvita';

    // Create user via Auth Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username,
        first_name: 'Peter',
        last_name: 'Mvita',
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  User already exists, updating profile...');
        // Get existing user
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users.users.find(u => u.email === email);
        if (!user) {
          console.error('❌ Could not find existing user');
          process.exit(1);
        }
        authData.user = user;
      } else {
        console.error('❌ Error creating user:', authError.message);
        process.exit(1);
      }
    }

    if (!authData.user) {
      console.error('❌ Failed to create/get user');
      process.exit(1);
    }

    console.log('✅ User created:', authData.user.email);
    console.log('🔄 Updating profile with username and admin role...');

    // Update profile with username and admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: authData.user.email,
        username: username,
        first_name: 'Peter',
        last_name: 'Mvita',
        full_name: 'Peter Mvita',
        role: 'admin'
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message);
      process.exit(1);
    }

    console.log('✅ Profile updated successfully!');
    console.log('');
    console.log('📋 Dev User Credentials:');
    console.log('   Email:', email);
    console.log('   Username:', username);
    console.log('   Password:', password);
    console.log('   Role: admin');
    console.log('');
    console.log('✅ Setup complete! You can now login with username "pmvita" and password "admin123"');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

createDevUser();

