import { View, Text } from "react-native";

export default function AccountsScreen() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <Text className="text-xl font-semibold text-gray-900 mb-2">Accounts</Text>
      <Text className="text-gray-500">No accounts found</Text>
    </View>
  );
}

