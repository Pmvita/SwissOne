import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, Pressable } from "react-native";
import { createClient } from "@/lib/supabase/client";
import { AnimatedCard, FadeIn, SlideIn } from "@/components/ui/animated";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, formatDate } from "@/lib/utils/format";

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
function mapAccountsToCategories(accounts: Account[], totalBalance: number): WealthAllocationCategory[] {
  const categories: WealthAllocationCategory[] = [];
  
  // Find Safety & Financial Foundation Account (40%)
  const safetyAccount = accounts.find(acc => acc.name.includes('Safety & Financial Foundation'));
  if (safetyAccount) {
    categories.push({
      id: 'safety',
      name: 'Safety & Stability',
      shortName: 'Safety & Stability',
      percentage: (Number(safetyAccount.balance || 0) / totalBalance) * 100,
      value: Number(safetyAccount.balance || 0),
      dailyGain: Number(safetyAccount.balance || 0) * 0.0002, // Mock 0.02% daily gain
      description: 'High Interest Savings, U.S. Treasury bonds + Money Market Funds',
      icon: 'shield-checkmark',
      accountId: safetyAccount.id,
    });
  }
  
  // Find Long Term Investing Account (30%)
  const longTermAccount = accounts.find(acc => acc.name.includes('Long Term Investing'));
  if (longTermAccount) {
    categories.push({
      id: 'longterm',
      name: 'Long Term Investing',
      shortName: 'Long Term Investing',
      percentage: (Number(longTermAccount.balance || 0) / totalBalance) * 100,
      value: Number(longTermAccount.balance || 0),
      dailyGain: Number(longTermAccount.balance || 0) * 0.0021, // Mock 0.21% daily gain
      description: 'Global Equity ETPs • Dividend Growth Stocks',
      icon: 'trending-up',
      accountId: longTermAccount.id,
    });
  }
  
  // Find Lifestyle Allocation Checking Account (10%)
  const lifestyleAccount = accounts.find(acc => acc.name.includes('Lifestyle Allocation'));
  if (lifestyleAccount) {
    categories.push({
      id: 'lifestyle',
      name: 'Lifestyle Allocation',
      shortName: 'Lifestyle Allocation',
      percentage: (Number(lifestyleAccount.balance || 0) / totalBalance) * 100,
      value: Number(lifestyleAccount.balance || 0),
      dailyGain: Number(lifestyleAccount.balance || 0) * 0.0002, // Mock 0.02% daily gain
      description: 'Personal expenses + Large purchase purchases',
      icon: 'bag',
      accountId: lifestyleAccount.id,
    });
  }
  
  // Find Professional Advice & Structure Checking Account (5%)
  const professionalAccount = accounts.find(acc => acc.name.includes('Professional Advice'));
  if (professionalAccount) {
    categories.push({
      id: 'professional',
      name: 'Professional Advice',
      shortName: 'Professional Advice',
      percentage: (Number(professionalAccount.balance || 0) / totalBalance) * 100,
      value: Number(professionalAccount.balance || 0),
      dailyGain: Number(professionalAccount.balance || 0) * 0.0005, // Mock 0.05% daily gain
      description: 'Tax, legal, & estate planning',
      icon: 'briefcase',
      accountId: professionalAccount.id,
    });
  }
  
  // Find Cash Reserve Checking Account (5%)
  const cashReserveAccount = accounts.find(acc => acc.name.includes('Cash Reserve'));
  if (cashReserveAccount) {
    categories.push({
      id: 'cashreserve',
      name: 'Cash Reserve',
      shortName: 'Cash Reserve',
      percentage: (Number(cashReserveAccount.balance || 0) / totalBalance) * 100,
      value: Number(cashReserveAccount.balance || 0),
      dailyGain: Number(cashReserveAccount.balance || 0) * 0.0015, // Mock 0.15% daily gain
      description: 'High liquidity, immediate cash reserve',
      icon: 'wallet',
      accountId: cashReserveAccount.id,
    });
  }

  // Add any remaining accounts that don't match the above categories
  const matchedAccountIds = new Set(categories.map(c => c.accountId));
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

export default function AccountsScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

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
    
    const supabase = createClient();
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", account.id)
        .order("date", { ascending: false })
        .limit(20);

      if (!transactionsError && transactionsData) {
        setAccountTransactions(transactionsData);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAccount(null);
    setAccountTransactions([]);
  };

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const dailyChangeAmount = totalBalance * 0.00083; // Mock 0.083% daily gain
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
            <Text className="text-2xl font-bold text-gray-900">Accounts</Text>
            <Text className="text-gray-600 mt-1">Wealth allocation overview</Text>
          </View>
        </FadeIn>

        {/* Profile & Total Value Section */}
        <View className="flex-row gap-4 mb-6">
          {/* User Profile Card */}
          <FadeIn delay={200}>
            <AnimatedCard className="p-4 flex-1">
              <View className="flex-row items-center gap-3">
                <View className="relative">
                  <View className="h-16 w-16 bg-primary-100 rounded-full items-center justify-center">
                    <Ionicons name="person" size={32} color="#334e68" />
                  </View>
                  <View className="absolute bottom-0 right-0 h-5 w-5 bg-green-600 rounded-full items-center justify-center border-2 border-white">
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text className="text-xs text-gray-600 mt-0.5">
                    {profile?.role || 'Client'}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Verified</Text>
                </View>
              </View>
            </AnimatedCard>
          </FadeIn>

          {/* Total Value Card */}
          <FadeIn delay={250}>
            <AnimatedCard className="p-4 flex-1">
              <View className="items-end">
                <Text className="text-xs text-gray-600 mb-1">Total Value</Text>
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(totalBalance, "USD")}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="arrow-up" size={14} color="#16a34a" />
                  <Text className="text-sm font-semibold text-green-600">
                    +{formatCurrency(dailyChangeAmount, "USD")}
                  </Text>
                  <Text className="text-sm font-semibold text-green-600">
                    +{dailyChangePercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </AnimatedCard>
          </FadeIn>
        </View>

        {/* Wealth Allocation Categories */}
        {allocationCategories.length === 0 ? (
          <FadeIn delay={300}>
            <AnimatedCard className="p-12">
              <View className="items-center">
                <View className="h-16 w-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="wallet" size={32} color="#9ca3af" />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">No accounts found</Text>
                <Text className="text-gray-500 text-center">
                  Accounts will appear here once created
                </Text>
              </View>
            </AnimatedCard>
          </FadeIn>
        ) : (
          <View className="gap-4">
            {allocationCategories.map((category, index) => {
              const dailyGainPercent = category.value > 0 
                ? (category.dailyGain / category.value) * 100 
                : 0;
              
              // Format description - split by comma and bullet points
              const descriptionParts = category.description
                .split(/[,•+]/)
                .map(part => part.trim())
                .filter(part => part.length > 0);
              
              return (
                <FadeIn key={category.id} delay={300 + index * 100}>
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
                    <AnimatedCard className="p-4">
                      <View className="flex-row items-start gap-3">
                        {/* Icon */}
                        <View className="bg-green-700 p-2.5 rounded-lg">
                          <Ionicons name={category.icon as any} size={20} color="white" />
                        </View>
                        
                        {/* Main Content */}
                        <View className="flex-1 min-w-0">
                          {/* Title row with value */}
                          <View className="flex-row items-center justify-between mb-1">
                            <View className="flex-row items-center gap-2 flex-1">
                              <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                                {category.name}
                              </Text>
                              <Text className="text-xs font-medium text-gray-500">
                                ({category.percentage.toFixed(0)}%)
                              </Text>
                            </View>
                            <View className="flex-row items-center gap-1 ml-2">
                              <Text className="text-sm font-bold text-gray-900">
                                {formatCurrency(category.value, "USD")}
                              </Text>
                              {category.accountId && (
                                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                              )}
                            </View>
                          </View>
                          
                          {/* Description */}
                          <View className="flex-row items-center gap-1.5 mb-2 flex-wrap">
                            {descriptionParts.slice(0, 3).map((part, idx) => (
                              <View key={idx} className="flex-row items-center gap-1">
                                {idx > 0 && (
                                  <Ionicons name="add" size={12} color="#10b981" />
                                )}
                                <Text className="text-xs text-gray-600" numberOfLines={1}>
                                  {part}
                                </Text>
                              </View>
                            ))}
                            {descriptionParts.length > 3 && (
                              <Text className="text-xs text-gray-500">+{descriptionParts.length - 3} more</Text>
                            )}
                          </View>
                          
                          {/* Daily gain badge */}
                          <View className="flex-row justify-end">
                            <View className="flex-row items-center gap-1 px-2 py-1 bg-green-50 rounded-md">
                              <Ionicons name="arrow-up" size={12} color="#16a34a" />
                              <Text className="text-xs font-semibold text-green-600">
                                +{formatCurrency(category.dailyGain, "USD")}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </AnimatedCard>
                  </TouchableOpacity>
                </FadeIn>
              );
            })}
          </View>
        )}

        {/* All Accounts List (Alternative View) */}
        {accounts.length > 0 && (
          <FadeIn delay={400}>
            <View className="mt-6 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-900">All Accounts</Text>
                <Text className="text-sm text-gray-500">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</Text>
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
                    savings: 'bg-accent-600',
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
                      <AnimatedCard delay={500 + index * 50}>
                        <View className="p-4">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3 flex-1">
                              <View className={`h-12 w-12 ${color} rounded-lg items-center justify-center`}>
                                <Ionicons name={icon as any} size={24} color="white" />
                              </View>
                              <View className="flex-1 min-w-0">
                                <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                                  {account.name}
                                </Text>
                                <Text className="text-sm text-gray-500 capitalize mt-0.5">
                                  {account.type}
                                </Text>
                                {account.account_number && (
                                  <Text className="text-xs text-gray-400 mt-0.5">
                                    ****{account.account_number.toString().slice(-4)}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <View className="items-end ml-3">
                              <Text className="text-lg font-bold text-gray-900">
                                {formatCurrency(Number(account.balance || 0), account.currency || "USD")}
                              </Text>
                              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </View>
                          </View>
                          {account.iban && (
                            <View className="mt-3 pt-3 border-t border-gray-100">
                              <Text className="text-xs text-gray-500">IBAN: {account.iban}</Text>
                            </View>
                          )}
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

      {/* Account Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-gray-50">
          {/* Modal Header */}
          <View className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              {selectedAccount?.name || "Account Details"}
            </Text>
            <Pressable onPress={closeModal} className="p-2">
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          <ScrollView className="flex-1">
            {selectedAccount && (
              <View className="px-4 py-6">
                {/* Account Overview */}
                <AnimatedCard className="p-6 mb-6">
                  <View className="items-center mb-6">
                    {(() => {
                      const iconMap: Record<string, string> = {
                        checking: 'wallet',
                        savings: 'business',
                        investment: 'trending-up',
                        credit: 'card',
                      };
                      const colorMap: Record<string, string> = {
                        checking: 'bg-primary-600',
                        savings: 'bg-accent-600',
                        investment: 'bg-green-600',
                        credit: 'bg-orange-600',
                      };
                      const icon = iconMap[selectedAccount.type] || 'wallet';
                      const color = colorMap[selectedAccount.type] || 'bg-gray-600';
                      
                      return (
                        <View className={`h-20 w-20 ${color} rounded-full items-center justify-center mb-4`}>
                          <Ionicons name={icon as any} size={40} color="white" />
                        </View>
                      );
                    })()}
                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(Number(selectedAccount.balance || 0), selectedAccount.currency || "USD")}
                    </Text>
                    <Text className="text-sm text-gray-600">Current Balance</Text>
                  </View>

                  <View className="gap-4 border-t border-gray-100 pt-4">
                    {selectedAccount.account_number && (
                      <View>
                        <Text className="text-sm text-gray-600 mb-1">Account Number</Text>
                        <Text className="text-lg font-mono text-gray-900">
                          ****{selectedAccount.account_number.toString().slice(-4)}
                        </Text>
                      </View>
                    )}
                    {selectedAccount.iban && (
                      <View>
                        <Text className="text-sm text-gray-600 mb-1">IBAN</Text>
                        <Text className="text-base font-mono text-gray-900 break-all">
                          {selectedAccount.iban}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text className="text-sm text-gray-600 mb-1">Account Type</Text>
                      <Text className="text-base font-semibold text-gray-900 capitalize">
                        {selectedAccount.type}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm text-gray-600 mb-1">Currency</Text>
                      <Text className="text-base font-semibold text-gray-900">
                        {selectedAccount.currency || "USD"}
                      </Text>
                    </View>
                  </View>
                </AnimatedCard>

                {/* Recent Transactions */}
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
                    <AnimatedCard className="p-4">
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
                                  <View className={`h-10 w-10 rounded-full items-center justify-center ${
                                    isCredit ? "bg-green-100" : "bg-red-100"
                                  }`}>
                                    <Ionicons
                                      name={isCredit ? "arrow-down" : "arrow-up"}
                                      size={20}
                                      color={isCredit ? "#16a34a" : "#dc2626"}
                                    />
                                  </View>
                                  <View className="flex-1 min-w-0">
                                    <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                                      {transaction.description || "Transaction"}
                                    </Text>
                                    <Text className="text-xs text-gray-500 mt-0.5">
                                      {formatDate(transaction.date)}
                                    </Text>
                                  </View>
                                </View>
                                <View className="items-end ml-3">
                                  <Text className={`text-sm font-semibold ${
                                    isCredit ? "text-green-600" : "text-red-600"
                                  }`}>
                                    {isCredit ? "+" : "-"}{formatCurrency(Math.abs(amount), transaction.currency || selectedAccount.currency || "USD")}
                                  </Text>
                                  <Text className="text-xs text-gray-500 capitalize mt-0.5">
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
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}
