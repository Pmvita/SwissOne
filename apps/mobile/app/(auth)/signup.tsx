import { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { createClient } from "@/lib/supabase/client";
import { AnimatedButton, FadeIn, SlideIn } from "@/components/ui/animated";
import { Logo } from "@/components/ui/Logo";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
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
              Create your account
            </Text>
            <Text className="text-gray-600">Join SwissOne today</Text>
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

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </Text>
          <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>
      </View>

      <SlideIn direction="up" delay={400}>
        <AnimatedButton
          variant="primary"
          size="lg"
          className="w-full mb-4"
          onPress={handleSignUp}
          disabled={loading}
          loading={loading}
        >
          {loading ? "Creating account..." : "Sign up"}
        </AnimatedButton>
      </SlideIn>

      <FadeIn delay={500}>
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <AnimatedButton
            variant="outline"
            size="sm"
            onPress={() => router.push("/(auth)/login")}
          >
            Sign in
          </AnimatedButton>
        </View>
      </FadeIn>
    </View>
  );
}

