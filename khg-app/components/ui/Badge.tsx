import { View, Text } from "react-native";

export default function Badge({ text, variant = "primary" }) {
  const styles = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    dark: "bg-dark",
  };

  return (
    <View className={`${styles[variant]} px-3 py-1 rounded-full`}>
      <Text className="text-white text-xs font-semibold">
        {text}
      </Text>
    </View>
  );
}