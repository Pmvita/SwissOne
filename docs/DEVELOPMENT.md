# Development Guide

## Prerequisites

- Node.js 18+ and npm 9+
- Expo CLI (for mobile development): `npm install -g expo-cli`
- Supabase account (sign up at https://supabase.com)
- Git

## Initial Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd SwissOne
npm install
```

### 2. Supabase Setup

1. Create a new project at https://supabase.com
2. Run the SQL schema from `docs/SUPABASE.md` in the Supabase SQL Editor
3. Get your project URL and API keys from Settings > API

### 3. Environment Variables

Each app requires its own environment variables file:

1. **Copy the template from root:**
   ```bash
   cp .env.example apps/web/.env.local
   cp .env.example apps/mobile/.env
   ```

2. **Edit the files with your Supabase credentials:**
   
   **`apps/web/.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   
   **`apps/mobile/.env`**:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions and getting your Supabase credentials.

### 4. Start Development

```bash
# Web app only
npm run dev:web

# Mobile app only
npm run dev:mobile

# Both (requires concurrently)
npm run dev:all
```

## Development Workflow

### Web Development

1. Navigate to `apps/web`
2. Run `npm run dev`
3. Open http://localhost:3000
4. Changes to shared package require restarting the dev server

### Mobile Development

1. Install Expo Go app on your device
2. Navigate to `apps/mobile`
3. Run `npm start` or `npx expo start`
4. Scan QR code with Expo Go app
5. Changes hot-reload automatically

### Shared Package Development

1. Make changes in `packages/shared/src/`
2. Changes are automatically available to web and mobile apps
3. Run `npm run type-check` from root to verify types

## Code Organization

### Web App Structure

- `app/` - Next.js App Router pages (file-based routing)
- `components/` - Reusable React components
  - `ui/` - Generic UI components
  - `banking/` - Banking-specific components
- `lib/` - Utilities and helpers
  - `supabase/` - Supabase client configuration
  - `utils/` - Utility functions
- `types/` - TypeScript types (web-specific)

### Mobile App Structure

- `app/` - Expo Router screens (file-based routing)
  - `(auth)/` - Authentication screens
  - `(tabs)/` - Tab navigation screens
- `components/` - Reusable React Native components
  - `ui/` - Generic UI components
  - `banking/` - Banking-specific components
- `lib/` - Utilities and helpers
  - `supabase/` - Supabase client configuration
  - `utils/` - Utility functions
- `types/` - TypeScript types (mobile-specific)

### Shared Package Structure

- `src/types/` - Shared TypeScript interfaces
- `src/constants/` - Shared constants
- `src/config/` - Shared configuration (theme, etc.)
- `src/utils/` - Shared utility functions

## Best Practices

1. **Use Shared Types**: Always import types from `@swissone/shared` when available
2. **Type Safety**: Use TypeScript strictly, avoid `any`
3. **Component Reuse**: Extract reusable components to shared folders
4. **Error Handling**: Always handle errors gracefully
5. **Security**: Never expose sensitive data, validate all inputs
6. **Styling**: Use Tailwind classes, maintain consistent design
7. **Testing**: Write tests for critical functionality (future enhancement)

## Scripts

### Root Level

- `npm run dev` - Start web app
- `npm run dev:web` - Start web app only
- `npm run dev:mobile` - Start mobile app only
- `npm run dev:all` - Start both apps
- `npm run build` - Build all apps
- `npm run lint` - Lint all workspaces
- `npm run type-check` - Type check all workspaces
- `npm run clean` - Remove all node_modules

### Web App

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check TypeScript

### Mobile App

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm run type-check` - Type check TypeScript

## Troubleshooting

### Supabase Connection Issues

- Verify environment variables are set correctly
- Check Supabase project is active
- Verify API keys are correct
- Check network connectivity

### Type Errors

- Run `npm run type-check` to identify issues
- Ensure shared package is built (not required for development)
- Check TypeScript versions are compatible

### Build Issues

- Run `npm run clean` and reinstall dependencies
- Check Node.js version (18+ required)
- Verify all environment variables are set

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NativeWind Documentation](https://www.nativewind.dev)

