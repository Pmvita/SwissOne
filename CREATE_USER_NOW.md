# Create User - Run This Now

## Quick Command (Copy and paste into terminal):

```bash
cd "/Users/petermvita/Desktop/Coding Projects/SwissOne" && node scripts/create-user-standalone.js
```

If that doesn't work, use this one-liner:

```bash
node -e "
const https=require('https');
const url='https://amjjhdsbvpnjdgdlvoka.supabase.co';
const key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtampoZHNidnBuamRnZGx2b2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjMwMTEsImV4cCI6MjA4MjY5OTAxMX0.KOvBHQ7VLVnxC_1oz9_UVP3bM5fkOUpFKQa_Cn1x7Xw';
const email='petermvita@hotmail.com';
const pass='admin123';
const req=https.request(url+'/auth/v1/signup',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'}},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>console.log('Response:',r.statusCode,d))});
req.write(JSON.stringify({email,password:pass,data:{username:'pmvita'}}));
req.end();
"
```

## After User is Created, Run This SQL:

Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/editor

Run:
```sql
UPDATE profiles
SET username = 'pmvita', 
    role = 'admin',
    first_name = 'Peter',
    last_name = 'Mvita',
    full_name = 'Peter Mvita'
WHERE email = 'petermvita@hotmail.com';
```

## Or Use the Browser Method:

1. Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/auth/users
2. Click "Add user"
3. Enter email: `petermvita@hotmail.com`
4. Enter password: `admin123`
5. Check "Auto Confirm User"
6. Click "Create User"
7. Then run the SQL above

