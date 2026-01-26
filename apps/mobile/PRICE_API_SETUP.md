# Price API Setup Guide

## Quick Setup

To enable real-time price fetching on the mobile app, you need to:

### 1. Configure API URL

Edit `apps/mobile/.env` and set:

```env
# For physical devices (use your computer's local IP)
EXPO_PUBLIC_API_URL=http://192.168.2.50:3000

# For iOS Simulator/Android Emulator
# EXPO_PUBLIC_API_URL=http://localhost:3000

# For production (deployed app)
# EXPO_PUBLIC_API_URL=https://your-app.vercel.app
```

**Find your local IP:**
- Mac/Linux: `ifconfig | grep "inet "` or `ipconfig getifaddr en0`
- Windows: `ipconfig` (look for IPv4 Address)

### 2. Start Web App (Required)

The web app must be running for the price API to work:

```bash
# From root directory
npm run dev:web

# Or from apps/web
cd apps/web
npm run dev
```

The web app will be accessible at:
- `http://localhost:3000` (local)
- `http://YOUR_IP:3000` (network - for mobile devices)

### 3. Restart Mobile App

After updating `.env`, restart Expo to pick up new environment variables:

```bash
# Stop current Expo process (Ctrl+C)
# Then restart
npm run dev:mobile
```

### 4. Verify Connection

1. Open the mobile app
2. Navigate to Portfolio screen
3. Check console logs - you should see:
   - `[PriceService] Using API URL: http://192.168.2.50:3000`
   - `[PriceService] Fetching prices from: ...`

If you see errors:
- **"Network request failed"**: Web app isn't running or not accessible
- **"API URL not configured"**: Environment variable not loaded (restart Expo)
- **"Not authenticated"**: User not logged in

## Troubleshooting

### Web App Not Accessible

1. **Check web app is running:**
   ```bash
   # Should show: "Ready on http://0.0.0.0:3000"
   npm run dev:web
   ```

2. **Test from mobile browser:**
   - Open `http://YOUR_IP:3000` on your phone
   - If it loads, the API should work

3. **Check firewall:**
   - Make sure port 3000 isn't blocked
   - macOS: System Settings > Firewall
   - Windows: Windows Defender Firewall

### Environment Variable Not Loading

1. **Verify `.env` file location:**
   - Must be in `apps/mobile/.env`
   - Variable must start with `EXPO_PUBLIC_`

2. **Clear Expo cache:**
   ```bash
   cd apps/mobile
   npx expo start --clear
   ```

3. **Check variable is set:**
   - Add temporary `console.log(process.env.EXPO_PUBLIC_API_URL)` in code
   - Should show your URL

### API Errors

- **429 (Rate Limit)**: Too many requests - wait a minute
- **401 (Unauthorized)**: User not logged in
- **500 (Server Error)**: Check web app logs

## Production Setup

For production, set:

```env
EXPO_PUBLIC_API_URL=https://your-deployed-app.vercel.app
```

Make sure your deployed web app has the `/api/prices` route working.
