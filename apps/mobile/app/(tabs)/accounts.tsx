import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, Pressable } from "react-native";
import { createClient } from "@/lib/supabase/client";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
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
  user_id: string;
  created_at?: string;
}

interface WealthAllocationCategory {
  id: string;
  name: string;
  shortName: string;
  percentage: number;
  value: number;
  dailyGain: number;
  description: string;
  icon: string;
  accountId?: string;
}

// Map accounts to wealth allocation categories
// Supports both seed-account.ts structure and API route structure
function mapAccountsToCategories(accounts: Account[], totalBalance: number): WealthAllocationCategory[] {
  const categories: WealthAllocationCategory[] = [];
  const matchedAccountIds = new Set<string>();
  
  // === Seed-account.ts structure ===
  
  // Find Safety & Financial Foundation Account (40%)
  const safetyAccount = accounts.find(acc => acc.name.includes('Safety & Financial Foundation'));
  if (safetyAccount) {
    matchedAccountIds.add(safetyAccount.id);
    categories.push({
      id: 'safety',
      name: 'Safety & Stability',
      shortName: 'Safety & Stability',
      percentage: (Number(safetyAccount.balance || 0) / totalBalance) * 100,
      value: Number(safetyAccount.balance || 0),
      dailyGain: Number(safetyAccount.balance || 0) * 0.0002,
      description: 'High Interest Savings, U.S. Treasury bonds + Money Market Funds',
      icon: 'shield-checkmark',
      accountId: safetyAccount.id,
    });
  }
  
  // Find Long Term Investing Account (30%)
  const longTermAccount = accounts.find(acc => acc.name.includes('Long Term Investing'));
  if (longTermAccount) {
    matchedAccountIds.add(longTermAccount.id);
    categories.push({
      id: 'longterm',
      name: 'Long Term Investing',
      shortName: 'Long Term Investing',
      percentage: (Number(longTermAccount.balance || 0) / totalBalance) * 100,
      value: Number(longTermAccount.balance || 0),
      dailyGain: Number(longTermAccount.balance || 0) * 0.0021,
      description: 'Global Equity ETPs • Dividend Growth Stocks',
      icon: 'trending-up',
      accountId: longTermAccount.id,
    });
  }
  
  // Find Lifestyle Allocation Checking Account (10%)
  const lifestyleAccount = accounts.find(acc => acc.name.includes('Lifestyle Allocation'));
  if (lifestyleAccount) {
    matchedAccountIds.add(lifestyleAccount.id);
    categories.push({
      id: 'lifestyle',
      name: 'Lifestyle Allocation',
      shortName: 'Lifestyle Allocation',
      percentage: (Number(lifestyleAccount.balance || 0) / totalBalance) * 100,
      value: Number(lifestyleAccount.balance || 0),
      dailyGain: Number(lifestyleAccount.balance || 0) * 0.0002,
      description: 'Personal expenses + Large purchase purchases',
      icon: 'bag',
      accountId: lifestyleAccount.id,
    });
  }
  
  // Find Professional Advice & Structure Checking Account (5%)
  const professionalAccount = accounts.find(acc => acc.name.includes('Professional Advice'));
  if (professionalAccount) {
    matchedAccountIds.add(professionalAccount.id);
    categories.push({
      id: 'professional',
      name: 'Professional Advice',
      shortName: 'Professional Advice',
      percentage: (Number(professionalAccount.balance || 0) / totalBalance) * 100,
      value: Number(professionalAccount.balance || 0),
      dailyGain: Number(professionalAccount.balance || 0) * 0.0005,
      description: 'Tax, legal, & estate planning',
      icon: 'briefcase',
      accountId: professionalAccount.id,
    });
  }
  
  // Find Cash Reserve Checking Account (5%)
  const cashReserveAccount = accounts.find(acc => acc.name.includes('Cash Reserve'));
  if (cashReserveAccount) {
    matchedAccountIds.add(cashReserveAccount.id);
    categories.push({
      id: 'cashreserve',
      name: 'Cash Reserve',
      shortName: 'Cash Reserve',
      percentage: (Number(cashReserveAccount.balance || 0) / totalBalance) * 100,
      value: Number(cashReserveAccount.balance || 0),
      dailyGain: Number(cashReserveAccount.balance || 0) * 0.0015,
      description: 'High liquidity, immediate cash reserve',
      icon: 'wallet',
      accountId: cashReserveAccount.id,
    });
  }

  // === API route structure ===
  
  // Find Public Markets Investment Account (40%)
  const publicMarketsAccount = accounts.find(acc => acc.name.includes('Public Markets'));
  if (publicMarketsAccount && !matchedAccountIds.has(publicMarketsAccount.id)) {
    matchedAccountIds.add(publicMarketsAccount.id);
    categories.push({
      id: 'public-markets',
      name: 'Public Markets',
      shortName: 'Public Markets',
      percentage: (Number(publicMarketsAccount.balance || 0) / totalBalance) * 100,
      value: Number(publicMarketsAccount.balance || 0),
      dailyGain: Number(publicMarketsAccount.balance || 0) * 0.0021,
      description: 'Stocks, ETFs, and Bonds',
      icon: 'trending-up',
      accountId: publicMarketsAccount.id,
    });
  }
  
  // Find Private Equity & Venture Capital Account (30%)
  const peVcAccount = accounts.find(acc => acc.name.includes('Private Equity') || acc.name.includes('Venture Capital'));
  if (peVcAccount && !matchedAccountIds.has(peVcAccount.id)) {
    matchedAccountIds.add(peVcAccount.id);
    categories.push({
      id: 'pe-vc',
      name: 'Private Equity & VC',
      shortName: 'PE & VC',
      percentage: (Number(peVcAccount.balance || 0) / totalBalance) * 100,
      value: Number(peVcAccount.balance || 0),
      dailyGain: Number(peVcAccount.balance || 0) * 0.0015,
      description: 'Private equity funds and venture capital investments',
      icon: 'business',
      accountId: peVcAccount.id,
    });
  }
  
  // Find Cash & Money Market Account (20%)
  const cashMoneyMarketAccount = accounts.find(acc => acc.name.includes('Cash & Money Market') || acc.name.includes('Money Market'));
  if (cashMoneyMarketAccount && !matchedAccountIds.has(cashMoneyMarketAccount.id)) {
    matchedAccountIds.add(cashMoneyMarketAccount.id);
    categories.push({
      id: 'cash-money-market',
      name: 'Cash & Money Market',
      shortName: 'Cash & MM',
      percentage: (Number(cashMoneyMarketAccount.balance || 0) / totalBalance) * 100,
      value: Number(cashMoneyMarketAccount.balance || 0),
      dailyGain: Number(cashMoneyMarketAccount.balance || 0) * 0.0002,
      description: 'High liquidity cash and money market funds',
      icon: 'wallet',
      accountId: cashMoneyMarketAccount.id,
    });
  }
  
  // Find Alternative Investments Account (10%)
  const altInvestmentsAccount = accounts.find(acc => acc.name.includes('Alternative Investments'));
  if (altInvestmentsAccount && !matchedAccountIds.has(altInvestmentsAccount.id)) {
    matchedAccountIds.add(altInvestmentsAccount.id);
    categories.push({
      id: 'alternative',
      name: 'Alternative Investments',
      shortName: 'Alternatives',
      percentage: (Number(altInvestmentsAccount.balance || 0) / totalBalance) * 100,
      value: Number(altInvestmentsAccount.balance || 0),
      dailyGain: Number(altInvestmentsAccount.balance || 0) * 0.001,
      description: 'Crypto, REITs, Commodities, and other alternatives',
      icon: 'cube',
      accountId: altInvestmentsAccount.id,
    });
  }

  // Add any remaining accounts that don't match the above categories
  accounts.forEach(account => {
    if (!matchedAccountIds.has(account.id)) {
      const accountType = account.type || 'checking';
      const iconMap: Record<string, string> = {
        checking: 'wallet',
        savings: 'business',
        investment: 'trending-up',
        credit: 'card',
      };
      
      categories.push({
        id: account.id,
        name: account.name,
        shortName: account.name,
        percentage: (Number(account.balance || 0) / totalBalance) * 100,
        value: Number(account.balance || 0),
        dailyGain: Number(account.balance || 0) * 0.0002,
        description: `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} account`,
        icon: iconMap[accountType] || 'wallet',
        accountId: account.id,
      });
    }
  });
  
  return categories.sort((a, b) => b.value - a.value);
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
}

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
}

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
  const [accountHoldings, setAccountHoldings] = useState<Holding[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingHoldings, setLoadingHoldings] = useState(false);

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

  const openAccountModal = async (account: Account) => {
    setSelectedAccount(account);
    setModalVisible(true);
    setLoadingTransactions(true);
    setLoadingHoldings(true);
    
    const supabase = createClient();
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Get transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", account.id)
        .order("date", { ascending: false })
        .limit(20);

      if (!transactionsError && transactionsData) {
        setAccountTransactions(transactionsData);
      }

      // Get portfolios for this account (match by name)
      if (currentUser) {
        const { data: portfoliosData, error: portfoliosError } = await supabase
          .from("portfolios")
          .select("id, name")
          .eq("user_id", currentUser.id)
          .ilike("name", `%${account.name}%`);

        if (!portfoliosError && portfoliosData && portfoliosData.length > 0) {
          const portfolioIds = portfoliosData.map(p => p.id);
          
          // Get holdings for these portfolios
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
              asset_type
            `)
            .in("portfolio_id", portfolioIds)
            .order("name", { ascending: true });

          if (!holdingsError && holdingsData) {
            setAccountHoldings(holdingsData);
          }
        }
      }
    } catch (error) {
      console.error("Error loading account data:", error);
    } finally {
      setLoadingTransactions(false);
      setLoadingHoldings(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAccount(null);
    setAccountTransactions([]);
    setAccountHoldings([]);
  };

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const dailyChangeAmount = totalBalance * 0.00083;
  const dailyChangePercent = 0.08;

  // Map accounts to wealth allocation categories
  const allocationCategories = mapAccountsToCategories(accounts, totalBalance);

  // Get display name
  const displayName = profile?.full_name || 
    (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : null) ||
    profile?.username ||
    user?.email?.split('@')[0] ||
    'User';

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#334e68" />
        <Text className="text-gray-500 mt-4">Loading accounts...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{ backgroundColor: '#1e3a8a', paddingTop: insets.top + 8 }} className="pb-4 px-4">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-white text-2xl font-bold">Accounts</Text>
            <Text className="text-white/80 text-sm mt-1">Wealth allocation overview</Text>
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
          {/* Total Value Hero Card */}
          <FadeIn delay={100}>
            <AnimatedCard className="p-6 mb-4" style={{ backgroundColor: '#1e3a8a' }}>
              <View className="items-center">
                <Text className="text-white/80 text-sm font-medium mb-2">Total Portfolio Value</Text>
                <Text className="text-4xl font-bold text-white mb-3">
                  {formatCurrency(totalBalance, "CHF")}
                </Text>
                <View className="flex-row items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Ionicons name="arrow-up" size={16} color="white" />
                  <Text className="text-white font-semibold text-sm">
                    +{formatCurrency(dailyChangeAmount, "CHF")} (+{dailyChangePercent.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            </AnimatedCard>
          </FadeIn>

          {/* Profile Card */}
          <FadeIn delay={150}>
            <AnimatedCard className="p-4 mb-4">
              <View className="flex-row items-center gap-4">
                <View className="relative">
                  <View className="h-16 w-16 bg-primary-100 rounded-full items-center justify-center">
                    <Ionicons name="person" size={32} color="#334e68" />
                  </View>
                  <View className="absolute bottom-0 right-0 h-5 w-5 bg-green-600 rounded-full items-center justify-center border-2 border-white">
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {profile?.role || 'Client'} • Verified Account
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</Text>
                </View>
              </View>
            </AnimatedCard>
          </FadeIn>

          {/* Wealth Allocation Categories */}
          {allocationCategories.length === 0 ? (
            <FadeIn delay={200}>
              <AnimatedCard className="p-12">
                <View className="items-center">
                  <View className="h-20 w-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="wallet" size={40} color="#9ca3af" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900 mb-2">No accounts found</Text>
                  <Text className="text-gray-500 text-center">
                    Accounts will appear here once created
                  </Text>
                </View>
              </AnimatedCard>
            </FadeIn>
          ) : (
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">Wealth Allocation</Text>
                <Text className="text-sm text-gray-500">{allocationCategories.length} categories</Text>
              </View>
              
              <View className="gap-3">
                {allocationCategories.map((category, index) => {
                  const dailyGainPercent = category.value > 0 
                    ? (category.dailyGain / category.value) * 100 
                    : 0;
                  
                  const descriptionParts = category.description
                    .split(/[,•+]/)
                    .map(part => part.trim())
                    .filter(part => part.length > 0);
                  
                  return (
                    <FadeIn key={category.id} delay={200 + index * 50}>
                      <TouchableOpacity
                        onPress={() => {
                          if (category.accountId) {
                            const account = accounts.find(acc => acc.id === category.accountId);
                            if (account) {
                              openAccountModal(account);
                            }
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <AnimatedCard className="p-5">
                          <View className="flex-row items-start gap-4">
                            {/* Icon */}
                            <View className="bg-primary-600 p-3 rounded-xl">
                              <Ionicons name={category.icon as any} size={24} color="white" />
                            </View>
                            
                            {/* Main Content */}
                            <View className="flex-1 min-w-0">
                              {/* Title and Value */}
                              <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-1 min-w-0">
                                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                    {category.name}
                                  </Text>
                                  <Text className="text-xs text-gray-500 mt-0.5">
                                    {category.percentage.toFixed(1)}% of portfolio
                                  </Text>
                                </View>
                                <View className="items-end ml-2">
                                  <Text className="text-lg font-bold text-gray-900">
                                    {formatCurrency(category.value, "CHF")}
                                  </Text>
                                  {category.accountId && (
                                    <Ionicons name="chevron-forward" size={18} color="#9ca3af" style={{ marginTop: 4 }} />
                                  )}
                                </View>
                              </View>
                              
                              {/* Description */}
                              <View className="mb-3">
                                <Text className="text-xs text-gray-600 leading-4" numberOfLines={2}>
                                  {category.description}
                                </Text>
                              </View>
                              
                              {/* Daily Gain Badge */}
                              <View className="flex-row items-center gap-2">
                                <View className="flex-row items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                                  <Ionicons name="arrow-up" size={12} color="#16a34a" />
                                  <Text className="text-xs font-semibold text-green-600">
                                    +{formatCurrency(category.dailyGain, "CHF")}
                                  </Text>
                                </View>
                                <Text className="text-xs text-gray-500">
                                  Today
                                </Text>
                              </View>
                            </View>
                          </View>
                        </AnimatedCard>
                      </TouchableOpacity>
                    </FadeIn>
                  );
                })}
              </View>
            </View>
          )}

          {/* All Accounts List */}
          {accounts.length > 0 && (
            <FadeIn delay={300}>
              <View className="mt-2">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-gray-900">All Accounts</Text>
                  <Text className="text-sm text-gray-500">{accounts.length} total</Text>
                </View>
                
                <View className="gap-3">
                  {accounts.map((account, index) => {
                    const iconMap: Record<string, string> = {
                      checking: 'wallet',
                      savings: 'business',
                      investment: 'trending-up',
                      credit: 'card',
                    };
                    const colorMap: Record<string, string> = {
                      checking: 'bg-primary-600',
                      savings: 'bg-blue-600',
                      investment: 'bg-green-600',
                      credit: 'bg-orange-600',
                    };
                    
                    const icon = iconMap[account.type] || 'wallet';
                    const color = colorMap[account.type] || 'bg-gray-600';
                    
                    return (
                      <TouchableOpacity
                        key={account.id}
                        onPress={() => openAccountModal(account)}
                        activeOpacity={0.7}
                      >
                        <AnimatedCard delay={350 + index * 30} className="p-4">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-4 flex-1">
                              <View className={`h-14 w-14 ${color} rounded-xl items-center justify-center`}>
                                <Ionicons name={icon as any} size={28} color="white" />
                              </View>
                              <View className="flex-1 min-w-0">
                                <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                  {account.name}
                                </Text>
                                <Text className="text-sm text-gray-500 capitalize mt-0.5">
                                  {account.type}
                                </Text>
                                {account.account_number && (
                                  <Text className="text-xs text-gray-400 mt-1">
                                    ****{account.account_number.toString().slice(-4)}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <View className="items-end ml-3">
                              <Text className="text-lg font-bold text-gray-900">
                                {formatCurrency(Number(account.balance || 0), account.currency || "CHF")}
                              </Text>
                              <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={{ marginTop: 4 }} />
                            </View>
                          </View>
                        </AnimatedCard>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </FadeIn>
          )}
        </View>
      </ScrollView>

      {/* Account Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-gray-50">
          {/* Modal Header */}
          <View style={{ backgroundColor: '#1e3a8a', paddingTop: insets.top + 8 }} className="pb-4 px-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold" numberOfLines={1}>
                  {selectedAccount?.name || "Account Details"}
                </Text>
                <Text className="text-white/80 text-sm mt-1">
                  {selectedAccount?.type || ""}
                </Text>
              </View>
              <Pressable onPress={closeModal} className="p-2 ml-4">
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1">
            {selectedAccount && (
              <View className="px-4 py-6">
                {/* Account Balance Hero */}
                <FadeIn delay={100}>
                  <AnimatedCard className="p-6 mb-6" style={{ backgroundColor: '#1e3a8a' }}>
                    <View className="items-center">
                      {(() => {
                        const iconMap: Record<string, string> = {
                          checking: 'wallet',
                          savings: 'business',
                          investment: 'trending-up',
                          credit: 'card',
                        };
                        const icon = iconMap[selectedAccount.type] || 'wallet';
                        
                        return (
                          <View className="h-16 w-16 bg-white/20 rounded-full items-center justify-center mb-4">
                            <Ionicons name={icon as any} size={32} color="white" />
                          </View>
                        );
                      })()}
                      <Text className="text-4xl font-bold text-white mb-2">
                        {formatCurrency(Number(selectedAccount.balance || 0), selectedAccount.currency || "CHF")}
                      </Text>
                      <Text className="text-white/80 text-sm">Current Balance</Text>
                    </View>
                  </AnimatedCard>
                </FadeIn>

                {/* Account Details */}
                <FadeIn delay={150}>
                  <AnimatedCard className="p-5 mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Account Information</Text>
                    <View className="gap-4">
                      {selectedAccount.account_number && (
                        <View className="pb-4 border-b border-gray-100">
                          <Text className="text-sm text-gray-600 mb-1">Account Number</Text>
                          <Text className="text-base font-mono text-gray-900">
                            ****{selectedAccount.account_number.toString().slice(-4)}
                          </Text>
                        </View>
                      )}
                      {selectedAccount.iban && (
                        <View className="pb-4 border-b border-gray-100">
                          <Text className="text-sm text-gray-600 mb-1">IBAN</Text>
                          <Text className="text-base font-mono text-gray-900 break-all">
                            {selectedAccount.iban}
                          </Text>
                        </View>
                      )}
                      <View className="pb-4 border-b border-gray-100">
                        <Text className="text-sm text-gray-600 mb-1">Account Type</Text>
                        <Text className="text-base font-semibold text-gray-900 capitalize">
                          {selectedAccount.type}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-sm text-gray-600 mb-1">Currency</Text>
                        <Text className="text-base font-semibold text-gray-900">
                          {selectedAccount.currency || "CHF"}
                        </Text>
                      </View>
                    </View>
                  </AnimatedCard>
                </FadeIn>

                {/* Portfolio Holdings */}
                <FadeIn delay={200}>
                  <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Portfolio Holdings</Text>
                    
                    {loadingHoldings ? (
                      <AnimatedCard className="p-12">
                        <View className="items-center">
                          <ActivityIndicator size="large" color="#334e68" />
                          <Text className="text-gray-500 mt-4">Loading holdings...</Text>
                        </View>
                      </AnimatedCard>
                    ) : accountHoldings.length === 0 ? (
                      <AnimatedCard className="p-12">
                        <View className="items-center">
                          <View className="h-16 w-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="trending-up" size={32} color="#9ca3af" />
                          </View>
                          <Text className="text-lg font-semibold text-gray-900 mb-2">No holdings found</Text>
                          <Text className="text-gray-500 text-center">
                            Investment holdings will appear here once available
                          </Text>
                        </View>
                      </AnimatedCard>
                    ) : (
                      <AnimatedCard className="p-5">
                        <View className="gap-4">
                          {accountHoldings.map((holding, index) => {
                            const rawValue = Number(holding.quantity || 0) * Number(holding.current_price || 0);
                            const purchaseValue = Number(holding.quantity || 0) * Number(holding.purchase_price || 0);
                            const gainLoss = rawValue - purchaseValue;
                            const gainLossPercent = purchaseValue > 0 
                              ? ((gainLoss / purchaseValue) * 100) 
                              : 0;
                            
                            return (
                              <View 
                                key={holding.id}
                                className={`pb-4 ${index !== accountHoldings.length - 1 ? 'border-b border-gray-100' : ''}`}
                              >
                                <View className="flex-row items-start justify-between mb-2">
                                  <View className="flex-1 min-w-0">
                                    <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                      {holding.name || holding.symbol}
                                    </Text>
                                    <Text className="text-sm text-gray-500 mt-1">
                                      {holding.symbol} • {Number(holding.quantity || 0).toLocaleString()} shares
                                    </Text>
                                  </View>
                                  <View className="items-end ml-3">
                                    <Text className="text-base font-bold text-gray-900">
                                      {formatCurrency(rawValue, holding.currency || selectedAccount.currency || "CHF")}
                                    </Text>
                                    <Text className={`text-sm font-semibold ${
                                      gainLoss >= 0 ? "text-green-600" : "text-red-600"
                                    }`}>
                                      {gainLoss >= 0 ? "+" : ""}{formatCurrency(gainLoss, holding.currency || selectedAccount.currency || "CHF")} ({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%)
                                    </Text>
                                  </View>
                                </View>
                                
                                <View className="flex-row flex-wrap gap-4 mt-3">
                                  <View>
                                    <Text className="text-xs text-gray-500">Current Price</Text>
                                    <Text className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(Number(holding.current_price || 0), holding.currency || selectedAccount.currency || "CHF")}
                                    </Text>
                                  </View>
                                  <View>
                                    <Text className="text-xs text-gray-500">Purchase Price</Text>
                                    <Text className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(Number(holding.purchase_price || 0), holding.currency || selectedAccount.currency || "CHF")}
                                    </Text>
                                  </View>
                                  {holding.asset_type && (
                                    <View>
                                      <Text className="text-xs text-gray-500">Asset Type</Text>
                                      <Text className="text-sm font-semibold text-gray-900 capitalize">
                                        {holding.asset_type.replace('_', ' ')}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            );
                          })}
                        </View>
                        
                        {/* Portfolio Summary */}
                        {accountHoldings.length > 0 && (
                          <View className="mt-4 pt-4 border-t border-gray-200">
                            <View className="flex-row items-center justify-between">
                              <Text className="text-base font-bold text-gray-700">Total Portfolio Value</Text>
                              <Text className="text-base font-bold text-gray-900">
                                {formatCurrency(
                                  accountHoldings.reduce((sum, h) => 
                                    sum + (Number(h.quantity || 0) * Number(h.current_price || 0)), 
                                    0
                                  ),
                                  selectedAccount.currency || "CHF"
                                )}
                              </Text>
                            </View>
                          </View>
                        )}
                      </AnimatedCard>
                    )}
                  </View>
                </FadeIn>

                {/* Recent Transactions */}
                <FadeIn delay={250}>
                  <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</Text>
                    
                    {loadingTransactions ? (
                      <AnimatedCard className="p-12">
                        <View className="items-center">
                          <ActivityIndicator size="large" color="#334e68" />
                          <Text className="text-gray-500 mt-4">Loading transactions...</Text>
                        </View>
                      </AnimatedCard>
                    ) : accountTransactions.length === 0 ? (
                      <AnimatedCard className="p-12">
                        <View className="items-center">
                          <View className="h-16 w-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="list" size={32} color="#9ca3af" />
                          </View>
                          <Text className="text-lg font-semibold text-gray-900 mb-2">No transactions found</Text>
                          <Text className="text-gray-500 text-center">
                            Transactions will appear here once available
                          </Text>
                        </View>
                      </AnimatedCard>
                    ) : (
                      <AnimatedCard className="p-5">
                        <View className="gap-0">
                          {accountTransactions.map((transaction, index) => {
                            const isCredit = transaction.type === "credit" || transaction.type === "deposit";
                            const amount = Number(transaction.amount || 0);
                            
                            return (
                              <View 
                                key={transaction.id}
                                className={`py-4 ${index !== accountTransactions.length - 1 ? 'border-b border-gray-100' : ''}`}
                              >
                                <View className="flex-row items-center justify-between">
                                  <View className="flex-row items-center gap-3 flex-1">
                                    <View className={`h-12 w-12 rounded-full items-center justify-center ${
                                      isCredit ? "bg-green-100" : "bg-red-100"
                                    }`}>
                                      <Ionicons
                                        name={isCredit ? "arrow-down" : "arrow-up"}
                                        size={20}
                                        color={isCredit ? "#16a34a" : "#dc2626"}
                                      />
                                    </View>
                                    <View className="flex-1 min-w-0">
                                      <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                                        {transaction.description || "Transaction"}
                                      </Text>
                                      <Text className="text-sm text-gray-500 mt-1">
                                        {formatDate(transaction.date)}
                                      </Text>
                                    </View>
                                  </View>
                                  <View className="items-end ml-3">
                                    <Text className={`text-base font-bold ${
                                      isCredit ? "text-green-600" : "text-red-600"
                                    }`}>
                                      {isCredit ? "+" : "-"}{formatCurrency(Math.abs(amount), transaction.currency || selectedAccount.currency || "CHF")}
                                    </Text>
                                    <Text className="text-xs text-gray-500 capitalize mt-1">
                                      {transaction.type}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </AnimatedCard>
                    )}
                  </View>
                </FadeIn>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
