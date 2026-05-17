import { View, Text } from "react-native";

export default function Section({ title, children }) {
  return (
    <View className="mb-6">
      {title && (
        <Text className="text-dark font-semibold mb-3">
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}