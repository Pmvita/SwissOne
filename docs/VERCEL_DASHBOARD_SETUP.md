# Vercel Dashboard Configuration - REQUIRED FIX

## ⚠️ CRITICAL: Root Directory Must Be Set in Dashboard

The build is failing because `rootDirectory` must be set in the **Vercel Dashboard**, not just in `vercel.json`.

## Step-by-Step Fix

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your **SwissOne** project

### 2. Navigate to Project Settings
- Click on your project
- Go to **Settings** tab
- Click **General** in the left sidebar

### 3. Set Root Directory (CRITICAL)
- Scroll down to **Root Directory** section
- Click **Edit** or the **Override** toggle
- Enter: `apps/web`
- Click **Save**

### 4. Verify Build Settings
- **Framework Preset**: Should show "Next.js" (auto-detected)
- **Build Command**: Should be empty OR `npm run build` (Vercel will auto-detect from `apps/web/package.json`)
- **Output Directory**: Should be empty (default `.next` for Next.js)
- **Install Command**: Can be empty OR `cd ../.. && npm install --legacy-peer-deps`

### 5. Clear Build Command Override (If Present)
If you see a build command like `cd apps/web && npm run build`:
- Clear it or set to just `npm run build`
- When rootDirectory is set, you're already in `apps/web`, so no `cd` is needed

### 6. Save and Redeploy
- Click **Save** on all changes
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment, or
- Push a new commit to trigger automatic deployment

## Why This Is Required

Vercel processes configuration in this priority order:
1. **Dashboard Settings** (highest priority) ← Set rootDirectory here
2. `vercel.json` in root directory
3. `vercel.json` in rootDirectory (if set in dashboard)
4. Auto-detection from package.json

The `rootDirectory` property in `vercel.json` **does not work reliably** for monorepos. It must be set in the dashboard.

## Expected Behavior After Fix

Once rootDirectory is set in dashboard:

1. **Install Phase**:
   - Vercel changes to `apps/web` directory
   - Runs `cd ../.. && npm install --legacy-peer-deps` (from `apps/web/vercel.json`)
   - Installs dependencies from monorepo root

2. **Build Phase**:
   - Vercel is already in `apps/web` directory
   - Runs `npm run build` (from `apps/web/package.json`)
   - Builds Next.js application

3. **Deploy Phase**:
   - Vercel deploys the `.next` output directory
   - Application goes live

## Current Configuration Files

### Root `vercel.json`
```json
{
  "installCommand": "cd ../.. && npm install --legacy-peer-deps"
}
```

### `apps/web/vercel.json`
```json
{
  "installCommand": "cd ../.. && npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "crons": [
    {
      "path": "/api/cron/fetch-prices",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## Troubleshooting

### If build still fails after setting rootDirectory:

1. **Check Build Logs**:
   - Look for the actual command being run
   - Should show: `npm run build` (not `cd apps/web && npm run build`)

2. **Verify Root Directory Setting**:
   - Go back to Settings → General
   - Confirm Root Directory shows: `apps/web`
   - If it shows empty or different value, update it

3. **Clear Build Command Override**:
   - In Settings → General
   - Find "Build Command"
   - Clear it or set to: `npm run build`
   - Save

4. **Manual Deployment Test**:
   - Go to Deployments tab
   - Click "Create Deployment"
   - Select branch: `main`
   - This will test the configuration

## Quick Checklist

- [ ] Root Directory set to `apps/web` in dashboard
- [ ] Build Command is empty or `npm run build` (no `cd apps/web`)
- [ ] Install Command is empty or `cd ../.. && npm install --legacy-peer-deps`
- [ ] Framework Preset is "Next.js"
- [ ] Saved all settings
- [ ] Triggered new deployment

Once these are set, your builds should succeed! 🚀

