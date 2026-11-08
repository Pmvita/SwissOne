import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { createClient } from "@/lib/supabase/client";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/lib/utils/format";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { priceService } from "@/lib/services/price-service";

interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  currency: string;
  asset_type?: string;
  market_symbol?: string;
  portfolios?: {
    id: string;
    name: string;
  };
  // Real-time price data
  realtimePrice?: number;
  realtimeChangePercent?: number;
  realtimeChangeAmount?: number;
  priceLastUpdated?: string;
  priceSource?: string;
}

interface Portfolio {
  id: string;
  name: string;
  currency: string;
  user_id: string;
}

// Asset type to display name mapping
const ASSET_TYPE_LABELS: Record<string, string> = {
  equity: "Equities & ETFs",
  etf: "Equities & ETFs",
  bond: "Cash & Fixed Income",
  money_market: "Cash & Fixed Income",
  cash: "Cash & Fixed Income",
};

// Colors for asset classes
const ASSET_COLORS: Record<string, string> = {
  "Equities & ETFs": "#10B981",
  "Cash & Fixed Income": "#3B82F6",
  "Private Equity": "#8B5CF6",
  "Other": "#6B7280",
};

// Calculate estimated yield based on asset type
function getEstimatedYield(assetType?: string): number {
  switch (assetType) {
    case "money_market":
    case "cash":
      return 5.0;
    case "bond":
      return 6.0;
    case "etf":
      return 7.0;
    case "equity":
      return 6.0;
    default:
      return 6.0;
  }
}

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedHoldings, setExpandedHoldings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  // Separate effect for periodic price refresh
  useEffect(() => {
    if (holdings.length === 0) {
      return;
    }

    // Refresh prices every 30 seconds when screen is active
    const priceRefreshInterval = setInterval(() => {
      // Pass current holdings to avoid stale closure
      fetchRealtimePrices(holdings);
    }, 30000); // 30 seconds

    return () => clearInterval(priceRefreshInterval);
  }, [holdings, fetchRealtimePrices]);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();
    
    try {
      // Get user
      const { data: { user: userData } } = await supabase.auth.getUser();
      setUser(userData);

      if (userData) {
        // Get portfolios
        const { data: portfoliosData, error: portfoliosError } = await supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false });

        if (!portfoliosError && portfoliosData) {
          setPortfolios(portfoliosData);
        }

        // Get holdings
        if (portfoliosData && portfoliosData.length > 0) {
          const portfolioIds = portfoliosData.map(p => p.id);
          const { data: holdingsData, error: holdingsError } = await supabase
            .from("holdings")
            .select(`
              id,
              portfolio_id,
              symbol,
              name,
              quantity,
              purchase_price,
              current_price,
              currency,
              asset_type,
              market_symbol,
              portfolios(id, name)
            `)
            .in("portfolio_id", portfolioIds);

          if (!holdingsError && holdingsData) {
            setHoldings(holdingsData);
            // Fetch real-time prices after loading holdings
            fetchRealtimePrices(holdingsData);
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch real-time prices for all holdings
   */
  const fetchRealtimePrices = useCallback(async (holdingsToUpdate?: Holding[]) => {
    // Always require holdings to be passed in to avoid stale closure issues
    const holdingsList = holdingsToUpdate || holdings;
    
    if (!holdingsList || holdingsList.length === 0) {
      return;
    }

    setLoadingPrices(true);
    
    try {
      // Get unique symbols (use market_symbol if available, fallback to symbol)
      const symbols = holdingsList.map(h => 
        (h.market_symbol || h.symbol).toUpperCase()
      );
      const uniqueSymbols = [...new Set(symbols)];
      const assetTypes = holdingsList.map(h => h.asset_type || 'equity');

      // Fetch prices (will gracefully handle API unavailability)
      const prices = await priceService.getPrices(uniqueSymbols, assetTypes);

      // Only update if we got prices back
      if (prices.size > 0) {
        // Update holdings with real-time prices
        setHoldings(prevHoldings => 
          prevHoldings.map(holding => {
            const symbol = (holding.market_symbol || holding.symbol).toUpperCase();
            const priceData = prices.get(symbol);
            
            if (priceData) {
              return {
                ...holding,
                realtimePrice: priceData.price,
                realtimeChangePercent: priceData.changePercent,
                realtimeChangeAmount: priceData.changeAmount,
                priceLastUpdated: priceData.timestamp,
                priceSource: priceData.source,
              };
            }
            return holding;
          })
        );
      }
    } catch (error) {
      // Silently fail - prices will use stored current_price
      // Only log in development
      if (__DEV__) {
        console.warn("Price fetch failed (using stored prices):", error instanceof Error ? error.message : error);
      }
    } finally {
      setLoadingPrices(false);
    }
  }, [holdings]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Clear price cache to force refresh
    priceService.clearCache();
    await loadData();
    // Refresh prices
    await fetchRealtimePrices();
    setRefreshing(false);
  };

  // Calculate portfolio totals using real-time prices when available
  let totalPortfolioValue = 0;
  const assetClassBreakdown: Record<string, number> = {};
  
  for (const holding of holdings) {
    // Use real-time price if available, otherwise fallback to current_price
    const price = holding.realtimePrice ?? Number(holding.current_price || 0);
    const value = Number(holding.quantity || 0) * price;
    totalPortfolioValue += value;
    
    const assetType = holding.asset_type || 'equity';
    const groupName = ASSET_TYPE_LABELS[assetType] || "Other";
    assetClassBreakdown[groupName] = (assetClassBreakdown[groupName] || 0) + value;
  }

  // Group holdings by asset class
  const groupedHoldings: Record<string, Holding[]> = {};
  for (const holding of holdings) {
    const assetType = holding.asset_type || 'equity';
    const groupName = ASSET_TYPE_LABELS[assetType] || "Other";
    
    if (!groupedHoldings[groupName]) {
      groupedHoldings[groupName] = [];
    }
    groupedHoldings[groupName].push(holding);
  }

  // Calculate performance (mock - in real app would use historical data)
  const pastYearReturn = 12.3;
  const pastYearValue = totalPortfolioValue * 0.123;

  const toggleSection = (groupName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const toggleHoldingDetails = (holdingId: string) => {
    setExpandedHoldings(prev => ({
      ...prev,
      [holdingId]: !prev[holdingId]
    }));
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#334e68" />
        <Text className="text-gray-500 mt-4">Loading portfolio...</Text>
      </View>
    );
  }

  const portfolioCurrency = portfolios.length > 0 ? portfolios[0].currency || "CHF" : "CHF";

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{ backgroundColor: '#1e3a8a', paddingTop: insets.top + 8 }} className="pb-4 px-4">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-white text-2xl font-bold">Portfolio</Text>
            <Text className="text-white/80 text-sm mt-1">Investment overview</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 py-6">

        {/* Total Portfolio Value Card */}
        <FadeIn delay={200}>
          <AnimatedCard className="p-6 mb-4" style={{ backgroundColor: '#334e68' }}>
            <View className="items-center">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Total Portfolio Value</Text>
                {loadingPrices && (
                  <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />
                )}
                {!loadingPrices && holdings.some(h => h.realtimePrice) && (
                  <Ionicons name="pulse" size={12} color="#86efac" />
                )}
              </View>
              <Text className="text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
                {formatCurrency(totalPortfolioValue, portfolioCurrency)}
              </Text>
              <View className="flex-row items-center gap-4 mt-2">
                <View className="items-center">
                  <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Past Year Return</Text>
                  <Text className="text-lg font-semibold" style={{ color: '#86efac' }}>+{pastYearReturn.toFixed(1)}%</Text>
                </View>
                <View style={{ height: 16, width: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                <View className="items-center">
                  <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Past Year Value</Text>
                  <Text className="text-lg font-semibold" style={{ color: '#86efac' }}>
                    +{formatCurrency(pastYearValue, portfolioCurrency)}
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedCard>
        </FadeIn>

        {/* Asset Allocation Summary */}
        <FadeIn delay={300}>
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Asset Allocation</Text>
            <AnimatedCard className="p-4">
              <View className="gap-3">
                {Object.entries(assetClassBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([groupName, value]) => {
                    const percentage = totalPortfolioValue > 0 
                      ? Math.round((value / totalPortfolioValue) * 100) 
                      : 0;
                    const color = ASSET_COLORS[groupName] || ASSET_COLORS["Other"];
                    
                    return (
                      <View key={groupName} className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2 flex-1">
                            <View 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: color }}
                            />
                            <Text className="text-sm font-semibold text-gray-900 flex-1">
                              {groupName}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-sm font-bold text-gray-900">
                              {formatCurrency(value, portfolios.length > 0 ? portfolios[0].currency || "CHF" : "CHF")}
                            </Text>
                            <Text className="text-xs text-gray-500">{percentage}%</Text>
                          </View>
                        </View>
                        {/* Progress bar */}
                        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <View 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: color 
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}
              </View>
            </AnimatedCard>
          </View>
        </FadeIn>

        {/* Holdings by Asset Class */}
        <FadeIn delay={400}>
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Holdings</Text>
            
            {Object.keys(groupedHoldings).length === 0 ? (
              <AnimatedCard>
                <View className="p-8 items-center">
                  <View className="h-16 w-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="trending-up" size={32} color="#9ca3af" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900 mb-2">No holdings yet</Text>
                  <Text className="text-gray-500 text-center">
                    Your investment holdings will appear here
                  </Text>
                </View>
              </AnimatedCard>
            ) : (
              <View className="gap-4">
                {Object.entries(groupedHoldings)
                  .sort((a, b) => {
                    const aValue = assetClassBreakdown[a[0]] || 0;
                    const bValue = assetClassBreakdown[b[0]] || 0;
                    return bValue - aValue;
                  })
                  .map(([groupName, groupHoldings]) => {
                    const total = assetClassBreakdown[groupName] || 0;
                    const percentage = totalPortfolioValue > 0 
                      ? Math.round((total / totalPortfolioValue) * 100) 
                      : 0;
                    const color = ASSET_COLORS[groupName] || ASSET_COLORS["Other"];
                    const isExpanded = expandedSections[groupName] ?? false;
                    
                    return (
                      <AnimatedCard key={groupName} className="overflow-hidden">
                        {/* Section Header */}
                        <TouchableOpacity
                          onPress={() => toggleSection(groupName)}
                          activeOpacity={0.7}
                        >
                          <View className="p-4 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3 flex-1">
                              <View 
                                className="w-5 h-5 rounded"
                                style={{ backgroundColor: color }}
                              />
                              <View className="flex-1">
                                <Text className="text-base font-semibold text-gray-900">
                                  {groupName}
                                </Text>
                                <Text className="text-xs text-gray-500">
                                  {percentage}% • {groupHoldings.length} holding{groupHoldings.length !== 1 ? 's' : ''}
                                </Text>
                              </View>
                            </View>
                            <View className="items-end mr-2">
                              <Text className="text-sm font-bold text-gray-900">
                                {formatCurrency(total, portfolioCurrency)}
                              </Text>
                            </View>
                            <Ionicons 
                              name={isExpanded ? "chevron-down" : "chevron-forward"} 
                              size={20} 
                              color="#6b7280" 
                            />
                          </View>
                        </TouchableOpacity>

                        {/* Holdings List */}
                        {isExpanded && (
                          <View className="border-t border-gray-100">
                            {groupHoldings.map((holding, index) => {
                              // Use real-time price if available, otherwise fallback to current_price
                              const currentPrice = holding.realtimePrice ?? Number(holding.current_price || 0);
                              const rawValue = Number(holding.quantity || 0) * currentPrice;
                              const purchaseValue = Number(holding.quantity || 0) * Number(holding.purchase_price || 0);
                              const gainLoss = rawValue - purchaseValue;
                              const gainLossPercent = purchaseValue > 0 
                                ? ((gainLoss / purchaseValue) * 100) 
                                : 0;
                              const yieldPercent = getEstimatedYield(holding.asset_type);
                              const holdingId = holding.id;
                              const isHoldingExpanded = expandedHoldings[holdingId] || false;
                              
                              // Use real-time change if available
                              const displayChangePercent = holding.realtimeChangePercent ?? gainLossPercent;
                              const displayChangeAmount = holding.realtimeChangeAmount ?? gainLoss;

                              return (
                                <View 
                                  key={holdingId} 
                                  className="border-b border-gray-50"
                                  style={index === groupHoldings.length - 1 ? { borderBottomWidth: 0 } : {}}
                                >
                                  <TouchableOpacity
                                    onPress={() => toggleHoldingDetails(holdingId)}
                                    activeOpacity={0.7}
                                  >
                                    <View className="p-4">
                                      <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-1">
                                          <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                                            {holding.name || holding.symbol}
                                          </Text>
                                          <Text className="text-xs text-gray-500 mt-0.5">
                                            {holding.symbol} • Est. {yieldPercent.toFixed(1)}% Yield
                                          </Text>
                                        </View>
                                        <View className="items-end ml-3">
                                          <Text className="text-sm font-bold text-gray-900">
                                            {formatCurrency(rawValue, holding.currency || portfolioCurrency)}
                                          </Text>
                                          {holding.realtimePrice && (
                                            <View className="flex-row items-center gap-1 mt-0.5">
                                              <Ionicons 
                                                name="pulse" 
                                                size={10} 
                                                color={holding.realtimeChangePercent && holding.realtimeChangePercent >= 0 ? "#16a34a" : "#dc2626"} 
                                              />
                                              <Text className="text-xs text-gray-500">
                                                Live
                                              </Text>
                                            </View>
                                          )}
                                          <Text className={`text-xs font-medium ${
                                            displayChangeAmount >= 0 ? "text-green-600" : "text-red-600"
                                          }`}>
                                            {displayChangeAmount >= 0 ? "+" : ""}{formatCurrency(Math.abs(displayChangeAmount), holding.currency || portfolioCurrency)} ({displayChangePercent >= 0 ? "+" : ""}{displayChangePercent.toFixed(2)}%)
                                          </Text>
                                        </View>
                                      </View>
                                      
                                      {isHoldingExpanded && (
                                        <View className="mt-3 pt-3 border-t border-gray-100">
                                          <View className="flex-row flex-wrap gap-3">
                                            <View className="flex-1 min-w-[45%]">
                                              <Text className="text-xs text-gray-500">Quantity</Text>
                                              <Text className="text-sm font-medium text-gray-900">
                                                {Number(holding.quantity || 0).toLocaleString()}
                                              </Text>
                                            </View>
                                            <View className="flex-1 min-w-[45%]">
                                              <Text className="text-xs text-gray-500">
                                                {holding.realtimePrice ? "Live Price" : "Current Price"}
                                              </Text>
                                              <View className="flex-row items-center gap-1">
                                                <Text className="text-sm font-medium text-gray-900">
                                                  {formatCurrency(currentPrice, holding.currency || portfolioCurrency)}
                                                </Text>
                                                {holding.realtimePrice && (
                                                  <Ionicons name="pulse" size={12} color="#16a34a" />
                                                )}
                                              </View>
                                              {holding.realtimeChangePercent !== undefined && (
                                                <Text className={`text-xs font-medium ${
                                                  holding.realtimeChangePercent >= 0 ? "text-green-600" : "text-red-600"
                                                }`}>
                                                  {holding.realtimeChangePercent >= 0 ? "+" : ""}{holding.realtimeChangePercent.toFixed(2)}% today
                                                </Text>
                                              )}
                                            </View>
                                            <View className="flex-1 min-w-[45%]">
                                              <Text className="text-xs text-gray-500">Purchase Price</Text>
                                              <Text className="text-sm font-medium text-gray-900">
                                                {formatCurrency(Number(holding.purchase_price || 0), holding.currency || portfolioCurrency)}
                                              </Text>
                                            </View>
                                            <View className="flex-1 min-w-[45%]">
                                              <Text className="text-xs text-gray-500">Purchase Value</Text>
                                              <Text className="text-sm font-medium text-gray-900">
                                                {formatCurrency(purchaseValue, holding.currency || portfolioCurrency)}
                                              </Text>
                                            </View>
                                            <View className="flex-1 min-w-[45%]">
                                              <Text className="text-xs text-gray-500">Estimated Yield</Text>
                                              <Text className="text-sm font-medium text-gray-900">
                                                {yieldPercent.toFixed(2)}%
                                              </Text>
                                            </View>
                                            {holding.portfolios && (
                                              <View className="flex-1 min-w-[45%]">
                                                <Text className="text-xs text-gray-500">Portfolio</Text>
                                                <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                                                  {holding.portfolios.name}
                                                </Text>
                                              </View>
                                            )}
                                          </View>
                                        </View>
                                      )}
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </AnimatedCard>
                    );
                  })}
              </View>
            )}
          </View>
        </FadeIn>
        </View>
      </ScrollView>
    </View>
  );
}
