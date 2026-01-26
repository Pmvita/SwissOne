# ✅ User Creation - Ready to Execute

I've created multiple ways for you to create the dev user. Choose the easiest method:

## 🎯 Method 1: Open HTML File (Easiest - No Terminal Needed!)

1. **Open this file in your browser:**
   ```
   /Users/petermvita/Desktop/Coding Projects/SwissOne/scripts/create-user.html
   ```
   
   Just double-click the file or right-click → "Open With" → Browser

2. **Click the "Create User" button**

3. **Done!** ✅

---

## 🎯 Method 2: Use the API Route (If Server is Running)

1. **Start dev server:**
   ```bash
   cd apps/web
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:3000/api/setup/create-user
   ```
   
   Or use curl:
   ```bash
   curl -X POST http://localhost:3000/api/setup/create-user
   ```

---

## 🎯 Method 3: Run Node Script

```bash
cd "/Users/petermvita/Desktop/Coding Projects/SwissOne"
node scripts/create-user-standalone.js
```

---

## 🎯 Method 4: Run Python Script

```bash
cd "/Users/petermvita/Desktop/Coding Projects/SwissOne"
python3 scripts/create_user.py
```

---

## 🎯 Method 5: Use Bash Script

```bash
cd "/Users/petermvita/Desktop/Coding Projects/SwissOne"
chmod +x scripts/run-me-to-create-user.sh
./scripts/run-me-to-create-user.sh
```

---

## 🎯 Method 6: Manual via Dashboard

1. Go to: https://supabase.com/dashboard/project/amjjhdsbvpnjdgdlvoka/auth/users
2. Click "Add user" → "Create new user"
3. Email: `petermvita@hotmail.com`
4. Password: `admin123`
5. Check "Auto Confirm User"
6. Click "Create User"
7. Run this SQL:
   ```sql
   UPDATE profiles
   SET username = 'pmvita', 
       role = 'admin',
       first_name = 'Peter',
       last_name = 'Mvita',
       full_name = 'Peter Mvita'
   WHERE email = 'petermvita@hotmail.com';
   ```

---

## ✅ After User is Created

The user will have:
- **Email:** `petermvita@hotmail.com`
- **Username:** `pmvita`
- **Password:** `admin123`
- **Role:** `admin`

Then test login at: http://localhost:3000/login

---

## 📝 Recommended: Method 1 (HTML File)

Just open `scripts/create-user.html` in your browser and click the button! 🚀

