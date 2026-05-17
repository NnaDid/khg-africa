import { View, Text } from "react-native";

export default function Header({ title, subtitle }) {
  return (
    <View className="px-5 pt-6 pb-4">
      <Text className="text-primary text-2xl font-bold">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-dark mt-1 text-sm">
          {subtitle}
        </Text>
      )}
    </View>
  );
}