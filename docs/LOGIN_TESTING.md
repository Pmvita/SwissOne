# Login Testing Guide

## Quick Test Steps

### 1. Test Login via Browser Console

Open your browser console (F12) on the login page and run:

```javascript
// Import Supabase (if not already available)
const { createClient } = window.supabase || {};

// Or use the existing client from the page
// The login page already has createClient available

// Test login directly
async function testLoginDirect(email, password) {
  const supabase = createClient(
    'https://nzpnjezhwmdsvrjhyrho.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cG5qZXpod21kc3Zyamh5cmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NDQzMjIsImV4cCI6MjA4MjAyMDMyMn0.q0WRjoJ0ikMat74Pg9UVgvF46tPX8Z0qrMez_rV9BIE'
  );
  
  console.log('Testing login for:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('❌ Login failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
  
  if (data.user) {
    console.log('✅ Login successful!');
    console.log('User:', data.user.email);
    console.log('Session:', !!data.session);
    
    // Check session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Session verified:', !!sessionData.session);
    
    return true;
  }
  
  return false;
}

// Run test
testLoginDirect('petermvita@hotmail.com', 'YOUR_PASSWORD_HERE');
```

### 2. Check Current Session

```javascript
const supabase = createClient(
  'https://nzpnjezhwmdsvrjhyrho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cG5qZXpod21kc3Zyamh5cmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NDQzMjIsImV4cCI6MjA4MjAyMDMyMn0.q0WRjoJ0ikMat74Pg9UVgvF46tPX8Z0qrMez_rV9BIE'
);

supabase.auth.getSession().then(({ data, error }) => {
  console.log('Current session:', data.session);
  console.log('User:', data.session?.user?.email);
  console.log('Error:', error);
});
```

### 3. Test via Command Line

```bash
cd apps/web
./scripts/test-login.sh petermvita@hotmail.com YOUR_PASSWORD
```

## Common Issues

### Issue: "Invalid login credentials"
- **Check**: Email and password are correct
- **Solution**: Reset password via Supabase Dashboard if needed

### Issue: "Email not confirmed"
- **Status**: Your email IS confirmed (checked via database)
- **Solution**: The code now allows unconfirmed emails for testing

### Issue: "Session not established"
- **Check**: Browser cookies are enabled
- **Check**: CORS settings in Supabase
- **Check**: Environment variables are correct

### Issue: Login succeeds but redirect fails
- **Check**: Middleware is not blocking the redirect
- **Check**: Dashboard page is accessible

## Your Account Status

✅ **User exists**: `petermvita@hotmail.com`  
✅ **Email confirmed**: Yes (2025-12-23 01:45:53)  
✅ **Profile exists**: Yes  

## Next Steps

1. Try logging in with your actual password
2. Check browser console for detailed error messages
3. If login fails, the console will show the exact error
4. Share the error message for further debugging

