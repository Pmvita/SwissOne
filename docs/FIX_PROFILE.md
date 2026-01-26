# Fix Missing User Profile

Your user exists in `auth.users` but doesn't have a corresponding record in the `profiles` table. This should have been created automatically by a database trigger, but it seems like it wasn't.

## Quick Fix: Run This SQL

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Create your profile if it doesn't exist
INSERT INTO profiles (id, email, username, role, first_name, last_name, full_name, base_currency)
VALUES (
  'b55ef620-c283-48f1-9127-90be294d160e', -- Your user ID (from auth.users)
  'petermvita@hotmail.com',
  'pmvita',
  'admin',
  'Peter',
  'Mvita',
  'Peter Mvita',
  'USD'
)
ON CONFLICT (id) DO UPDATE
SET 
  username = EXCLUDED.username,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  full_name = EXCLUDED.full_name;
```

## Why This Happened

The database trigger `handle_new_user()` should automatically create profiles when users sign up, but:
- Your user might have been created before the trigger was set up
- Or the trigger failed silently
- Or the user was created through a different method (API, admin, etc.)

## After Running This

Once your profile exists:
1. The dashboard will work properly
2. You can use the seed script to populate your financial data (accounts, portfolios, holdings)
3. The seed script is **ONLY** for financial data, not for creating your profile

