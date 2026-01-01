# Quick Fix: Create Your Profile

Your profile is missing. Run this to create it:

## Option 1: Use the Fix-Profile API (Easiest)

From your browser console while logged in:

```javascript
fetch('/api/setup/fix-profile', { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    console.log('Profile Fixed:', data);
    if (data.success) {
      alert('Profile created! Now you can seed your account data.');
      window.location.reload();
    }
  });
```

## Option 2: Run SQL Directly

Go to Supabase Dashboard → SQL Editor:

```sql
INSERT INTO profiles (id, email, username, role, first_name, last_name, full_name, base_currency)
VALUES (
  'b55ef620-c283-48f1-9127-90be294d160e',
  'petermvita@hotmail.com',
  'pmvita',
  'admin',
  'Peter',
  'Mvita',
  'Peter Mvita',
  'USD'
)
ON CONFLICT (id) DO UPDATE
SET username = EXCLUDED.username, role = EXCLUDED.role;
```

## After Your Profile Exists

Once your profile is created:
- ✅ Dashboard will work properly
- ✅ You can run the seed script to populate financial data (optional)

