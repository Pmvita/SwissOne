# Cron Jobs Configuration

## Price Fetching Cron Job

The price fetching cron job is configured to run daily to update market prices for all holdings.

### Current Configuration

**File**: `apps/web/vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-prices",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Schedule**: Daily at 9:00 AM UTC (`0 9 * * *`)

### Vercel Plan Limitations

**Hobby Plan** (Current):
- ✅ Allows daily cron jobs
- ❌ Does NOT allow minute/hourly schedules
- ❌ Maximum 1 cron job per day

**Pro Plan**:
- ✅ Allows minute/hourly schedules
- ✅ Multiple cron jobs
- ✅ More flexible scheduling

### Alternatives for More Frequent Updates

If you need more frequent price updates than once per day, consider these alternatives:

#### Option 1: Upgrade to Vercel Pro Plan
- Allows cron schedules like `*/5 * * * *` (every 5 minutes)
- Cost: ~$20/month per user
- Best for: Production applications needing real-time data

#### Option 2: External Cron Service
Use services like:
- **cron-job.org** (Free tier available)
- **EasyCron** (Free tier: 1 job, 1 execution/day)
- **GitHub Actions** (Free for public repos, 2000 minutes/month for private)

Example GitHub Actions workflow:
```yaml
name: Fetch Prices
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Manual trigger
jobs:
  fetch-prices:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Price Fetch
        run: |
          curl -X GET "https://your-app.vercel.app/api/cron/fetch-prices" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### Option 3: Supabase Edge Functions + pg_cron
Use Supabase's built-in cron functionality:
- Set up pg_cron extension in Supabase
- Create a function that calls your API endpoint
- Schedule it via SQL

#### Option 4: Manual Triggering
For development/testing:
```bash
curl -X GET "https://your-app.vercel.app/api/cron/fetch-prices" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Testing the Cron Job

1. **Manual Test**:
   ```bash
   curl -X GET "http://localhost:3000/api/cron/fetch-prices" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

2. **Check Logs**:
   - Vercel Dashboard → Your Project → Deployments → Functions → View Logs
   - Look for `[Price Fetching Cron]` log entries

3. **Verify Prices Updated**:
   - Check `market_prices` table in Supabase
   - Verify `last_price_update` timestamp in `holdings` table

### Environment Variables

Required environment variable:
- `CRON_SECRET`: Secret token for authenticating cron requests (optional but recommended)

### Troubleshooting

**Issue**: Cron job not running
- Check Vercel Dashboard → Settings → Cron Jobs
- Verify the schedule is valid
- Check deployment logs for errors

**Issue**: "Hobby plan limitation" error
- Change schedule to daily format: `0 9 * * *`
- Or upgrade to Pro plan

**Issue**: Prices not updating
- Check API endpoint logs
- Verify `CRON_SECRET` is set correctly
- Check price fetching service logs

### Recommended Schedule for Banking App

For a banking application, consider:
- **Daily**: Minimum for production (current setup)
- **Hourly**: Good balance for most use cases (requires Pro plan)
- **Every 5-15 minutes**: For real-time trading applications (requires Pro plan or external service)

Current setup (daily at 9 AM UTC) is suitable for:
- Portfolio tracking
- Daily performance reporting
- End-of-day valuations

Not suitable for:
- Real-time trading
- Intraday position monitoring
- High-frequency updates

