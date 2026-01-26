# Check Profile in Database

## Quick Check

While logged in, open your browser console and run:

```javascript
fetch('/api/debug/check-profile')
  .then(res => res.json())
  .then(data => {
    console.log('Profile Check:', data);
    if (data.profileExists) {
      console.log('✅ Profile exists:', data.profile);
    } else {
      console.log('❌ Profile does NOT exist');
      console.log('User ID:', data.userId);
      console.log('User Email:', data.userEmail);
    }
  });
```

This will show you:
- Whether your profile exists in the database
- Your user ID and email
- Any errors when querying the profile

## Why It's Trying to Create Your Profile

The code is trying to create your profile because:
1. Your user exists in `auth.users` (that's why you can log in)
2. Your profile does NOT exist in the `profiles` table (that's why it's trying to create it)

This is a **one-time operation** - once the profile is created, it won't try to create it again.

## The Real Issue

The profile creation was failing because the code was trying to insert `base_currency` into the `profiles` table, but that column doesn't exist. I've fixed this by removing `base_currency` from all profile creation code.

Now when you log in, your profile should be created successfully.

