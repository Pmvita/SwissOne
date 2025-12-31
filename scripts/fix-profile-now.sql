-- FIX PROFILE - Copy and paste this entire block into Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/sql/new

-- Step 1: Create/update profile with username and admin role
-- Using the user ID we found: b55ef620-c283-48f1-9127-90be294d160e
INSERT INTO profiles (id, email, username, role, first_name, last_name, full_name)
VALUES (
  'b55ef620-c283-48f1-9127-90be294d160e',
  'petermvita@hotmail.com',
  'pmvita',
  'admin',
  'Peter',
  'Mvita',
  'Peter Mvita'
)
ON CONFLICT (id) 
DO UPDATE SET
  username = 'pmvita',
  role = 'admin',
  first_name = 'Peter',
  last_name = 'Mvita',
  full_name = 'Peter Mvita',
  updated_at = NOW();

-- Step 2: Verify it worked
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

