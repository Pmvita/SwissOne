# Database Setup Checklist

## Current Issues

The database schema is **NOT** properly scaffolded for the current authentication flow. The following are missing:

### Missing Fields in `profiles` Table

The current schema only has:
- `id`
- `email`
- `full_name`
- `created_at`
- `updated_at`

But the code is trying to write:
- ❌ `username` (required for login)
- ❌ `first_name` (required for signup)
- ❌ `last_name` (required for signup)
- ❌ `phone` (required for signup and MFA)

### Missing RLS Policy

The current schema only has:
- ✅ SELECT policy (users can read their own profile)
- ✅ UPDATE policy (users can update their own profile)
- ❌ **INSERT policy is missing** (users cannot create their profile during signup)

### Missing Indexes

- ❌ No index on `username` (login queries will be slow)
- ✅ Index on `email` (should exist but verify)

## Solution

### Step 1: Run the Migration

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open and run the migration file: `docs/migrations/001_update_profiles_table.sql`

This migration will:
- ✅ Add `username`, `first_name`, `last_name`, and `phone` columns
- ✅ Create index on `username` for fast login lookups
- ✅ Add INSERT policy so users can create profiles during signup
- ✅ Add automatic profile creation trigger (backup)

### Step 2: Verify the Schema

After running the migration, verify the `profiles` table has these columns:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

You should see:
- `id` (uuid)
- `email` (text)
- `username` (text) ← NEW
- `first_name` (text) ← NEW
- `last_name` (text) ← NEW
- `phone` (text) ← NEW
- `full_name` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Step 3: Verify RLS Policies

Check that all three policies exist:

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

You should see:
- ✅ "Users can read own profile" (SELECT)
- ✅ "Users can insert own profile" (INSERT) ← NEW
- ✅ "Users can update own profile" (UPDATE)

### Step 4: Test the Flow

1. **Signup Flow:**
   - Fill out signup form (first name, last name, email, username, phone)
   - Submit and verify code
   - Check that profile is created with all fields

2. **Login Flow:**
   - Enter username and password
   - Should redirect to MFA
   - Complete MFA verification
   - Should redirect to dashboard

## What Each Field Is Used For

- **username**: Used for login (lookup user by username to get email)
- **first_name**: Collected during signup, stored in profile
- **last_name**: Collected during signup, stored in profile
- **phone**: Collected during signup, used for MFA verification
- **email**: Used for authentication and MFA verification
- **full_name**: Computed from first_name + last_name, stored for convenience

## Troubleshooting

### Error: "column does not exist"
- Run the migration file to add missing columns

### Error: "new row violates row-level security policy"
- The INSERT policy is missing - run the migration

### Error: "duplicate key value violates unique constraint"
- Username or email already exists - this is expected validation

### Login fails with "Profile lookup error"
- Username doesn't exist in profiles table
- Make sure signup completed successfully
- Check that username index exists for performance

## Next Steps

After setting up the database schema, you may want to:
- Set up a dev user account (see [DATABASE_USER_SETUP.md](./DATABASE_USER_SETUP.md))
- Configure email templates (see [SUPABASE_EMAIL_TEMPLATE_SETUP.md](./SUPABASE_EMAIL_TEMPLATE_SETUP.md))
- Review full database documentation (see [SUPABASE.md](./SUPABASE.md))

