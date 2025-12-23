# Environment Variables Setup

Each app in the monorepo requires its own environment variables file. The root `.env.example` serves as a template.

## Quick Setup

1. **Copy the example file from root:**
   ```bash
   cp .env.example .env
   ```

2. **Copy to web app and edit:**
   ```bash
   cp .env.example apps/web/.env.local
   # Then edit apps/web/.env.local with your actual values
   ```

3. **Copy to mobile app and edit:**
   ```bash
   cp .env.example apps/mobile/.env
   # Then edit apps/mobile/.env with your actual values
   ```

## Web App (`apps/web/.env.local`)

Next.js loads environment variables from `apps/web/.env.local` (highest priority).

**Required variables:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service Role Key (for server-side operations only - never expose to client!)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Note:** Next.js only exposes variables prefixed with `NEXT_PUBLIC_` to the browser.

## Mobile App (`apps/mobile/.env`)

Expo loads environment variables from `apps/mobile/.env` or from `app.json` extra field.

**Required variables:**

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** Expo only exposes variables prefixed with `EXPO_PUBLIC_` to the client code.

The mobile app is also configured to read from `app.json` extra field as a fallback. You can update `apps/mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "your_supabase_project_url",
      "supabaseAnonKey": "your_supabase_anon_key"
    }
  }
}
```

## Getting Supabase Credentials

1. Go to https://supabase.com
2. Create or select your project
3. Navigate to **Settings > API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL` (web) or `EXPO_PUBLIC_SUPABASE_URL` (mobile)
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY` (web) or `EXPO_PUBLIC_SUPABASE_ANON_KEY` (mobile)
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (web only, server-side)

## Root `.env.example` File

The root `.env.example` file contains all possible environment variables as a reference. You should:

1. Use it as a template
2. Copy it to app-specific locations (`apps/web/.env.local` and `apps/mobile/.env`)
3. Fill in your actual values
4. Never commit `.env` or `.env.local` files to version control

## Security Notes

- ✅ **Never commit `.env` files** to version control (they're in `.gitignore`)
- ✅ The `service_role` key has admin access - **never use it in client-side code**
- ✅ The `anon` key is safe for client-side use but is still restricted by RLS policies
- ✅ Use different Supabase projects for development and production
- ✅ Rotate keys immediately if they're accidentally committed

## File Structure

```
SwissOne/
├── .env.example          # Template file (safe to commit)
├── .env                  # Root example (optional, can be deleted)
├── apps/
│   ├── web/
│   │   └── .env.local    # Web app environment variables (DO NOT COMMIT)
│   └── mobile/
│       └── .env          # Mobile app environment variables (DO NOT COMMIT)
└── ...
```

