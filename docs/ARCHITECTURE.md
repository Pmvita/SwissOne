# SwissOne Architecture

## Overview

SwissOne is a full-stack Swiss private banking application built with modern web technologies, following a monorepo structure for code sharing and consistency.

## Project Structure

```
SwissOne/
├── apps/
│   ├── web/              # Next.js 15+ web application
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities, Supabase clients
│   │   └── types/        # TypeScript types (web-specific)
│   │
│   └── mobile/           # React Native Expo mobile app
│       ├── app/          # Expo Router screens
│       ├── components/   # React Native components
│       ├── lib/          # Utilities, Supabase clients
│       └── types/        # TypeScript types (mobile-specific)
│
├── packages/
│   └── shared/           # Shared code between web and mobile
│       ├── src/
│       │   ├── types/    # Shared TypeScript interfaces
│       │   ├── constants/# Shared constants
│       │   ├── config/   # Shared configuration (theme, etc.)
│       │   └── utils/    # Shared utility functions
│
├── docs/                 # Project documentation
└── .cursor/rules/        # Cursor IDE rules
```

## Technology Stack

### Web Application

- **Framework**: Next.js 15+ (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)

### Mobile Application

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: EAS Build (Expo Application Services)

### Backend & Infrastructure

- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for future file uploads)
- **Real-time**: Supabase Realtime (for future live updates)

### Development Tools

- **Monorepo**: npm workspaces
- **Package Manager**: npm
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Formatting**: Prettier (recommended)

## Architecture Patterns

### Monorepo Structure

The project uses npm workspaces to manage multiple packages:

- Shared code lives in `packages/shared`
- Web app in `apps/web`
- Mobile app in `apps/mobile`
- Root `package.json` manages workspace dependencies

### Code Sharing

Shared code between web and mobile:

- **Types**: TypeScript interfaces for banking entities (Account, Transaction, Portfolio, etc.)
- **Constants**: API endpoints, currency codes, account types
- **Utilities**: Currency formatting, date formatting
- **Configuration**: Theme colors, design tokens

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Supabase returns session with JWT token
3. Session stored in:
   - Web: HTTP-only cookies (via Supabase SSR)
   - Mobile: SecureStore (encrypted local storage)
4. Middleware/guards check authentication on protected routes
5. API requests include session token for authorization

### Data Flow

```
User Action → Component → Supabase Client → Supabase API → PostgreSQL
                ↓
            Shared Types ← Shared Utils ← Response
```

### Security Model

- **Row Level Security (RLS)**: All database tables have RLS policies ensuring users can only access their own data
- **Authentication**: Supabase Auth handles user authentication securely
- **Authorization**: RLS policies enforce data access rules at the database level
- **Middleware**: Route protection at application level for better UX

## Key Design Decisions

1. **Supabase for Backend**: Chosen for rapid development, built-in auth, real-time capabilities, and PostgreSQL database.

2. **Monorepo**: Enables code sharing between web and mobile, ensuring consistency and reducing duplication.

3. **TypeScript**: Strict type safety across the entire codebase, including shared types.

4. **Tailwind CSS**: Utility-first CSS for rapid UI development with consistent design system.

5. **App Router (Next.js)**: Modern React Server Components for better performance and SEO.

6. **Expo Router**: File-based routing for mobile app, similar to Next.js for consistency.

## Future Enhancements

- Real-time transaction updates via Supabase Realtime
- Advanced portfolio analytics
- Multi-currency support
- Biometric authentication
- Push notifications
- Document storage and management
- Compliance features (KYC/AML)

