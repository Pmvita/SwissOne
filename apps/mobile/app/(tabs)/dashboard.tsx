import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { createClient } from "@/lib/supabase/client";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  account_number?: string;
  iban?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  accounts?: {
    name: string;
    type: string;
  };
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});

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
        // Get profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role, email, username, full_name, first_name, last_name")
          .eq("id", userData.id)
          .maybeSingle();
        
        setProfile(profileData);

        // Get accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false });

        if (!accountsError && accountsData) {
          setAccounts(accountsData);
        }

        // Get recent transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transactions")
          .select("*, accounts(name, type)")
          .eq("user_id", userData.id)
          .order("date", { ascending: false })
          .limit(5);

        if (!transactionsError && transactionsData) {
          setRecentTransactions(transactionsData);
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

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

  // Get display name
  const displayName = profile?.full_name || 
    (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : null) ||
    profile?.username ||
    user?.email?.split('@')[0] ||
    'User';

  // Get primary checking account (or first account)
  const primaryAccount = accounts.find(acc => acc.type === "checking") || accounts[0];
  
  // Get investment accounts
  const investmentAccounts = accounts.filter(acc => acc.type === "investment" || acc.name.includes("Investing"));
  
  // Get savings accounts
  const savingsAccounts = accounts.filter(acc => acc.type === "savings" || acc.name.includes("Savings") || acc.name.includes("Cash"));
  
  // Get credit accounts
  const creditAccounts = accounts.filter(acc => acc.type === "credit");

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  // Mock market data (in real app, fetch from API)
  const marketData = [
    { symbol: "SMI", value: 11234.56, change: 123.45, changePercent: 1.11 },
    { symbol: "S&P 500", value: 4789.23, change: 45.67, changePercent: 0.96 },
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#334e68" />
        <Text className="text-gray-500 mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with SwissOne Branding */}
      <View style={{ backgroundColor: '#1e3a8a', paddingTop: insets.top + 8 }} className="pb-4 px-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 bg-white rounded-full items-center justify-center">
              <Text className="text-primary-700 font-bold text-xs">SO</Text>
            </View>
            <Text className="text-white text-lg font-bold">SwissOne</Text>
            <Text className="text-white/80 text-sm">Private Wealth</Text>
          </View>
          <TouchableOpacity onPress={() => {
            // TODO: Navigate to profile
            console.log("Profile");
          }}>
            <View className="h-10 w-10 bg-white/20 rounded-full items-center justify-center border-2 border-white/30">
              <Ionicons name="person" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 py-4">
          {/* Your Private Wealth Advisor Section */}
          <FadeIn delay={100}>
            <AnimatedCard className="p-4 mb-4">
              <View className="flex-row items-center gap-4">
                <View className="h-16 w-16 bg-primary-200 rounded-full items-center justify-center">
                  <Ionicons name="person" size={32} color="#334e68" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900">Your Private Wealth Advisor</Text>
                  <Text className="text-sm text-gray-600 mt-1">Michael Porter</Text>
                  <Text className="text-sm text-gray-500">+41 44 123 4567</Text>
                </View>
              </View>
              <View className="flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
                <TouchableOpacity className="flex-1">
                  <Text className="text-primary-700 font-medium text-sm">Contact My Advisor</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1">
                  <Text className="text-primary-700 font-medium text-sm">Message Center</Text>
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          </FadeIn>

          {/* My Accounts Section */}
          <FadeIn delay={200}>
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-gray-900">My Accounts</Text>
                <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
              </View>

              {/* Primary Checking Account - Large Display */}
              {primaryAccount && (
                <AnimatedCard className="p-6 mb-3" delay={250}>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    {primaryAccount.name}
                  </Text>
                  <Text className="text-4xl font-bold text-green-600 mb-1">
                    {formatCurrency(Number(primaryAccount.balance || 0), primaryAccount.currency || "CHF")}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text className="text-sm text-gray-600">Available Balance</Text>
                  </View>
                </AnimatedCard>
              )}

              {/* Investment Accounts - Expandable */}
              {investmentAccounts.length > 0 && (
                <AnimatedCard className="mb-3" delay={300}>
                  <TouchableOpacity
                    onPress={() => toggleAccount("investment")}
                    activeOpacity={0.7}
                  >
                    <View className="p-4 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <Ionicons 
                          name={expandedAccounts["investment"] ? "chevron-down" : "chevron-forward"} 
                          size={20} 
                          color="#6b7280" 
                        />
                        <Text className="text-base font-semibold text-gray-900">
                          Investment Accounts
                        </Text>
                      </View>
                      <Text className="text-base font-bold text-gray-900">
                        {formatCurrency(
                          investmentAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0),
                          "CHF"
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {expandedAccounts["investment"] && (
                    <View className="px-4 pb-4 border-t border-gray-100">
                      {investmentAccounts.map((account) => (
                        <TouchableOpacity
                          key={account.id}
                          onPress={() => router.push("/(tabs)/accounts")}
                          className="py-3 border-b border-gray-50 last:border-b-0"
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm text-gray-700">{account.name}</Text>
                            <Text className="text-sm font-semibold text-gray-900">
                              {formatCurrency(Number(account.balance || 0), account.currency || "CHF")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </AnimatedCard>
              )}

              {/* Cash Savings - Expandable */}
              {savingsAccounts.length > 0 && (
                <AnimatedCard className="mb-3" delay={350}>
                  <TouchableOpacity
                    onPress={() => toggleAccount("savings")}
                    activeOpacity={0.7}
                  >
                    <View className="p-4 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <Ionicons 
                          name={expandedAccounts["savings"] ? "chevron-down" : "chevron-forward"} 
                          size={20} 
                          color="#6b7280" 
                        />
                        <Text className="text-base font-semibold text-gray-900">
                          Cash Savings
                        </Text>
                      </View>
                      <Text className="text-base font-bold text-gray-900">
                        {formatCurrency(
                          savingsAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0),
                          "CHF"
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {expandedAccounts["savings"] && (
                    <View className="px-4 pb-4 border-t border-gray-100">
                      {savingsAccounts.map((account) => (
                        <TouchableOpacity
                          key={account.id}
                          onPress={() => router.push("/(tabs)/accounts")}
                          className="py-3 border-b border-gray-50 last:border-b-0"
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm text-gray-700">{account.name}</Text>
                            <Text className="text-sm font-semibold text-gray-900">
                              {formatCurrency(Number(account.balance || 0), account.currency || "CHF")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </AnimatedCard>
              )}

              {/* Credit Cards - Expandable */}
              {creditAccounts.length > 0 && (
                <AnimatedCard className="mb-4" delay={400}>
                  <TouchableOpacity
                    onPress={() => toggleAccount("credit")}
                    activeOpacity={0.7}
                  >
                    <View className="p-4 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <Ionicons 
                          name={expandedAccounts["credit"] ? "chevron-down" : "chevron-forward"} 
                          size={20} 
                          color="#6b7280" 
                        />
                        <Text className="text-base font-semibold text-gray-900">
                          Credit Cards
                        </Text>
                      </View>
                      <Text className="text-base font-bold text-gray-900">
                        {formatCurrency(
                          creditAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0),
                          "CHF"
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {expandedAccounts["credit"] && (
                    <View className="px-4 pb-4 border-t border-gray-100">
                      {creditAccounts.map((account) => (
                        <TouchableOpacity
                          key={account.id}
                          onPress={() => router.push("/(tabs)/accounts")}
                          className="py-3 border-b border-gray-50 last:border-b-0"
                        >
                          <View className="flex-row items-center justify-between">
                            <Text className="text-sm text-gray-700">{account.name}</Text>
                            <Text className="text-sm font-semibold text-gray-900">
                              {formatCurrency(Number(account.balance || 0), account.currency || "CHF")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </AnimatedCard>
              )}
            </View>
          </FadeIn>

          {/* Quick Links */}
          <FadeIn delay={500}>
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Quick Links</Text>
              <View className="flex-row flex-wrap gap-3">
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Navigate to transfer funds
                    console.log("Transfer Funds");
                  }}
                  className="flex-1 min-w-[45%] p-4 bg-white rounded-lg border border-gray-200"
                >
                  <View className="flex-row items-center gap-3 mb-2">
                    <Ionicons name="swap-horizontal" size={24} color="#334e68" />
                    <Text className="text-base font-semibold text-gray-900">Transfer Funds</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Navigate to pay bills
                    console.log("Pay Bills");
                  }}
                  className="flex-1 min-w-[45%] p-4 bg-white rounded-lg border border-gray-200"
                >
                  <View className="flex-row items-center gap-3 mb-2">
                    <Ionicons name="receipt" size={24} color="#334e68" />
                    <Text className="text-base font-semibold text-gray-900">Pay Bills</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/portfolio")}
                  className="flex-1 min-w-[45%] p-4 bg-white rounded-lg border border-gray-200"
                >
                  <View className="flex-row items-center gap-3 mb-2">
                    <Ionicons name="trending-up" size={24} color="#334e68" />
                    <Text className="text-base font-semibold text-gray-900">Manage Investments</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Navigate to financial planning
                    console.log("Financial Planning");
                  }}
                  className="flex-1 min-w-[45%] p-4 bg-white rounded-lg border border-gray-200"
                >
                  <View className="flex-row items-center gap-3 mb-2">
                    <Ionicons name="calculator" size={24} color="#334e68" />
                    <Text className="text-base font-semibold text-gray-900">Financial Planning</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </FadeIn>

          {/* Market Watch */}
          <FadeIn delay={600}>
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Market Watch</Text>
              <AnimatedCard className="p-4">
                <View className="gap-3">
                  {marketData.map((market, index) => (
                    <View key={market.symbol} className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">{market.symbol}</Text>
                        <Text className="text-sm text-gray-600">
                          {formatCurrency(market.value, "USD")}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="arrow-up" size={16} color="#16a34a" />
                        <Text className="text-sm font-semibold text-green-600">
                          +{formatCurrency(market.change, "USD")} (+{market.changePercent.toFixed(2)}%)
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </AnimatedCard>
            </View>
          </FadeIn>

          {/* Exclusive Wealth Management Services Card */}
          <FadeIn delay={700}>
            <AnimatedCard className="p-6 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
              <View className="items-center">
                <Ionicons name="shield-checkmark" size={48} color="#334e68" />
                <Text className="text-lg font-bold text-gray-900 mt-3 mb-1">
                  Exclusive Wealth Management Services
                </Text>
                <Text className="text-sm text-gray-600 text-center">
                  Expert Advice for Your Financial Future
                </Text>
              </View>
            </AnimatedCard>
          </FadeIn>
        </View>
      </ScrollView>
    </View>
  );
}
