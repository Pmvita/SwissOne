# Quick Start Guide

Get SwissOne up and running in minutes.

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Expo Go app on your phone (for mobile testing)
- Supabase account

## Setup Steps

### 1. Install Dependencies

```bash
cd SwissOne
npm install
```

### 2. Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Wait for the project to be ready
3. Go to Settings > API and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

### 3. Configure Environment Variables

1. **Copy the example file from root:**
   ```bash
   cp .env.example .env
   ```

2. **Set up Web App environment variables:**
   ```bash
   cp .env.example apps/web/.env.local
   ```
   
   Then edit `apps/web/.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Set up Mobile App environment variables:**
   ```bash
   cp .env.example apps/mobile/.env
   ```
   
   Then edit `apps/mobile/.env` and fill in your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

**Note:** See [ENV_SETUP.md](../ENV_SETUP.md) for detailed instructions and security notes.

### 4. Set Up Database

1. Go to Supabase SQL Editor
2. Copy and run all SQL from `docs/SUPABASE.md`
3. This creates the necessary tables and security policies

### 5. Start Development

#### Web App

```bash
npm run dev:web
# Open http://localhost:3000
```

#### Mobile App

```bash
npm run dev:mobile
# Scan QR code with Expo Go app
```

## Next Steps

1. Create a test account via the signup page
2. Explore the dashboard
3. Check out the documentation:
   - [Architecture](./ARCHITECTURE.md)
   - [Development Guide](./DEVELOPMENT.md)
   - [Deployment Guide](./DEPLOYMENT.md)
   - [Supabase Setup](./SUPABASE.md)

## Common Issues

**"Supabase not configured" error**
- Check environment variables are set correctly
- Restart the development server after setting env vars

**Type errors**
- Run `npm run type-check` to see specific errors
- Ensure all dependencies are installed

**Mobile app won't connect**
- Check EXPO_PUBLIC_ environment variables are set
- Restart Expo dev server

## Need Help?

- Check the [Development Guide](./DEVELOPMENT.md) for detailed setup
- Review [Supabase Setup](./SUPABASE.md) for database configuration
- See [Architecture](./ARCHITECTURE.md) for system overview

