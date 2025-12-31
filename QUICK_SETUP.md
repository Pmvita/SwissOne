# 🚀 Quick Setup - Run This Now!

## One Command Setup

```bash
cd "/Users/petermvita/Desktop/Coding Projects/SwissOne" && npm install && node scripts/setup-new-project.js
```

---

## Or Manual Steps:

### 1. Create Environment Files

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

### 2. Create Dev User (Choose One Method)

**Method A: Via Dashboard** (Easiest)
1. Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/auth/users
2. Click "Add User" → "Create new user"
3. Email: `petermvita@hotmail.com`, Password: `admin123`
4. Check "Auto Confirm User"
5. Click "Create User"
6. Run this SQL:
   ```sql
   UPDATE profiles SET username = 'pmvita', role = 'admin', first_name = 'Peter', last_name = 'Mvita', full_name = 'Peter Mvita' WHERE email = 'petermvita@hotmail.com';
   ```

**Method B: Via App Signup**
1. `cd apps/web && npm run dev`
2. Go to http://localhost:3000/signup
3. Sign up with email `petermvita@hotmail.com`, username `pmvita`, password `admin123`
4. Then run the SQL above

### 3. Test Login

```bash
cd apps/web
npm run dev
# Visit http://localhost:3000/login
# Username: pmvita
# Password: admin123
```

---

## ✅ What's Already Done

- ✅ New Supabase project created (`amjjhdsbvpnjdgdlvoka`)
- ✅ Database schema applied (all tables, policies, functions)
- ✅ Old project paused
- ✅ Setup scripts created

## ⏳ What You Need To Do

1. Create `.env.local` files (copy commands above)
2. Create dev user (choose method above)
3. Test login

---

**New Project:** `amjjhdsbvpnjdgdlvoka`  
**Dev User:** `pmvita` / `admin123`  
**Login URL:** http://localhost:3000/login

