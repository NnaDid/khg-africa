import { View } from "react-native";

export default function Screen({ children, className = "" }) {
  return (
    <View className={`flex-1 bg-white ${className}`}>
      {children}
    </View>
  );
} 