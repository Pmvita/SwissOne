# Email OTP Setup Instructions

## Problem

By default, Supabase sends **magic links** (clickable URLs) instead of **numeric codes** when using email OTP authentication.

## Solution: Update Email Template

To send numeric 6-digit codes instead of magic links, you need to update the email template in your Supabase dashboard.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project (SwissOne)

2. **Open Email Templates**
   - Go to **Authentication** → **Email Templates**
   - Or navigate directly: `https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/auth/templates`

3. **Edit the "Magic Link" Template**
   - Find the **"Magic Link"** template
   - Click **Edit**

4. **Replace the Template Content**

   **Current (Magic Link):**
   ```html
   <h2>Magic Link</h2>
   <p>Follow this link to login:</p>
   <p><a href="{{ .ConfirmationURL }}">Log In</a></p>
   ```

   **New (Numeric Code):**
   ```html
   <h2>One time login code</h2>
   <p>Please enter this code: <strong>{{ .Token }}</strong></p>
   <p>This code will expire in 60 seconds.</p>
   ```

5. **Save the Template**
   - Click **Save** or **Update**

### Alternative: Custom Template with Both Options

You can also create a template that shows both the code and a link:

```html
<h2>Your Verification Code</h2>
<p>Enter this code in the app: <strong style="font-size: 24px; letter-spacing: 4px;">{{ .Token }}</strong></p>
<p>Or click this link: <a href="{{ .ConfirmationURL }}">Verify Email</a></p>
<p>This code expires in 60 seconds.</p>
```

## Verification

After updating the template:
1. Try signing up again
2. Check your email - you should receive a 6-digit numeric code instead of a magic link
3. Enter the code in the verification form

## Notes

- The `{{ .Token }}` variable contains the 6-digit numeric code
- The code is valid for 60 seconds by default (configurable in Auth settings)
- Magic links and OTP codes use the same underlying mechanism - only the email template differs
- The verification code flow in the app will work the same way regardless

## Troubleshooting

**Still receiving magic links?**
- Make sure you saved the template
- Clear your browser cache
- Wait a few minutes for changes to propagate
- Check that you're editing the correct template (Magic Link, not Signup or other templates)

**Code not working?**
- Codes expire after 60 seconds - request a new one if expired
- Make sure you're entering the exact 6-digit code
- Check for typos in the code

