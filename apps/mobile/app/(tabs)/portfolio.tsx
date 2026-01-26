import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { createClient } from "@/lib/supabase/client";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/lib/utils/format";

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
  portfolios?: {
    id: string;
    name: string;
  };
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
  const [user, setUser] = useState<any>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedHoldings, setExpandedHoldings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

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
              portfolios(id, name)
            `)
            .in("portfolio_id", portfolioIds);

          if (!holdingsError && holdingsData) {
            setHoldings(holdingsData);
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate portfolio totals
  let totalPortfolioValue = 0;
  const assetClassBreakdown: Record<string, number> = {};
  
  for (const holding of holdings) {
    const value = Number(holding.quantity || 0) * Number(holding.current_price || 0);
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

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 py-6">
        {/* Header */}
        <FadeIn delay={100}>
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900">Portfolio</Text>
            <Text className="text-gray-600 mt-1">Investment overview</Text>
          </View>
        </FadeIn>

        {/* Total Portfolio Value Card */}
        <FadeIn delay={200}>
          <AnimatedCard className="p-6 mb-4" style={{ backgroundColor: '#334e68' }}>
            <View className="items-center">
              <Text className="text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Total Portfolio Value</Text>
              <Text className="text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
                {formatCurrency(totalPortfolioValue, "USD")}
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
                    +{formatCurrency(pastYearValue, "USD")}
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
                              {formatCurrency(value, "USD")}
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
                                {formatCurrency(total, "USD")}
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
                              const rawValue = Number(holding.quantity || 0) * Number(holding.current_price || 0);
                              const purchaseValue = Number(holding.quantity || 0) * Number(holding.purchase_price || 0);
                              const gainLoss = rawValue - purchaseValue;
                              const gainLossPercent = purchaseValue > 0 
                                ? ((gainLoss / purchaseValue) * 100) 
                                : 0;
                              const yieldPercent = getEstimatedYield(holding.asset_type);
                              const holdingId = holding.id;
                              const isHoldingExpanded = expandedHoldings[holdingId] || false;

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
                                            {formatCurrency(rawValue, holding.currency || "USD")}
                                          </Text>
                                          <Text className={`text-xs font-medium ${
                                            gainLoss >= 0 ? "text-green-600" : "text-red-600"
                                          }`}>
                                            {gainLoss >= 0 ? "+" : ""}{formatCurrency(gainLoss, holding.currency || "USD")} ({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%)
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
                                              <Text className="text-xs text-gray-500">Current Price</Text>
                                              <Text className="text-sm font-medium text-gray-900">
                                                {formatCurrency(Number(holding.current_price || 0), holding.currency || "USD")}
                                              </Text>
                                            </View>
                                            <View className="flex-1 min-w-[45%]">
                                              <Text className="text-xs text-gray-500">Purchase Price</Text>
                                              <Text className="text-sm font-medium text-gray-900">
                                                {formatCurrency(Number(holding.purchase_price || 0), holding.currency || "USD")}
                                              </Text>
                                            </View>
                                            <View className="flex-1 min-w-[45%]">
                                              <Text className="text-xs text-gray-500">Purchase Value</Text>
                                              <Text className="text-sm font-medium text-gray-900">
                                                {formatCurrency(purchaseValue, holding.currency || "USD")}
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
  );
}
