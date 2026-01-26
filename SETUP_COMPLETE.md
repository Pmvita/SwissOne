# ✅ SwissOne Project Recreation - Setup Complete!

## ✅ What's Been Done

1. **✅ New Supabase Project Created**
   - Project ID: `amjjhdsbvpnjdgdlvoka`
   - Project URL: `https://amjjhdsbvpnjdgdlvoka.supabase.co`
   - Database schema fully applied (all tables, policies, functions)

2. **✅ Old Project Paused**
   - Old project ID: `nzpnjezhwmdsvrjhyrho` (paused, can be deleted manually)

3. **✅ Setup Script Created**
   - Location: `scripts/setup-new-project.js`
   - This script will create env files and dev user

---

## 🚀 Final Steps (Run These Commands)

### Step 1: Run Setup Script

```bash
cd "/Users/petermvita/Desktop/Coding Projects/SwissOne"
node scripts/setup-new-project.js
```

This will:
- Create `.env.local` files with new credentials
- Create the dev user (`petermvita@hotmail.com` / `admin123`)
- Update profile with username `pmvita` and `admin` role

### Step 2: If Script Fails - Manual User Creation

**Option A: Via Supabase Dashboard** (Recommended)
1. Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter:
   - Email: `petermvita@hotmail.com`
   - Password: `admin123`
   - Auto Confirm User: ✅ (checked)
5. Click **Create User**
6. Then run this SQL in SQL Editor:
   ```sql
   UPDATE profiles
   SET username = 'pmvita', role = 'admin', first_name = 'Peter', last_name = 'Mvita', full_name = 'Peter Mvita'
   WHERE email = 'petermvita@hotmail.com';
   ```

**Option B: Via Signup Page**
1. Start dev server: `cd apps/web && npm run dev`
2. Go to http://localhost:3000/signup
3. Create account with:
   - Email: `petermvita@hotmail.com`
   - Username: `pmvita`
   - Password: `admin123`
4. Then run the SQL above to set role to admin

### Step 3: Update Environment Variables (If Script Didn't Create Them)

**Create `apps/web/.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://amjjhdsbvpnjdgdlvoka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw
SUPABASE_SERVICE_ROLE_KEY=<get_from_dashboard>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Create `apps/mobile/.env`:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://amjjhdsbvpnjdgdlvoka.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw
```

### Step 4: Get Service Role Key (Optional - for Admin Operations)

1. Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/settings/api
2. Find **service_role** key under "Project API keys"
3. Click "Reveal" to see it
4. Add it to `apps/web/.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

### Step 5: Restart Dev Server

```bash
cd apps/web
rm -rf .next  # Clear Next.js cache
npm run dev
```

### Step 6: Test Login

1. Go to http://localhost:3000/login
2. Login with:
   - **Username:** `pmvita`
   - **Password:** `admin123`
3. Should redirect to `/dashboard` ✅

---

## 📋 Summary

- ✅ New Supabase project: `amjjhdsbvpnjdgdlvoka`
- ✅ Database schema applied
- ✅ Environment variables template ready
- ⏳ Dev user needs creation (run script or manual)
- ⏳ Old project paused (delete manually if desired)

---

## 🎯 Quick Test

Once everything is set up, test the login:

```bash
# Start server
cd apps/web && npm run dev

# In browser: http://localhost:3000/login
# Username: pmvita
# Password: admin123
```

---

## 📚 Documentation

- Full setup guide: `docs/NEW_PROJECT_SETUP.md`
- Backup info: `docs/BACKUP_FOR_RECREATION.md`
- Setup script: `scripts/setup-new-project.js`

