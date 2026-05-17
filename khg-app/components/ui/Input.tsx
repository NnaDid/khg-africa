import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  iconName?: string;
  keyboardType?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  showPasswordToggle?: boolean;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  iconName,
  keyboardType = "default",
  onFocus,
  onBlur,
  isFocused = false,
  showPasswordToggle = false,
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className="mb-2">
      {label && (
        <Text className="text-sm font-semibold text-dark mb-2">{label}</Text>
      )}
      <View
        className={`flex-row items-center border rounded-lg px-4 py-1 ${
          isFocused ? "border-primary bg-white" : "border-gray-200 bg-gray-50"
        }`}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={14}
            color={isFocused ? "#1BBC9B" : "#9CA3AF"}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#D1D5DB"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`flex-1 text-dark text-base ${iconName ? "ml-3" : ""}`}
        />
        {showPasswordToggle && (
          <Pressable onPress={togglePasswordVisibility} className="p-1">
            <Ionicons
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={18}
              color="#9CA3AF"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
