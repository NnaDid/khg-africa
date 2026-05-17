import { View, ActivityIndicator } from "react-native";

export default function Loader() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#1BBC9B" />
    </View>
  );
}