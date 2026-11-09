# SwissOne

Full-stack Swiss private banking application built with Next.js, React Native/Expo, and Supabase.

**Live:** [https://swissone.vercel.app](https://swissone.vercel.app)

MFA: after password login users are routed to `/mfa`. Set `MFA_ENABLED=false` to skip the gate. Setup APIs under `/api/setup/*` only run when `NODE_ENV=development`.

Dashboard note: the "Portfolio Performance (illustrative)" chart is a synthetic trend scaled from current holdings for UI demo — not live market history.

## Design system (web)

Alpine private-banking visual language for `apps/web` — Cormorant Garamond for brand/display (Morgen Capital–inspired pairing) with Source Sans 3 for UI. Palette deliberately avoids Morgen Capital secondary purple (`#9696e9`) and generic AI looks (Inter, purple gradients, cream+terracotta, card soup).

| Token | Hex | Role |
|-------|-----|------|
| `--glacier` | `#E8EEF2` | Mist / cool wash |
| `--snow` | `#F7FAFC` | Surfaces |
| `--ink` | `#0B1220` | Primary text / chrome |
| `--slate` | `#3A4658` | Secondary text |
| `--alpine` | `#9B1B2E` | Swiss red accent / CTAs |
| `--brass` | `#A67C52` | Warm metal accent |
| `--line` | `#C5CED6` | Borders / rules |

Landing hero is brand-first and full-bleed (mist + mountain silhouette), one headline, one supporting sentence, and a CTA group — no floating badges or hero cards. Motion is limited to intentional hero fade, CTA slide, and section reveals via Framer Motion.

## Project Structure

```
SwissOne/
├── apps/
│   ├── web/           # Next.js 15+ web application
│   └── mobile/        # React Native Expo mobile app
├── packages/
│   └── shared/        # Shared code between web and mobile
└── docs/              # Project documentation
```

## Technology Stack

- **Web**: Next.js 15+, React 19, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo SDK, Expo Router, NativeWind, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Monorepo**: npm workspaces
- **Styling**: Tailwind CSS (Web) + NativeWind (Mobile)

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Expo CLI (for mobile development)
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SwissOne
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy template to web app
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your Supabase credentials

# Copy template to mobile app
cp .env.example apps/mobile/.env
# Edit apps/mobile/.env with your Supabase credentials
```

See [Environment Setup](./docs/ENV_SETUP.md) for detailed instructions.

4. Start development:
```bash
# Web app only
npm run dev:web

# Mobile app only
npm run dev:mobile

# Both apps (requires concurrently)
npm run dev:all
```

## Development

- `npm run dev` - Start web app in development mode
- `npm run dev:web` - Start web app only
- `npm run dev:mobile` - Start mobile app only
- `npm run build` - Build all apps
- `npm run lint` - Lint all workspaces
- `npm run type-check` - Type check all workspaces

## Documentation

See the [docs/](./docs/) directory for detailed documentation:
- [Quick Start Guide](./docs/QUICK_START.md) - Get started quickly
- [Environment Setup](./docs/ENV_SETUP.md) - Environment variables configuration
- [Architecture](./docs/ARCHITECTURE.md) - System architecture overview
- [Development Guide](./docs/DEVELOPMENT.md) - Development workflow and best practices
- [Supabase Setup](./docs/SUPABASE.md) - Database schema and setup
- [Database Setup](./docs/DATABASE_SETUP.md) - Database migration and setup checklist
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deployment instructions
- [Animations Guide](./docs/ANIMATIONS.md) - Custom animated components
- [Cron Jobs](./docs/CRON_JOBS.md) - Scheduled tasks and background jobs
- [Wealth Allocation Model](./docs/WEALTH_ALLOCATION_MODEL.md) - Wealth allocation system documentation

## License

MIT

