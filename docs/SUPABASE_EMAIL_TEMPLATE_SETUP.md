# Supabase Email Template Configuration Guide

## Quick Setup for SwissOne Project

**Project ID:** `nzpnjezhwmdsvrjhyrho`  
**Dashboard:** https://supabase.com/dashboard/project/nzpnjezhwmdsvrjhyrho/auth/templates

## Email Templates to Update

### 1. Magic Link Template (MFA/Login OTP)

**Purpose:** Used for MFA email verification and email-based login OTP

**Location:** Authentication → Email Templates → Magic Link

**Template Content:**
```html
<h2>Your Verification Code</h2>
<p>Enter this 6-digit code in the app:</p>
<p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 20px 0; color: #2563eb;">
  {{ .Token }}
</p>
<p style="color: #666; font-size: 14px;">
  This code will expire in 60 seconds.
</p>
<p style="color: #999; font-size: 12px; margin-top: 20px;">
  If you didn't request this code, you can safely ignore this email.
</p>
```

**Key Points:**
- ✅ Use `{{ .Token }}` for the 6-digit numeric code
- ❌ Do NOT use `{{ .ConfirmationURL }}` (we don't use magic links)
- Used by: `/mfa` page email verification flow

### 2. Confirm Signup Template (Optional)

**Purpose:** Used for initial account signup email confirmation

**Location:** Authentication → Email Templates → Confirm signup

You can either:
- Keep magic links for signup (simpler for initial registration)
- Or use numeric codes for consistency

**Option A: Magic Link (Recommended for Signup)**
```html
<h2>Confirm Your Signup</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email Address</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p style="color: #666; font-size: 12px; word-break: break-all;">{{ .ConfirmationURL }}</p>
```

**Option B: Numeric Code (For Consistency)**
```html
<h2>Confirm Your Signup</h2>
<p>Enter this 6-digit code to confirm your email address:</p>
<p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 20px 0; color: #2563eb;">
  {{ .Token }}
</p>
<p style="color: #666; font-size: 14px;">
  This code will expire in 60 seconds.
</p>
```

## Step-by-Step Instructions

1. **Navigate to Email Templates**
   - Go to: https://supabase.com/dashboard/project/nzpnjezhwmdsvrjhyrho/auth/templates

2. **Update Magic Link Template**
   - Click on "Magic Link" template
   - Click "Edit"
   - Replace the content with the template above (using `{{ .Token }}`)
   - Remove any `{{ .ConfirmationURL }}` references
   - Click "Save"

3. **Wait for Propagation**
   - Changes can take 2-5 minutes to propagate
   - Test by requesting a new MFA code

4. **Verify**
   - Go to `/mfa` page
   - Select "Email Address"
   - Check your email - you should see a 6-digit code, NOT a link

## Testing

After updating the template:

1. **Test MFA Flow:**
   ```
   1. Login to the app
   2. You'll be redirected to /mfa
   3. Select "Email Address"
   4. Check your email
   5. You should receive a 6-digit numeric code
   6. Enter the code in the MFA form
   ```

2. **What to Look For:**
   - ✅ Email contains: Large, bold 6-digit number (e.g., `123456`)
   - ❌ Email should NOT contain: "Log In" link or `{{ .ConfirmationURL }}`

## Common Issues

**Still seeing magic links?**
- Verify you edited the "Magic Link" template (not "Confirm signup")
- Make sure you removed all `{{ .ConfirmationURL }}` references
- Wait 5 minutes and try again (Supabase caches templates)

**Template not saving?**
- Check for syntax errors in HTML
- Make sure you're using valid template variables
- Try refreshing the page and editing again

## Reference

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Template Variables Reference](https://supabase.com/docs/guides/auth/auth-email-templates#terminology)
  - `{{ .Token }}` - 6-digit numeric code
  - `{{ .ConfirmationURL }}` - Magic link URL (DO NOT USE)
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .Email }}` - User's email address

