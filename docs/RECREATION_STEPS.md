# Step-by-Step Recreation Guide

Follow these steps to completely recreate the SwissOne project.

## Step 1: Backup Complete ✅

All important information has been saved to `BACKUP_FOR_RECREATION.md`.

## Step 2: Delete Supabase Project

1. Go to https://supabase.com/dashboard
2. Select your project: `nzpnjezhwmdsvrjhyrho` (or whatever it's named)
3. Go to **Settings** → **General**
4. Scroll down to **Danger Zone**
5. Click **Delete Project**
6. Type the project name to confirm
7. Click **Delete Project**

## Step 3: Create New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Fill in:
   - **Name:** `SwissOne` (or any name)
   - **Database Password:** (generate a strong password and save it)
   - **Region:** Choose the same region as before (or closest)
4. Click **Create new project**
5. Wait for project to be ready (~2 minutes)

## Step 4: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

## Step 5: Run Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Open `docs/BACKUP_FOR_RECREATION.md`
4. Copy the entire SQL schema from the "Complete Database Schema" section
5. Paste into SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify success message

## Step 6: Create Dev User

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - **Email:** `petermvita@hotmail.com`
   - **Password:** `admin123`
   - **Auto Confirm User:** ✅ (checked)
4. Click **Create User**

## Step 7: Update User Profile

1. Go to **SQL Editor**
2. Run:
   ```sql
   UPDATE profiles
   SET username = 'pmvita', role = 'admin'
   WHERE email = 'petermvita@hotmail.com';
   ```

## Step 8: Update Environment Variables

1. Open `apps/web/.env.local`
2. Update with new Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_new_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
   ```

3. Open `apps/mobile/.env`
4. Update:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_new_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   ```

## Step 9: Restart Development Server

1. Stop the current dev server (Ctrl+C)
2. Clear Next.js cache:
   ```bash
   rm -rf apps/web/.next
   ```
3. Restart:
   ```bash
   cd apps/web
   npm run dev
   ```

## Step 10: Test Login

1. Go to http://localhost:3000/login
2. Login with:
   - **Username:** `pmvita`
   - **Password:** `admin123`
3. Should redirect to `/dashboard`

---

## If Issues Persist

If login still doesn't work after recreation:

1. Check browser console for errors
2. Check terminal/server logs
3. Verify cookies are being set (Browser DevTools → Application → Cookies)
4. Verify middleware is recognizing the session

The new project should work because:
- ✅ Fresh database with correct schema
- ✅ Fresh auth system
- ✅ No corrupted cookies or sessions
- ✅ Clean slate for Supabase client

