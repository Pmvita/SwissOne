# Unified Real-Time Pricing System

## Overview

The SwissOne project now uses a unified real-time market data API system across both web and mobile applications, with comprehensive rate limiting and safety measures.

## Architecture

### 1. **API Endpoint: `/api/prices`**
- **Location**: `apps/web/app/api/prices/route.ts`
- **Methods**: `POST` (batch), `GET` (single symbol)
- **Rate Limiting**: 20 requests per minute per user
- **Safety Features**:
  - Request validation (symbol format, batch size limits)
  - User authentication required
  - Automatic blocking after rate limit exceeded (5 minutes)
  - Rate limit headers in responses

### 2. **Shared Rate Limiter Service**
- **Location**: `apps/web/lib/services/rate-limiter.ts`
- **Features**:
  - In-memory rate limiting (can be upgraded to Redis for production)
  - Configurable rate limits per endpoint
  - Automatic cleanup of expired entries
  - Blocking mechanism for abusive users
  - Statistics for monitoring

### 3. **Pricing Service (Backend)**
- **Location**: `apps/web/lib/services/pricing-service.ts`
- **Features**:
  - Provider abstraction (Yahoo Finance, Alpha Vantage, IEX Cloud, Finnhub)
  - Automatic failover between providers
  - Provider-level rate limiting (200ms between requests, 5 req/sec max)
  - Batch processing with chunking (10 symbols per batch)
  - 30-second cache TTL

### 4. **Mobile Price Service**
- **Location**: `apps/mobile/lib/services/price-service.ts`
- **Features**:
  - Client-side caching (30 seconds)
  - Request queue with 1-second minimum interval
  - Graceful degradation (falls back to stored prices)
  - Automatic periodic refresh (30 seconds)

### 5. **Web Price Hook**
- **Location**: `apps/web/hooks/use-realtime-prices.ts`
- **Features**:
  - React hook for fetching real-time prices
  - Automatic refresh (configurable interval, default 30 seconds)
  - Rate limit tracking
  - Error handling with graceful fallback
  - Same API as mobile for consistency

## Usage

### Mobile App

```typescript
import { priceService } from '@/lib/services/price-service';

// Fetch prices
const prices = await priceService.getPrices(['AAPL', 'MSFT'], ['equity', 'equity']);

// Access price data
const aaplPrice = prices.get('AAPL');
if (aaplPrice) {
  console.log(aaplPrice.price, aaplPrice.changePercent);
}
```

### Web App

```typescript
import { useRealtimePrices } from '@/hooks/use-realtime-prices';

function MyComponent() {
  const { prices, loading, error, refresh } = useRealtimePrices({
    symbols: ['AAPL', 'MSFT'],
    assetTypes: ['equity', 'equity'],
    refreshInterval: 30000, // 30 seconds
  });

  // Use prices
  const aaplPrice = prices.get('AAPL');
}
```

### Server-Side (API Routes)

```typescript
import { PricingService } from '@/lib/services/pricing-service';

const pricingService = new PricingService();
const prices = await pricingService.getPrices([
  { symbol: 'AAPL', assetType: 'equity' },
  { symbol: 'SPY', assetType: 'etf' },
]);
```

## Rate Limiting

### API Endpoint Limits
- **Price API**: 20 requests/minute per user
- **AUM API**: 10 requests/minute per user
- **General API**: 30 requests/minute per user

### Provider Limits
- **Yahoo Finance**: No official limit (be respectful)
- **Alpha Vantage**: 5 calls/min, 500/day (free tier)
- **IEX Cloud**: 50k messages/month (free tier)
- **Finnhub**: 60 calls/min (free tier)

### Client-Side Limits
- **Mobile**: 1 second minimum between requests (queued)
- **Web**: Automatic via hook (respects API rate limits)

## Safety Features

1. **Request Validation**
   - Symbol format validation (alphanumeric, dots, dashes, ^ for indices)
   - Batch size limits (max 50 symbols per request)
   - Asset type validation

2. **Error Handling**
   - Graceful degradation (falls back to stored prices)
   - Silent failures in production
   - Detailed logging in development

3. **Rate Limit Protection**
   - User-level rate limiting
   - Automatic blocking after exceeding limits
   - Rate limit headers in responses
   - Retry-After headers for blocked users

4. **Provider Failover**
   - Automatic failover if provider fails
   - Health checking and monitoring
   - Individual symbol fallback if batch fails

## Configuration

### Environment Variables

```env
# Optional: Provider API Keys (for enhanced rate limits)
ALPHA_VANTAGE_API_KEY=your_key_here
IEX_CLOUD_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here

# Web App URL (for mobile to call API)
NEXT_PUBLIC_APP_URL=http://localhost:3000
EXPO_PUBLIC_WEB_URL=http://localhost:3000
```

### Rate Limit Configuration

Edit `apps/web/lib/services/rate-limiter.ts`:

```typescript
export const RATE_LIMIT_CONFIGS = {
  PRICE_API: {
    maxRequests: 20,        // Adjust as needed
    windowMs: 60 * 1000,   // 1 minute window
    blockDurationMs: 5 * 60 * 1000, // 5 minute block
  },
  // ... other configs
};
```

## Monitoring

### Rate Limiter Stats

```typescript
import { rateLimiter } from '@/lib/services/rate-limiter';

const stats = rateLimiter.getStats();
console.log('Active limits:', stats.activeLimits);
console.log('Blocked users:', stats.blockedUsers);
```

### Provider Health

```typescript
import { PricingService } from '@/lib/services/pricing-service';

const pricingService = new PricingService();
const health = await pricingService.getProviderHealth();
console.log('Provider health:', health);
```

## Best Practices

1. **Always use the unified API** - Don't call providers directly
2. **Respect rate limits** - Use caching and batch requests
3. **Handle errors gracefully** - Always have fallback to stored prices
4. **Monitor usage** - Track rate limit headers and provider health
5. **Use appropriate refresh intervals** - 30 seconds is recommended for real-time data

## Migration Notes

- The system automatically falls back to stored `current_price` if real-time prices are unavailable
- Private symbols (market_symbol = 'PRIVATE') are excluded from price fetching
- The mobile portfolio screen already uses this system
- The web dashboard now uses the same system via `useRealtimePrices` hook
