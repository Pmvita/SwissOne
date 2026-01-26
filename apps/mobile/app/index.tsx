import { useEffect } from "react";
import { router } from "expo-router";
import { createClient } from "@/lib/supabase/client";
import { View, ActivityIndicator } from "react-native";
import { Logo } from "@/components/ui/Logo";

export default function Index() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.replace("/(tabs)/dashboard");
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-primary-900">
      <Logo size="lg" style={{ marginBottom: 32 }} />
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}

