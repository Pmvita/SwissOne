# New Supabase Project Setup Complete ✅

## New Project Information

**Project ID:** `amjjhdsbvpnjdgdlvoka`  
**Project Name:** `SwissOne-Fresh`  
**Region:** `us-east-1`  
**Status:** ACTIVE_HEALTHY

## New Credentials

### Project URL
```
https://amjjhdsbvpnjdgdlvoka.supabase.co
```

### API Keys

**Anon Key (Legacy):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw
```

**Publishable Key (Modern):**
```
sb_publishable_xIDqXeyfbX9kT6PsMAI3rA_SEwIJCfC
```

**Service Role Key:**
⚠️ Get this from Supabase Dashboard → Settings → API → service_role key (Reveal)

---

## ✅ Database Schema Applied

All tables, policies, indexes, functions, and triggers have been created:
- ✅ `profiles` table with RLS policies
- ✅ `accounts` table with RLS policies  
- ✅ `transactions` table with RLS policies
- ✅ `portfolios` table with RLS policies
- ✅ `holdings` table with RLS policies
- ✅ `get_user_credentials_by_username()` function
- ✅ All triggers and functions

---

## Next Steps

### 1. Update Environment Variables

**Update `apps/web/.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://amjjhdsbvpnjdgdlvoka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw
SUPABASE_SERVICE_ROLE_KEY=<get_from_dashboard>
```

**Update `apps/mobile/.env`:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://amjjhdsbvpnjdgdlvoka.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw
```

### 2. Create Dev User

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter:
   - **Email:** `petermvita@hotmail.com`
   - **Password:** `admin123`
   - **Auto Confirm User:** ✅ (checked)
5. Click **Create User**

**Option B: Via Signup Page**
1. Go to http://localhost:3000/signup
2. Create account with:
   - Email: `petermvita@hotmail.com`
   - Username: `pmvita`
   - Password: `admin123`

### 3. Update User Profile to Admin

After creating the user, run this SQL in Supabase SQL Editor:

```sql
UPDATE profiles
SET username = 'pmvita', role = 'admin'
WHERE email = 'petermvita@hotmail.com';
```

### 4. Delete Old Project (Optional)

The old project (`nzpnjezhwmdsvrjhyrho`) has been paused. You can:
- **Delete it permanently:** Go to Dashboard → Settings → Danger Zone → Delete Project
- **Keep it paused:** Leave it paused if you want to keep it for reference

### 5. Restart Development Server

```bash
# Stop current server (Ctrl+C)
cd apps/web
rm -rf .next
npm run dev
```

### 6. Test Login

1. Go to http://localhost:3000/login
2. Login with:
   - **Username:** `pmvita`
   - **Password:** `admin123`
3. Should redirect to `/dashboard` ✅

---

## Summary

✅ **New Supabase project created:** `amjjhdsbvpnjdgdlvoka`  
✅ **Database schema applied** (all tables, policies, functions)  
⏳ **Environment variables need updating** (see above)  
⏳ **Dev user needs creating** (see above)  
⏳ **Old project paused** (can be deleted manually)

---

## Troubleshooting

If login still doesn't work after setup:
1. Verify environment variables are updated correctly
2. Verify dev user was created and profile updated
3. Clear browser cookies for localhost:3000
4. Check browser console for errors
5. Check terminal/server logs

