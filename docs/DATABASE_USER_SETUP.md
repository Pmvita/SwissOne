# Database User Setup Guide

This guide explains how to set up your dev user account in the database with the correct credentials.

## Important Notes

⚠️ **Password Storage**: Passwords are **NOT** stored in the `profiles` table. They are managed by Supabase Auth in the `auth.users` table and are hashed using bcrypt. You cannot set passwords via SQL - you must use the Supabase Dashboard or Auth API.

## Setting Up Dev User Credentials

### Step 1: Run Migrations

Run the migrations in order to set up the schema and update your user:

1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `001_update_profiles_table.sql` - Adds username, first_name, last_name, phone fields
   - `002_add_username_lookup_function.sql` - Adds username lookup function
   - `003_add_role_to_profiles.sql` - Adds role column and sets your user to admin with username 'pmvita'

### Step 2: Set Password via Supabase Dashboard

Since passwords are managed by Supabase Auth, you need to set it via the dashboard:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find the user with email `petermvita@hotmail.com`
3. Click the **"..."** menu → **"Reset password"**
4. Enter the new password: `admin123`
5. Click **"Reset password"**

**Alternative: Send Password Reset Email**
- Click **"..."** → **"Send password reset email"**
- Check your email and follow the reset link
- Set password to `admin123`

### Step 3: Verify Database Records

Run this SQL to verify your user is set up correctly:

```sql
-- Check profile record
SELECT 
  email, 
  username, 
  role, 
  first_name, 
  last_name, 
  phone,
  created_at
FROM profiles
WHERE email = 'petermvita@hotmail.com';

-- Expected result:
-- email: petermvita@hotmail.com
-- username: pmvita
-- role: admin
```

### Step 4: Verify Auth User

Check that the auth user exists:

```sql
-- Check auth user (requires service role key or admin access)
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'petermvita@hotmail.com';
```

## Quick Setup SQL

If you want to manually update the username and role (password must be set via Dashboard):

```sql
-- Update dev user profile
UPDATE profiles
SET 
  username = 'pmvita',
  role = 'admin'
WHERE email = 'petermvita@hotmail.com';

-- Verify
SELECT email, username, role FROM profiles WHERE email = 'petermvita@hotmail.com';
```

## Troubleshooting

### Username not updating
- Check if RLS policies allow updates (they should for your own profile)
- If using service role, RLS is bypassed
- Verify the email matches exactly: `petermvita@hotmail.com`

### Password not working
- Passwords are case-sensitive
- Make sure you set it via Supabase Dashboard, not SQL
- Try resetting the password again via Dashboard
- Check that email is confirmed (`email_confirmed_at` is not null)

### Role not showing as admin
- Run migration `003_add_role_to_profiles.sql`
- Verify with: `SELECT role FROM profiles WHERE email = 'petermvita@hotmail.com';`
- If still 'user', manually update: `UPDATE profiles SET role = 'admin' WHERE email = 'petermvita@hotmail.com';`

## Complete Credentials Summary

After setup, your credentials should be:

- **Email:** `petermvita@hotmail.com`
- **Username:** `pmvita` (in `profiles` table)
- **Password:** `admin123` (in `auth.users` table, hashed)
- **Role:** `admin` (in `profiles` table)

## Security Reminder

- ✅ Passwords are hashed and cannot be retrieved
- ✅ Only set passwords via Supabase Dashboard or Auth API
- ✅ Never store plain text passwords in the database
- ✅ The `profiles` table does NOT contain passwords

## Related Documentation

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Initial database schema setup
- [SUPABASE.md](./SUPABASE.md) - Complete Supabase documentation
- [Credentials.md](./Credentials.md) - Test user credentials (⚠️ Not in version control)

