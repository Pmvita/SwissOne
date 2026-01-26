# 🔧 Fix Admin Login Issues

## Issues Identified

1. **Supabase Connection Error**: The app is trying to connect to the old paused project (`nzpnjezhwmdsvrjhyrho`) instead of the new one (`amjjhdsbvpnjdgdlvoka`)
2. **Admin User Not Working**: The admin user may not exist in the new Supabase project

## ✅ Fix Applied

- ✅ Cleared Next.js cache (`.next` directory removed)
- ⚠️ **Important**: After clearing cache, you MUST restart the dev server completely (stop and start fresh)

## 🚀 Next Steps

### Step 1: Restart Dev Server (CRITICAL)

**IMPORTANT**: After clearing the `.next` cache, you MUST do a complete restart:

1. **Stop the dev server completely** (Ctrl+C in the terminal)
2. **Wait a few seconds** for the process to fully terminate
3. **Restart fresh**:

```bash
cd "/Users/petermvita/Desktop/Coding Projects/SwissOne"
npm run dev:web
```

**Why?** Next.js needs to rebuild manifest files (`app-paths-manifest.json`, `routes-manifest.json`) that were deleted. If you don't fully restart, you'll get 500 errors.

This will pick up the correct environment variables from `.env.local` and rebuild all necessary files.

### Step 2: Verify/Create Admin User

The admin user needs to exist in the **new** Supabase project (`amjjhdsbvpnjdgdlvoka`).

#### Option A: Check if User Exists (Recommended First)

1. Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/auth/users
2. Look for user with email: `petermvita@hotmail.com`
3. If it exists, verify:
   - Email is confirmed (green checkmark)
   - Password can be reset if needed

#### Option B: Create User via Dashboard

1. Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/auth/users
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email:** `petermvita@hotmail.com`
   - **Password:** `admin123`
   - ✅ Check **"Auto Confirm User"**
4. Click **"Create User"**

#### Option C: Update Profile (After User Exists)

Run this SQL in the Supabase SQL Editor:
https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/sql/new

```sql
-- Update profile with username and admin role
UPDATE profiles
SET 
  username = 'pmvita',
  role = 'admin',
  first_name = 'Peter',
  last_name = 'Mvita',
  full_name = 'Peter Mvita'
WHERE email = 'petermvita@hotmail.com';

-- Verify the update
SELECT email, username, role, first_name, last_name 
FROM profiles 
WHERE email = 'petermvita@hotmail.com';
```

### Step 3: Verify Database Function

Make sure the `get_user_credentials_by_username` function exists. Run this in SQL Editor:

```sql
-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_credentials_by_username';

-- If it doesn't exist, create it (from migration 002)
CREATE OR REPLACE FUNCTION public.get_user_credentials_by_username(username_lookup TEXT)
RETURNS TABLE (
  email TEXT,
  phone TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.email,
    p.phone
  FROM profiles p
  WHERE p.username = username_lookup
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_credentials_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_credentials_by_username(TEXT) TO authenticated;
```

### Step 4: Test Login

1. Make sure dev server is running: `npm run dev:web`
2. Go to: http://localhost:3000/login
3. Enter:
   - **Username:** `pmvita`
   - **Password:** `admin123`
4. Should redirect to `/dashboard` ✅

## 🔍 Troubleshooting

### Still Getting Connection Error?

1. **Verify environment variables are loaded:**
   ```bash
   cd apps/web
   cat .env.local
   ```
   Should show: `NEXT_PUBLIC_SUPABASE_URL=https://amjjhdsbvpnjdgdlvoka.supabase.co`

2. **Clear browser cache** or use incognito mode

3. **Check browser console** for any remaining errors

### Login Returns 401?

1. **Verify user exists in auth.users:**
   ```sql
   SELECT id, email, email_confirmed_at 
   FROM auth.users 
   WHERE email = 'petermvita@hotmail.com';
   ```

2. **Verify profile exists with username:**
   ```sql
   SELECT email, username, role 
   FROM profiles 
   WHERE email = 'petermvita@hotmail.com';
   ```

3. **Try resetting password via Dashboard:**
   - Go to Auth → Users → Find user → "..." → "Reset password"
   - Set to: `admin123`

### Function Not Found Error?

Run the migration SQL from `docs/migrations/002_add_username_lookup_function.sql`

## 📋 Summary

**Correct Supabase Project:** `amjjhdsbvpnjdgdlvoka`  
**Admin Credentials:**
- Username: `pmvita`
- Email: `petermvita@hotmail.com`
- Password: `admin123`
- Role: `admin`

**After fixing, restart dev server and test login!**

