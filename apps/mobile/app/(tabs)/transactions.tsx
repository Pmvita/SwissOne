import { View, Text } from "react-native";

export default function TransactionsScreen() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <Text className="text-xl font-semibold text-gray-900 mb-2">
        Transactions
      </Text>
      <Text className="text-gray-500">No transactions found</Text>
    </View>
  );
}

