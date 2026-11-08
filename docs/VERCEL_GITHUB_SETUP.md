# Vercel GitHub Integration Setup Guide

## Issue: GitHub Pushes Not Triggering Vercel Deployments

If pushing to GitHub doesn't automatically trigger Vercel deployments, follow these steps:

## Step 1: Verify GitHub Integration in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **SwissOne** project
3. Go to **Settings** → **Git**
4. Verify that:
   - **Git Repository** is connected to `Pmvita/SwissOne`
   - **Production Branch** is set to `main` (or your default branch)
   - **Deploy Hooks** are enabled

## Step 2: Check GitHub App Installation

1. Go to your GitHub repository: `https://github.com/Pmvita/SwissOne`
2. Click on **Settings** → **Integrations** → **Installed GitHub Apps**
3. Verify that **Vercel** is installed
4. If not installed:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Settings** → **Git**
   - Click **Connect Git Repository**
   - Select **GitHub**
   - Authorize Vercel to access your repositories
   - Select `Pmvita/SwissOne`

## Step 3: Verify Project Configuration

### Root Directory Setting

The `vercel.json` file should have `rootDirectory: "apps/web"` set. This is already configured.

### Build Commands

The current configuration:
- **Install Command**: `cd ../.. && npm install --legacy-peer-deps`
  - This installs dependencies from the monorepo root
- **Build Command**: `npm run build`
  - This runs from `apps/web` directory (after rootDirectory is applied)

## Step 4: Check Branch Protection Rules

1. Go to GitHub repository → **Settings** → **Branches**
2. Check if `main` branch has protection rules that might block deployments
3. Ensure Vercel has permission to push/merge if required

## Step 5: Verify Webhook Configuration

1. Go to GitHub repository → **Settings** → **Webhooks**
2. Look for a webhook from `vercel.com`
3. Verify it's active and receiving events
4. Check recent deliveries to see if push events are being received

## Step 6: Manual Deployment Test

If automatic deployments still don't work:

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click **Create Deployment**
3. Select branch `main` and deploy manually
4. This will help identify if the issue is with Git integration or build configuration

## Step 7: Check Vercel Project Settings

1. Go to Vercel Dashboard → Your Project → **Settings** → **General**
2. Verify:
   - **Root Directory**: Should be `apps/web` (or set in vercel.json)
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (or leave empty to use vercel.json)
   - **Install Command**: `cd ../.. && npm install --legacy-peer-deps` (or leave empty to use vercel.json)
   - **Output Directory**: `.next` (default for Next.js)

## Step 8: Reconnect GitHub Integration (If Needed)

If the integration is broken:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Git**
2. Click **Disconnect** (if connected)
3. Click **Connect Git Repository**
4. Select **GitHub** → **Pmvita/SwissOne**
5. Confirm the connection

## Step 9: Verify Environment Variables

Ensure all required environment variables are set in Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (if needed)
   - `NODE_ENV=production`

## Step 10: Check Deployment Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Check the latest deployment
3. Look for any errors in the build logs
4. The build should show:
   - Cloning repository
   - Installing dependencies
   - Building Next.js app
   - Deploying

## Common Issues and Solutions

### Issue: "No deployments triggered"
- **Solution**: Reconnect GitHub integration in Vercel dashboard

### Issue: "Build fails with workspace errors"
- **Solution**: Ensure `installCommand` runs from monorepo root (`cd ../.. && npm install`)

### Issue: "Webhook not receiving events"
- **Solution**: Reinstall Vercel GitHub App or check repository permissions

### Issue: "Wrong branch deployed"
- **Solution**: Check Production Branch setting in Vercel → Settings → Git

## Current Configuration

Your `vercel.json` is configured as:

```json
{
  "installCommand": "cd ../.. && npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "rootDirectory": "apps/web"
}
```

This configuration:
- Sets `apps/web` as the root directory
- Installs dependencies from the monorepo root (two directories up)
- Builds the Next.js app from `apps/web`

## Testing the Fix

After making changes:

1. Commit and push to GitHub:
   ```bash
   git add vercel.json
   git commit -m "fix: update Vercel configuration for monorepo"
   git push origin main
   ```

2. Check Vercel Dashboard → Deployments
3. A new deployment should automatically start within seconds
4. Monitor the build logs for any errors

## Additional Resources

- [Vercel Git Integration Docs](https://vercel.com/docs/git)
- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [Vercel GitHub App](https://github.com/apps/vercel)

