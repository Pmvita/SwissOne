import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { createClient } from "@/lib/supabase/client";
import { AnimatedCard, FadeIn } from "@/components/ui/animated";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  category?: string;
  reference?: string;
  accounts?: {
    name: string;
    type: string;
  };
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "credit" | "debit" | "transfer">("all");

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();
    
    try {
      // Get user
      const { data: { user: userData } } = await supabase.auth.getUser();
      setUser(userData);

      if (userData) {
        // Build query
        let query = supabase
          .from("transactions")
          .select("*, accounts(name, type)")
          .eq("user_id", userData.id)
          .order("date", { ascending: false });

        // Apply filter
        if (filter !== "all") {
          query = query.eq("type", filter);
        }

        const { data: transactionsData, error: transactionsError } = await query.limit(100);

        if (!transactionsError && transactionsData) {
          setTransactions(transactionsData);
        }
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
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
  const totalCredits = transactions
    .filter(t => t.type === "credit" || t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const totalDebits = transactions
    .filter(t => t.type === "debit" || t.type === "withdrawal")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  
  const netAmount = totalCredits - totalDebits;

  // Get currency (use CHF as default for Swiss banking, or first transaction currency)
  const defaultCurrency = transactions.length > 0 
    ? transactions[0].currency || "CHF"
    : "CHF";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#334e68" />
        <Text className="text-gray-500 mt-4">Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{ backgroundColor: '#1e3a8a', paddingTop: insets.top + 8 }} className="pb-4 px-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-white text-2xl font-bold">Transactions</Text>
            <Text className="text-white/80 text-sm mt-1">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View className="flex-row gap-2 mt-2">
          <View className="flex-1 bg-white/20 rounded-lg p-3">
            <Text className="text-white/80 text-xs mb-1">Total Credits</Text>
            <Text className="text-white text-base font-bold">
              {formatCurrency(totalCredits, defaultCurrency)}
            </Text>
          </View>
          <View className="flex-1 bg-white/20 rounded-lg p-3">
            <Text className="text-white/80 text-xs mb-1">Total Debits</Text>
            <Text className="text-white text-base font-bold">
              {formatCurrency(totalDebits, defaultCurrency)}
            </Text>
          </View>
          <View className="flex-1 bg-white/20 rounded-lg p-3">
            <Text className="text-white/80 text-xs mb-1">Net</Text>
            <Text className={`text-white text-base font-bold ${
              netAmount >= 0 ? "text-green-200" : "text-red-200"
            }`}>
              {formatCurrency(netAmount, defaultCurrency)}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white border-b border-gray-200 px-4 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {[
            { key: "all", label: "All", icon: "list" },
            { key: "credit", label: "Credits", icon: "arrow-down" },
            { key: "debit", label: "Debits", icon: "arrow-up" },
            { key: "transfer", label: "Transfers", icon: "swap-horizontal" },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              onPress={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                filter === filterOption.key
                  ? "bg-primary-600"
                  : "bg-gray-100"
              }`}
            >
              <Ionicons
                name={filterOption.icon as any}
                size={16}
                color={filter === filterOption.key ? "white" : "#6b7280"}
              />
              <Text
                className={`text-sm font-medium ${
                  filter === filterOption.key ? "text-white" : "text-gray-700"
                }`}
              >
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 py-4">
          {transactions.length === 0 ? (
            <FadeIn delay={100}>
              <AnimatedCard className="p-12">
                <View className="items-center">
                  <View className="h-20 w-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="list" size={40} color="#9ca3af" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900 mb-2">
                    No transactions found
                  </Text>
                  <Text className="text-gray-500 text-center">
                    {filter !== "all" 
                      ? `No ${filter} transactions available`
                      : "Transactions will appear here once available"
                    }
                  </Text>
                </View>
              </AnimatedCard>
            </FadeIn>
          ) : (
            <View className="gap-3">
              {transactions.map((transaction, index) => {
                const isCredit = transaction.type === "credit" || transaction.type === "deposit";
                const amount = Number(transaction.amount || 0);
                const transactionCurrency = transaction.currency || defaultCurrency;
                
                return (
                  <FadeIn key={transaction.id} delay={100 + index * 20}>
                    <AnimatedCard className="p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3 flex-1">
                          <View className={`h-12 w-12 rounded-full items-center justify-center ${
                            isCredit ? "bg-green-100" : transaction.type === "transfer" ? "bg-blue-100" : "bg-red-100"
                          }`}>
                            <Ionicons
                              name={
                                isCredit 
                                  ? "arrow-down" 
                                  : transaction.type === "transfer"
                                  ? "swap-horizontal"
                                  : "arrow-up"
                              }
                              size={20}
                              color={
                                isCredit 
                                  ? "#16a34a" 
                                  : transaction.type === "transfer"
                                  ? "#3b82f6"
                                  : "#dc2626"
                              }
                            />
                          </View>
                          <View className="flex-1 min-w-0">
                            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                              {transaction.description || "Transaction"}
                            </Text>
                            <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                              <Text className="text-sm text-gray-500">
                                {transaction.accounts?.name || "Account"}
                              </Text>
                              <Text className="text-sm text-gray-300">•</Text>
                              <Text className="text-sm text-gray-500">
                                {formatDate(transaction.date)}
                              </Text>
                              {transaction.category && (
                                <>
                                  <Text className="text-sm text-gray-300">•</Text>
                                  <Text className="text-sm text-gray-500 capitalize">
                                    {transaction.category}
                                  </Text>
                                </>
                              )}
                            </View>
                            {transaction.reference && (
                              <Text className="text-xs text-gray-400 mt-1 font-mono">
                                Ref: {transaction.reference}
                              </Text>
                            )}
                            <View className="mt-1">
                              <View className="bg-gray-100 px-2 py-1 rounded self-start">
                                <Text className="text-xs font-medium text-gray-600 capitalize">
                                  {transaction.type}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                        <View className="items-end ml-3">
                          <Text className={`text-lg font-bold ${
                            isCredit 
                              ? "text-green-600" 
                              : transaction.type === "transfer"
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}>
                            {isCredit ? "+" : transaction.type === "transfer" ? "" : "-"}
                            {formatCurrency(Math.abs(amount), transactionCurrency)}
                          </Text>
                          <Text className="text-xs text-gray-500 mt-1">
                            {transactionCurrency}
                          </Text>
                        </View>
                      </View>
                    </AnimatedCard>
                  </FadeIn>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
