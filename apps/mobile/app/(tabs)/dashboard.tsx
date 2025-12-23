import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { createClient } from "@/lib/supabase/client";
import { AnimatedButton, AnimatedCard, FadeIn, SlideIn } from "@/components/ui/animated";

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <FadeIn delay={100}>
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
            <Text className="text-gray-600 mt-1">Welcome back</Text>
            {user?.email && (
              <Text className="text-sm text-gray-500 mt-1">{user.email}</Text>
            )}
          </View>
        </FadeIn>

        <View className="flex-row flex-wrap gap-4 mb-6">
          <AnimatedCard delay={200} className="p-4 flex-1 min-w-[150px]">
            <Text className="text-sm text-gray-500 mb-1">Total Balance</Text>
            <Text className="text-2xl font-bold text-gray-900">CHF 0.00</Text>
          </AnimatedCard>

          <AnimatedCard delay={300} className="p-4 flex-1 min-w-[150px]">
            <Text className="text-sm text-gray-500 mb-1">Portfolio Value</Text>
            <Text className="text-2xl font-bold text-gray-900">CHF 0.00</Text>
          </AnimatedCard>
        </View>

        <AnimatedCard delay={400} className="p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </Text>
          <View className="space-y-3">
            <AnimatedButton
              variant="outline"
              className="w-full"
              onPress={() => router.push("/(tabs)/accounts")}
            >
              View Accounts
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              className="w-full"
              onPress={() => router.push("/(tabs)/transactions")}
            >
              View Transactions
            </AnimatedButton>
          </View>
        </AnimatedCard>

        <SlideIn direction="up" delay={500}>
          <AnimatedButton
            variant="primary"
            className="bg-red-500 w-full"
            onPress={handleSignOut}
          >
            Sign Out
          </AnimatedButton>
        </SlideIn>
      </View>
    </ScrollView>
  );
}

