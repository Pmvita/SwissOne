# Email OTP Setup Instructions

## Problem

By default, Supabase sends **magic links** (clickable URLs) instead of **numeric codes** when using email OTP authentication for MFA and login flows.

**Important:** We use **numeric 6-digit codes**, NOT magic links, for email verification in our application.

## Solution: Update Email Templates

To send numeric 6-digit codes instead of magic links, you need to update the email templates in your Supabase dashboard.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project (SwissOne)
   - Project ID: `nzpnjezhwmdsvrjhyrho`

2. **Open Email Templates**
   - Go to **Authentication** → **Email Templates**
   - Or navigate directly: `https://supabase.com/dashboard/project/nzpnjezhwmdsvrjhyrho/auth/templates`

3. **Edit the "Magic Link" Template (for MFA/Login)**
   - Find the **"Magic Link"** template
   - Click **Edit**
   - **This template is used for:**
     - MFA email verification (`/mfa` page)
     - Email-based login OTP requests

4. **Replace the Template Content**

   **❌ Current (Magic Link - DO NOT USE):**
   ```html
   <h2>Magic Link</h2>
   <p>Follow this link to login:</p>
   <p><a href="{{ .ConfirmationURL }}">Log In</a></p>
   <p>You're receiving this email because you signed up for an application powered by Supabase ⚡️</p>
   ```

   **✅ New (Numeric Code - USE THIS):**
   ```html
   <h2>Your Verification Code</h2>
   <p>Enter this 6-digit code in the app:</p>
   <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 20px 0;">
     {{ .Token }}
   </p>
   <p style="color: #666; font-size: 14px;">
     This code will expire in 60 seconds.
   </p>
   <p style="color: #999; font-size: 12px; margin-top: 20px;">
     If you didn't request this code, you can safely ignore this email.
   </p>
   ```

5. **Save the Template**
   - Click **Save** or **Update**
   - Wait a few minutes for changes to propagate

### ⚠️ Important: Do NOT Use Magic Links

**Do NOT include `{{ .ConfirmationURL }}` in the template** - we only use numeric codes.

The template should ONLY contain `{{ .Token }}` which displays the 6-digit numeric code.

### Other Email Templates

**Confirm Signup Template:**
- This template is used for initial account signup confirmation
- You can keep using magic links (`{{ .ConfirmationURL }}`) for signup if preferred
- Or update it to use numeric codes if you want consistency

## Verification

After updating the "Magic Link" template:
1. Go to the MFA page (`/mfa`) after logging in
2. Select "Email Address" as your verification method
3. Check your email - you should receive a 6-digit numeric code (NOT a magic link)
4. Enter the code in the verification form on the MFA page

## Notes

- The `{{ .Token }}` variable contains the 6-digit numeric code
- The code is valid for 60 seconds by default (configurable in Auth settings)
- **DO NOT include `{{ .ConfirmationURL }}`** - we only use numeric codes
- The MFA page (`/mfa`) expects users to enter the numeric code manually
- The verification flow uses `supabase.auth.verifyOtp()` with the token/code

## Troubleshooting

**Still receiving magic links?**
- Make sure you saved the "Magic Link" template (not "Confirm signup")
- Verify you removed `{{ .ConfirmationURL }}` from the template
- Verify you're using `{{ .Token }}` for the numeric code
- Clear your browser cache
- Wait a few minutes for changes to propagate (Supabase cache can take 2-5 minutes)
- Check that you're editing the correct template: **"Magic Link"** (used for MFA/login)

**Code not working?**
- Codes expire after 60 seconds - request a new one if expired
- Make sure you're entering the exact 6-digit code
- Check for typos in the code
- Verify the code format matches what's shown in the email

**Template not updating?**
- Make sure you clicked "Save" after editing
- Check the template preview in Supabase dashboard
- Try requesting a new code after waiting 5 minutes

