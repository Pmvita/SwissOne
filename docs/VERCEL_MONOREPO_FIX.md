# Vercel Monorepo Build Fix

## Problem

Vercel is trying to run `cd apps/web && npm run build` but fails because:
- `rootDirectory` in `vercel.json` is not being applied correctly
- Vercel is running from repo root instead of `apps/web`

## Solution: Set Root Directory in Vercel Dashboard

The `rootDirectory` property in `vercel.json` doesn't work reliably for monorepos. You need to set it in the Vercel Dashboard instead.

### Steps to Fix

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your **SwissOne** project

2. **Navigate to Settings**
   - Click **Settings** → **General**

3. **Set Root Directory**
   - Find **Root Directory** section
   - Click **Edit** or **Override**
   - Enter: `apps/web`
   - Click **Save**

4. **Verify Build Settings**
   - **Framework Preset**: Should be "Next.js" (auto-detected)
   - **Build Command**: Leave empty (Vercel will auto-detect `npm run build` from `apps/web/package.json`)
   - **Install Command**: Leave empty OR set to `cd ../.. && npm install --legacy-peer-deps` if needed

5. **Deploy Again**
   - The next push to GitHub should work correctly
   - Or trigger a manual deployment to test

## Alternative: Use vercel.json in apps/web

If dashboard settings don't work, you can also:

1. Move all configuration to `apps/web/vercel.json`
2. Remove `rootDirectory` from root `vercel.json`
3. Set Root Directory in dashboard to `apps/web`

## Current Configuration Files

### Root `vercel.json`
```json
{
  "installCommand": "cd ../.. && npm install --legacy-peer-deps",
  "framework": "nextjs",
  "rootDirectory": "apps/web"
}
```

### `apps/web/vercel.json`
```json
{
  "installCommand": "cd ../.. && npm install --legacy-peer-deps",
  "crons": [
    {
      "path": "/api/cron/fetch-prices",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## Why This Happens

Vercel processes configuration in this order:
1. Dashboard settings (highest priority)
2. `vercel.json` in root directory
3. `vercel.json` in rootDirectory (if set)
4. Auto-detection from package.json

For monorepos, the dashboard `rootDirectory` setting is more reliable than the `vercel.json` property.

## Testing

After setting rootDirectory in dashboard:
1. Push a commit to trigger deployment
2. Check build logs - should show:
   - Installing from monorepo root
   - Building from `apps/web` directory
   - No `cd apps/web` errors

