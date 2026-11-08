# SwissOne Project TODO

This document tracks planned features and improvements for the SwissOne application.

## 🔐 Authentication & Security

### Multi-Factor Authentication (MFA)
**Status:** Removed from current implementation, planned for future release

**Description:**
Implement multi-factor authentication to enhance security for user accounts. Users should be able to verify their identity using:
- SMS/Phone verification
- Email verification
- Optional: TOTP authenticator apps

**Previous Implementation:**
- MFA page was previously implemented at `/mfa`
- Included phone and email verification methods
- Had development bypass route for testing
- Code has been removed from login flow but can be referenced for future implementation

**Requirements:**
- [ ] Design MFA flow and user experience
- [ ] Implement phone/SMS verification via Supabase Auth
- [ ] Implement email OTP verification
- [ ] Add rate limiting for verification code requests
- [ ] Create MFA setup page for first-time configuration
- [ ] Add MFA settings page for managing verification methods
- [ ] Implement backup codes for account recovery
- [ ] Add security logging for MFA events
- [ ] Update login flow to require MFA after password authentication
- [ ] Add "Remember this device" option to reduce MFA prompts

**Related Files:**
- `apps/web/app/mfa.archived/page.tsx` (archived, can be used as reference)
- `apps/web/app/api/auth/dev-bypass.archived/route.ts` (archived, development only)

**Notes:**
- MFA was temporarily removed to simplify the authentication flow
- All MFA routing has been disabled in middleware
- Login now redirects directly to dashboard after successful authentication

---

## 📝 Additional TODOs

_Add more planned features and improvements here as needed._

