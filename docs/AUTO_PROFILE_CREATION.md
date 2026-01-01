# Auto Profile Creation

## The Problem

When a user logs in, they should automatically have a profile record in the `profiles` table. However, if:
- The user was created before the database trigger was set up
- The trigger failed silently
- The user was created through a different method (API, admin, etc.)

Then the profile won't exist, causing 406 errors and requiring manual intervention.

## The Solution

We've implemented **automatic profile creation** in three places:

1. **Login API** (`/api/auth/login/route.ts`)
   - Automatically creates a profile if it doesn't exist when user logs in
   - Sets default role to 'admin' for first-time users

2. **Dashboard** (`/app/dashboard/page.tsx`)
   - Automatically creates a profile if it doesn't exist when user visits dashboard
   - Sets default role to 'admin' for first-time users

3. **Seed Endpoint** (`/api/setup/seed-account/route.ts`)
   - Automatically creates a profile if it doesn't exist before seeding data
   - Sets default role to 'admin' for seed operations

## Why Mvita-HQ Doesn't Have This Issue

Mvita-HQ uses **in-memory user data** (stored in `lib/data/users.ts`), not Supabase profiles. When a user logs in, the user data is already in memory - no database lookup needed.

SwissOne uses **Supabase Auth + Profiles**, which requires:
1. User exists in `auth.users` (handled by Supabase Auth)
2. Profile exists in `profiles` table (should be handled by trigger, but we auto-create as backup)

## Cache Skip Messages

The "cache skip" messages in the terminal are **harmless** - they're just Supabase telling you that responses aren't being cached (which is normal in development). You can ignore them.

