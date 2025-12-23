#!/bin/bash
# SwissOne Login Test Script
# Usage: ./scripts/test-login.sh <email> <password>

set -e

EMAIL="${1:-test@example.com}"
PASSWORD="${2:-testpassword123}"

echo "🧪 SwissOne Login Test"
echo "===================="
echo ""
echo "Testing login for: $EMAIL"
echo ""

cd "$(dirname "$0")/../apps/web"

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local not found"
  echo "Please create .env.local with your Supabase credentials"
  exit 1
fi

# Source environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Run Node.js test
node -e "
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🔐 Testing login...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: '$EMAIL',
      password: '$PASSWORD',
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      console.error('Error code:', error.status);
      process.exit(1);
    }

    if (data.user) {
      console.log('✅ Login successful!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Email confirmed:', !!data.user.email_confirmed_at);
      console.log('Session exists:', !!data.session);
      
      if (data.session) {
        console.log('Session expires:', new Date(data.session.expires_at * 1000).toISOString());
      }
      
      // Test session retrieval
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Session verification:', sessionData.session ? '✅ Valid' : '❌ Invalid');
      
      process.exit(0);
    }
    
    console.error('❌ No user data returned');
    process.exit(1);
  } catch (err) {
    console.error('❌ Exception:', err.message);
    process.exit(1);
  }
}

testLogin();
"

