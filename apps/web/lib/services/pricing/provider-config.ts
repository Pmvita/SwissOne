// apps/web/lib/services/pricing/provider-config.ts
// Centralized provider configuration - swap providers by changing priority

export interface ProviderConfigItem {
  name: string;
  priority: number; // Lower number = higher priority
  enabled: boolean;
  requiresApiKey: boolean;
  supportsRealtime: boolean;
  supportsHistorical: boolean;
}

export const PROVIDER_CONFIG: {
  providers: ProviderConfigItem[];
} = {
  providers: [
    {
      name: 'yahoo_finance',
      priority: 1, // Highest priority (no API key needed)
      enabled: true,
      requiresApiKey: false,
      supportsRealtime: true,
      supportsHistorical: true,
    },
    {
      name: 'alpha_vantage',
      priority: 2,
      enabled: true,
      requiresApiKey: true,
      supportsRealtime: false, // Free tier is delayed
      supportsHistorical: true,
    },
    {
      name: 'iex_cloud',
      priority: 3,
      enabled: true,
      requiresApiKey: true,
      supportsRealtime: true,
      supportsHistorical: true,
    },
    {
      name: 'finnhub',
      priority: 4,
      enabled: true,
      requiresApiKey: true,
      supportsRealtime: true,
      supportsHistorical: true,
    },
  ],
};

/**
 * Get enabled providers sorted by priority
 */
export function getEnabledProviders(): ProviderConfigItem[] {
  return PROVIDER_CONFIG.providers
    .filter((p) => p.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get provider config by name
 */
export function getProviderConfig(name: string): ProviderConfigItem | undefined {
  return PROVIDER_CONFIG.providers.find((p) => p.name === name);
}

