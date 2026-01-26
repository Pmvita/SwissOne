# 🚀 Quick Fix for Login Issue

## ✅ What Was Done

1. ✅ Auth user created in Supabase (`petermvita@hotmail.com` / `admin123`)
2. ✅ Diagnostic script confirmed the issues

## ⚠️ What You Need To Do Now

### Step 1: Run SQL in Supabase Dashboard

1. **Go to SQL Editor:**
   https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/sql/new

2. **Copy and paste this SQL:**

```sql
-- Auto-confirm email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'petermvita@hotmail.com' 
  AND email_confirmed_at IS NULL;

-- Create/update profile with username and admin role
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

-- Verify
SELECT 
  p.email,
  p.username,
  p.role,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'petermvita@hotmail.com';
```

3. **Click "Run"** (or press Cmd/Ctrl + Enter)

4. **Verify the result** shows:
   - email: `petermvita@hotmail.com`
   - username: `pmvita`
   - role: `admin`
   - email_confirmed: `true`

### Step 2: Test Login

1. Go to: http://localhost:3000/login
2. Enter:
   - **Username:** `pmvita`
   - **Password:** `admin123`
3. Should redirect to `/dashboard` ✅

## 🔍 Alternative: If SQL Fails

If the INSERT fails, try this instead:

```sql
-- First, get the user ID
SELECT id, email FROM auth.users WHERE email = 'petermvita@hotmail.com';

-- Then use that ID (replace YOUR_USER_ID_HERE with the actual ID)
INSERT INTO profiles (id, email, username, role, first_name, last_name, full_name)
VALUES (
  'YOUR_USER_ID_HERE',
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
  full_name = 'Peter Mvita';
```

## 📋 Summary

**The Issue:** 
- Auth user was created but profile didn't have username set
- Email wasn't confirmed

**The Fix:**
- Run SQL to confirm email and create/update profile
- Profile needs `username = 'pmvita'` and `role = 'admin'`

**After SQL runs, login should work!** 🎉

