# ✅ Final Setup Instructions

The script had dependency issues. Here's the simplest way to complete setup:

## ✅ Already Done
- ✅ New Supabase project created: `amjjhdsbvpnjdgdlvoka`
- ✅ Database schema applied (all tables, policies, functions)

## 📝 Step 1: Create Environment Files

**Create `apps/web/.env.local`:**
```bash
cat > apps/web/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://amjjhdsbvpnjdgdlvoka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF
```

**Create `apps/mobile/.env`:**
```bash
cat > apps/mobile/.env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://amjjhdsbvpnjdgdlvoka.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw
EOF
```

## 👤 Step 2: Create Dev User

**Via Supabase Dashboard** (2 minutes):
1. Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/auth/users
2. Click **"Add User"** → **"Create new user"**
3. Enter:
   - **Email:** `petermvita@hotmail.com`
   - **Password:** `admin123`
   - ✅ Check **"Auto Confirm User"**
4. Click **"Create User"**

## 🔧 Step 3: Update Profile (Run SQL)

Go to Supabase Dashboard → SQL Editor and run:

```sql
UPDATE profiles
SET username = 'pmvita', 
    role = 'admin',
    first_name = 'Peter',
    last_name = 'Mvita',
    full_name = 'Peter Mvita'
WHERE email = 'petermvita@hotmail.com';
```

## 🚀 Step 4: Test

```bash
cd apps/web
rm -rf .next
npm run dev
```

Visit: http://localhost:3000/login
- Username: `pmvita`
- Password: `admin123`

---

**That's it!** Everything else is already done. 🎉

