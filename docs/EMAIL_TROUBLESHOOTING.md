# Email Troubleshooting Guide

## Issue: User Not Receiving Confirmation Emails

Based on Supabase logs analysis, emails **are being sent** successfully. The issue is likely email deliverability.

### Log Evidence

The Supabase auth logs show:
- ✅ Email sent at: `2025-12-23T01:45:02Z`
- ✅ Email type: `confirmation`
- ✅ From: `noreply@mail.app.supabase.io`
- ✅ To: `petermvita@hotmail.com`
- ✅ User account created and confirmed successfully

## Common Causes & Solutions

### 1. Email in Spam/Junk Folder (Most Common)

**Solution:**
- Check the spam/junk folder in Hotmail/Outlook
- Search for emails from `noreply@mail.app.supabase.io`
- Mark as "Not Junk" if found
- Add `noreply@mail.app.supabase.io` to your safe senders list

### 2. Hotmail/Outlook Email Filtering

Hotmail/Outlook often filters emails from `@mail.app.supabase.io` because:
- It's a generic sender domain
- High volume from shared infrastructure
- Missing SPF/DKIM reputation

**Solution:** Use custom SMTP (see below)

### 3. Email Rate Limiting

Supabase has rate limits on email sending:
- Default: 30 emails per hour with built-in SMTP
- Custom SMTP: Higher limits available

### 4. Email Template Configuration

Verify the email template is configured correctly:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Check the "Confirm signup" template
3. Ensure it contains: `{{ .ConfirmationURL }}` or `{{ .Token }}`

## Recommended Solution: Custom SMTP

For production, configure custom SMTP for better deliverability:

### Option 1: SendGrid (Recommended)

1. **Create SendGrid Account**
   - Sign up at https://sendgrid.com
   - Verify your sender domain (or use single sender verification)
   - Get API key or SMTP credentials

2. **Configure in Supabase**
   - Go to: Authentication → Settings → SMTP Settings
   - Enable "Enable Custom SMTP"
   - Configure:
     ```
     Host: smtp.sendgrid.net
     Port: 587
     Username: apikey
     Password: [Your SendGrid API Key]
     Sender Email: noreply@yourdomain.com
     Sender Name: SwissOne
     ```

### Option 2: AWS SES

1. **Set up AWS SES**
   - Verify your domain in AWS SES
   - Get SMTP credentials

2. **Configure in Supabase**
   ```
   Host: email-smtp.[region].amazonaws.com
   Port: 587
   Username: [SES SMTP Username]
   Password: [SES SMTP Password]
   ```

### Option 3: Resend (Modern Alternative)

1. **Create Resend Account**
   - Sign up at https://resend.com
   - Verify your domain
   - Get API key

2. **Configure in Supabase**
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Resend API Key]
   ```

## Immediate Workaround: Resend Confirmation Email

Users can request a new confirmation email:

1. **Via Code** (if you implement it):
   ```typescript
   const { error } = await supabase.auth.resend({
     type: 'signup',
     email: 'user@example.com'
   })
   ```

2. **Via Supabase Dashboard**:
   - Go to Authentication → Users
   - Find the user
   - Click "Resend confirmation email"

## Verification Checklist

- [ ] Check spam/junk folder
- [ ] Search for emails from `noreply@mail.app.supabase.io`
- [ ] Add sender to safe senders list
- [ ] Verify email template in Supabase dashboard
- [ ] Check Supabase auth logs (already confirmed emails are being sent)
- [ ] Consider setting up custom SMTP for production
- [ ] Test with a different email provider (Gmail, etc.)

## Testing Email Delivery

1. Try signing up with a Gmail account to verify if it's Hotmail-specific
2. Check Supabase logs to confirm emails are being sent
3. Use email testing services like Mailtrap for development

## Production Best Practices

1. **Always use custom SMTP** for production
2. **Verify your sending domain** (SPF, DKIM, DMARC)
3. **Use a branded sender email** (e.g., `noreply@swissone.com`)
4. **Monitor email delivery rates** via your SMTP provider
5. **Set up email bounce handling** (Resend/AWS SES support this)

## Additional Resources

- [Supabase SMTP Configuration Guide](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)

