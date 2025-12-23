import { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { createClient } from "@/lib/supabase/client";
import { AnimatedButton, FadeIn, SlideIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/(tabs)/dashboard");
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <FadeIn delay={100}>
        <SlideIn direction="down">
          <View className="mb-12 items-center">
            <FadeIn delay={50}>
              <Logo size="md" style={{ marginBottom: 24 }} />
            </FadeIn>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Sign in to SwissOne
            </Text>
            <Text className="text-gray-600">Welcome back</Text>
          </View>
        </SlideIn>
      </FadeIn>

      <View className="space-y-4 mb-6">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Password
          </Text>
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>
      </View>

      <SlideIn direction="up" delay={300}>
        <AnimatedButton
          variant="primary"
          size="lg"
          className="w-full mb-4"
          onPress={handleLogin}
          disabled={loading}
          loading={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </AnimatedButton>
      </SlideIn>

      <FadeIn delay={400}>
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <AnimatedButton
            variant="outline"
            size="sm"
            onPress={() => router.push("/(auth)/signup")}
          >
            Sign up
          </AnimatedButton>
        </View>
      </FadeIn>
    </View>
  );
}

