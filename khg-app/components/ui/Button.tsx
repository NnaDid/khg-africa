import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

interface ZoeButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "dark";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function ZoeButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}: ZoeButtonProps) {
  const base = "py-4 rounded-xl items-center justify-center";
  const variants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "border border-primary",
    dark: "bg-dark",
  } as const;

  const textVariants = {
    primary: "text-white",
    secondary: "text-dark",
    outline: "text-primary",
    dark: "text-white",
  } as const;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className} ${disabled ? "opacity-50" : "active:opacity-80"}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`${textVariants[variant]} font-semibold`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
