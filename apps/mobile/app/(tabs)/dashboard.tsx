import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { createClient } from "@/lib/supabase/client";
import { AnimatedButton, AnimatedCard, FadeIn, SlideIn } from "@/components/ui/animated";
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
  };
}

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const accountCount = accounts.length;

  // Get account type icon
  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return "wallet";
      case "savings":
        return "business";
      case "investment":
        return "trending-up";
      case "credit":
        return "card";
      default:
        return "wallet";
    }
  };

  // Get account type color
  const getAccountColor = (type: string) => {
    switch (type) {
      case "checking":
        return "bg-primary-500";
      case "savings":
        return "bg-accent-500";
      case "investment":
        return "bg-green-500";
      case "credit":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading...</Text>
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
        {/* Welcome Section */}
        <FadeIn delay={100}>
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900">Banking Dashboard</Text>
            <Text className="text-gray-600 mt-1">Welcome back</Text>
            {user?.email && (
              <Text className="text-sm text-gray-500 mt-1">{user.email}</Text>
            )}
          </View>
        </FadeIn>

        {/* Summary Cards */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <AnimatedCard delay={200} className="p-4 flex-1 min-w-[150px]">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="wallet" size={24} color="#334e68" />
            </View>
            <Text className="text-sm text-gray-500 mb-1">Total Balance</Text>
            <Text className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBalance, "CHF")}
            </Text>
          </AnimatedCard>

          <AnimatedCard delay={300} className="p-4 flex-1 min-w-[150px]">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="business" size={24} color="#0ea5e9" />
            </View>
            <Text className="text-sm text-gray-500 mb-1">Active Accounts</Text>
            <Text className="text-2xl font-bold text-gray-900">{accountCount}</Text>
          </AnimatedCard>
        </View>

        {/* Accounts Section */}
        <FadeIn delay={400}>
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Your Accounts</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/accounts")}>
                <Text className="text-primary-700 font-medium text-sm">View All</Text>
              </TouchableOpacity>
            </View>

            {accounts.length === 0 ? (
              <AnimatedCard delay={500}>
                <View className="p-8 items-center">
                  <View className="h-16 w-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="wallet" size={32} color="#9ca3af" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</Text>
                  <Text className="text-gray-500 text-center mb-6">
                    Get started by creating your first banking account
                  </Text>
                  <AnimatedButton
                    variant="primary"
                    className="w-full"
                    onPress={() => router.push("/(tabs)/accounts")}
                  >
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="add" size={20} color="white" />
                      <Text className="text-white font-semibold">Create Account</Text>
                    </View>
                  </AnimatedButton>
                </View>
              </AnimatedCard>
            ) : (
              <View className="gap-4">
                {accounts.slice(0, 3).map((account, index) => {
                  const iconName = getAccountIcon(account.type);
                  const colorClass = getAccountColor(account.type);
                  return (
                    <AnimatedCard key={account.id} delay={500 + index * 100}>
                      <TouchableOpacity
                        onPress={() => router.push(`/(tabs)/accounts/${account.id}`)}
                        activeOpacity={0.7}
                      >
                        <View className="p-4">
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center gap-3">
                              <View className={`h-12 w-12 ${colorClass} rounded-lg items-center justify-center`}>
                                <Ionicons name={iconName as any} size={24} color="white" />
                              </View>
                              <View>
                                <Text className="text-lg font-semibold text-gray-900">{account.name}</Text>
                                <Text className="text-sm text-gray-500 capitalize">{account.type}</Text>
                              </View>
                            </View>
                            <View className="items-end">
                              <Text className="text-xl font-bold text-gray-900">
                                {formatCurrency(Number(account.balance || 0), account.currency || "CHF")}
                              </Text>
                              {account.account_number && (
                                <Text className="text-xs text-gray-400 mt-1">
                                  ****{account.account_number.slice(-4)}
                                </Text>
                              )}
                            </View>
                          </View>
                          {account.iban && (
                            <View className="pt-3 border-t border-gray-100">
                              <Text className="text-xs text-gray-500">IBAN: {account.iban}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    </AnimatedCard>
                  );
                })}
                {accounts.length > 3 && (
                  <AnimatedCard delay={800}>
                    <TouchableOpacity
                      onPress={() => router.push("/(tabs)/accounts")}
                      className="p-4 items-center"
                    >
                      <Text className="text-primary-700 font-medium">
                        View {accounts.length - 3} more account{accounts.length - 3 !== 1 ? "s" : ""}
                      </Text>
                    </TouchableOpacity>
                  </AnimatedCard>
                )}
              </View>
            )}
          </View>
        </FadeIn>

        {/* Recent Transactions */}
        <FadeIn delay={600}>
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Recent Transactions</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
                <Text className="text-primary-700 font-medium text-sm">View All</Text>
              </TouchableOpacity>
            </View>

            {recentTransactions.length === 0 ? (
              <AnimatedCard delay={700}>
                <View className="p-8 items-center">
                  <View className="h-12 w-12 bg-gray-100 rounded-full items-center justify-center mb-3">
                    <Ionicons name="arrow-up" size={24} color="#9ca3af" />
                  </View>
                  <Text className="text-sm text-gray-500">No transactions yet</Text>
                </View>
              </AnimatedCard>
            ) : (
              <AnimatedCard delay={700}>
                <View className="divide-y divide-gray-100">
                  {recentTransactions.map((transaction) => {
                    const isCredit = transaction.type === "credit";
                    const amount = Number(transaction.amount || 0);
                    return (
                      <View key={transaction.id} className="p-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-3 flex-1">
                            <View className={`h-8 w-8 rounded-full items-center justify-center ${
                              isCredit ? "bg-green-100" : "bg-red-100"
                            }`}>
                              <Ionicons
                                name={isCredit ? "arrow-down" : "arrow-up"}
                                size={16}
                                color={isCredit ? "#16a34a" : "#dc2626"}
                              />
                            </View>
                            <View className="flex-1">
                              <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                                {transaction.description || "Transaction"}
                              </Text>
                              <Text className="text-xs text-gray-500">
                                {transaction.accounts?.name || "Account"}
                              </Text>
                            </View>
                          </View>
                          <View className="items-end">
                            <Text className={`text-sm font-semibold ${
                              isCredit ? "text-green-600" : "text-red-600"
                            }`}>
                              {isCredit ? "+" : "-"}{formatCurrency(Math.abs(amount), transaction.currency || "CHF")}
                            </Text>
                            <Text className="text-xs text-gray-400">
                              {formatDate(transaction.date)}
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

        {/* Quick Actions */}
        <FadeIn delay={800}>
          <AnimatedCard>
            <View className="p-5">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
              <View className="flex-row flex-wrap gap-3">
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/accounts")}
                  className="flex-1 min-w-[45%] p-4 border-2 border-primary-700 rounded-lg items-center gap-2"
                >
                  <Ionicons name="wallet" size={24} color="#334e68" />
                  <Text className="text-primary-700 font-medium">Accounts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/transactions")}
                  className="flex-1 min-w-[45%] p-4 border-2 border-primary-700 rounded-lg items-center gap-2"
                >
                  <Ionicons name="list" size={24} color="#334e68" />
                  <Text className="text-primary-700 font-medium">Transactions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/portfolio")}
                  className="flex-1 min-w-[45%] p-4 border-2 border-primary-700 rounded-lg items-center gap-2"
                >
                  <Ionicons name="trending-up" size={24} color="#334e68" />
                  <Text className="text-primary-700 font-medium">Portfolio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled
                  className="flex-1 min-w-[45%] p-4 border-2 border-gray-300 rounded-lg items-center gap-2 opacity-50"
                >
                  <Ionicons name="card" size={24} color="#9ca3af" />
                  <Text className="text-gray-400 font-medium">Transfer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedCard>
        </FadeIn>

        {/* Sign Out */}
        <SlideIn direction="up" delay={900}>
          <View className="mt-6">
            <AnimatedButton
              variant="primary"
              className="bg-red-500 w-full"
              onPress={handleSignOut}
            >
              <Text className="text-white font-semibold">Sign Out</Text>
            </AnimatedButton>
          </View>
        </SlideIn>
      </View>
    </ScrollView>
  );
}
