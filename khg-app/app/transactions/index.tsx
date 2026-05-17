import React from "react";
import { View, Text, FlatList } from "react-native";

const data: ArrayLike<any> | null | undefined = [];

export default function TransactionsScreen() {
  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <Text className="text-2xl font-bold">Transactions</Text>

      <FlatList
        data={data}
        keyExtractor={(_, i) => i.toString()}
        ListEmptyComponent={
          <Text className="text-gray-400 mt-10 text-center">
            No transactions yet
          </Text>
        }
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200">
            <Text>Transaction</Text>
          </View>
        )}
      />
    </View>
  );
}
