# SwissOne Project TODO

This document tracks planned features and improvements for the SwissOne application.

## 🔐 Authentication & Security

### Multi-Factor Authentication (MFA)
**Status:** Implemented and gated — present in code; controlled by `MFA_ENABLED`

**What ships today:**
- After password login, authenticated users are routed to `/mfa` when MFA is on
- Middleware enforces the MFA gate before protected pages (`apps/web/middleware.ts`)
- Set `MFA_ENABLED=false` to skip the gate (useful for local demos / portfolio walkthroughs)
- MFA page lives at `apps/web/app/mfa/page.tsx`; login flow clears prior MFA completion so the gate runs each session

**Still open / polish:**
- [ ] Harden production OTP paths (phone/SMS + email) end-to-end against a live Supabase Auth project
- [ ] Rate limiting for verification code requests
- [ ] Backup codes for account recovery
- [ ] "Remember this device" to reduce MFA prompts
- [ ] Security logging for MFA events

**Related files:**
- `apps/web/app/mfa/page.tsx`
- `apps/web/middleware.ts`
- `apps/web/app/api/auth/login/route.ts`

**Notes:**
- README documents the gate: MFA on by default; `MFA_ENABLED=false` disables it
- Setup APIs under `/api/setup/*` only run when `NODE_ENV=development`

---

## 📊 Dashboard charts

### Portfolio performance chart
**Status:** Illustrative UI — not a live market time series

The dashboard "Portfolio Performance (illustrative)" line chart scales synthetic month points from the current total portfolio value for visual storytelling. It is **not** historical valuation from a market data feed. Prefer `/api/portfolio/valuation` when real snapshot history is available.

**Related file:** `apps/web/app/dashboard/portfolio-overview.tsx`

---

## 📝 Additional TODOs

_Add more planned features and improvements here as needed._
