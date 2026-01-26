-- Setup Admin Profile for pmvita
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/sql/new

-- Step 1: Auto-confirm the email (if not already confirmed)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'petermvita@hotmail.com' 
  AND email_confirmed_at IS NULL;

-- Step 2: Create or update profile with username and admin role
INSERT INTO profiles (id, email, username, role, first_name, last_name, full_name)
SELECT 
  id, 
  email, 
  'pmvita', 
  'admin', 
  'Peter', 
  'Mvita', 
  'Peter Mvita'
FROM auth.users
WHERE email = 'petermvita@hotmail.com'
ON CONFLICT (id) 
DO UPDATE SET
  username = 'pmvita',
  role = 'admin',
  first_name = 'Peter',
  last_name = 'Mvita',
  full_name = 'Peter Mvita',
  updated_at = NOW();

-- Step 3: Verify the setup
SELECT 
  p.email,
  p.username,
  p.role,
  p.first_name,
  p.last_name,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'petermvita@hotmail.com';

-- Expected result:
-- email: petermvita@hotmail.com
-- username: pmvita
-- role: admin
-- first_name: Peter
-- last_name: Mvita
-- email_confirmed: true

