# Deployment Guide

## Web Application (Next.js)

### Vercel Deployment (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. **Important Configuration:**
   
   **Option A: Root Directory in Vercel Dashboard (Recommended for Monorepos)**
   - Go to **Project Settings → General**
   - **Root Directory**: Set to `apps/web`
   - Framework Preset: Next.js (auto-detected)
   - Remove or simplify `vercel.json` (Vercel will detect Next.js automatically)
   
   **Option B: Root Directory Empty (Current Setup)**
   - Go to **Project Settings → General**
   - **Root Directory**: Leave **EMPTY** (use root directory `.`)
   - Framework Preset: Next.js (auto-detected via vercel.json)
   - **Note**: The root `vercel.json` uses `npm run build --workspace=@swissone/web` in the buildCommand. This uses npm's workspace resolution by package name, which works reliably after `npm install` has set up the workspace structure.
4. Configure environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, for server-side operations)
5. Deploy

**Note:** The `vercel.json` file in the root and `apps/web/vercel.json` are configured for the monorepo structure.

Vercel will automatically:
- Detect Next.js framework
- Build and deploy
- Set up SSL/HTTPS
- Configure CDN

### Manual Build

```bash
cd apps/web
npm run build
npm start
```

## Mobile Application (Expo)

### EAS Build (Expo Application Services)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure project:
```bash
cd apps/mobile
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios
```

5. Build for Android:
```bash
eas build --platform android
```

6. Build for both:
```bash
eas build --platform all
```

### Environment Variables

Set environment variables in `eas.json` or via EAS Secrets:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value your_url
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your_key
```

### App Store Submission

1. Build production version
2. Submit via EAS Submit:
```bash
eas submit --platform ios
eas submit --platform android
```

Or upload manually to App Store Connect / Google Play Console.

## Database Setup

1. Ensure all schema migrations are applied in Supabase
2. Set up database backups (automated in Supabase)
3. Configure connection pooling if needed
4. Set up monitoring and alerts

## Environment Configuration

### Production Environment Variables

**Web (Vercel)**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`

**Mobile (EAS)**:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Security Checklist

- [ ] All sensitive keys stored in environment variables
- [ ] HTTPS enforced
- [ ] RLS policies enabled on all tables
- [ ] API keys restricted to necessary origins
- [ ] Service role key never exposed to client
- [ ] Database backups configured
- [ ] Monitoring and alerts set up

## Post-Deployment

1. Test authentication flows
2. Verify database connections
3. Check error logging
4. Monitor performance metrics
5. Set up analytics (optional)
6. Configure domain (if using custom domain)

## Continuous Deployment

### GitHub Actions (Example)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: apps/web
```

