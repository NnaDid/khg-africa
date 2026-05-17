import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Input from "../../components/ui/Input";
import { SafeArea } from "../../components/ui/layout/SafeArea";

interface FormState {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export default function Register() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  const [formData, setFormData] = useState<FormState>({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let label = "Weak";
    let color = "#EF4444";

    if (score >= 5) {
      label = "Very Strong";
      color = "#10B981";
    } else if (score >= 4) {
      label = "Strong";
      color = "#3B82F6";
    } else if (score >= 3) {
      label = "Good";
      color = "#F59E0B";
    } else if (score >= 2) {
      label = "Fair";
      color = "#F97316";
    }

    return { score, label, color, requirements };
  };

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(formData.password),
    [formData.password],
  );

  const isPasswordValid = formData.password.length >= 8;
  const isConfirmPasswordValid =
    formData.password === formData.confirmPassword && isPasswordValid;
  const isFormValid =
    formData.fullName &&
    formData.phoneNumber &&
    formData.email &&
    isConfirmPasswordValid;

  const handleRegister = () => {
    if (isFormValid) {
      router.push("/(auth)/verify");
    }
  };

  return (
    <SafeArea>
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Teal Gradient */}
        <LinearGradient
          colors={["#1BBC9B", "#0d9375"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 py-8 pb-6"
        >
          <Text className="text-white text-3xl font-bold">Create Account</Text>
          <Text className="text-white/80 text-sm mt-2">
            Join us today and manage your finances
          </Text>
        </LinearGradient>

        {/* Form Section */}
        <View className="px-6 py-6">
          {/* Full Name */}
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
            iconName="person"
            isFocused={focusedField === "fullName"}
            onFocus={() => setFocusedField("fullName")}
            onBlur={() => setFocusedField(null)}
          />

          {/* Phone Number */}
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChangeText={(text) =>
              setFormData({ ...formData, phoneNumber: text })
            }
            iconName="call"
            keyboardType="phone-pad"
            isFocused={focusedField === "phoneNumber"}
            onFocus={() => setFocusedField("phoneNumber")}
            onBlur={() => setFocusedField(null)}
          />

          {/* Email */}
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            iconName="mail"
            keyboardType="email-address"
            isFocused={focusedField === "email"}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />

          {/* Password */}
          <Input
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
            iconName="lock-closed"
            secureTextEntry={true}
            showPasswordToggle={true}
            isFocused={focusedField === "password"}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <View className="mb-5 bg-gray-50 rounded-lg p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs font-semibold text-gray-700">
                  Password Strength
                </Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: passwordStrength.color + "20",
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </Text>
                </View>
              </View>

              {/* Strength Bar */}
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <View
                  className="h-2 rounded-full"
                  style={{ width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color,
                  }}
                />
              </View>

              {/* Requirements Checklist */}
              <View className="gap-2">
                {[
                  {
                    key: "minLength",
                    label: "At least 8 characters",
                  },
                  {
                    key: "hasUpperCase",
                    label: "One uppercase letter",
                  },
                  {
                    key: "hasLowerCase",
                    label: "One lowercase letter",
                  },
                  {
                    key: "hasNumber",
                    label: "One number",
                  },
                  {
                    key: "hasSpecial",
                    label: "One special character",
                  },
                ].map((req) => {
                  const isMet =
                    passwordStrength.requirements[
                      req.key as keyof typeof passwordStrength.requirements
                    ];
                  return (
                    <View key={req.key} className="flex-row items-center gap-2">
                      <View
                        className="w-4 h-4 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: isMet ? "#10B98120" : "#D1D5DB20",
                        }}
                      >
                        <Ionicons
                          name={isMet ? "checkmark" : "remove"}
                          size={12}
                          color={isMet ? "#10B981" : "#D1D5DB"}
                        />
                      </View>
                      <Text
                        className={`text-xs ${
                          isMet ? "text-gray-700 font-medium" : "text-gray-500"
                        }`}
                      >
                        {req.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
            iconName="lock-closed"
            secureTextEntry={true}
            showPasswordToggle={true}
            isFocused={focusedField === "confirmPassword"}
            onFocus={() => setFocusedField("confirmPassword")}
            onBlur={() => setFocusedField(null)}
          />

          {/* Password Match Status */}
          {formData.confirmPassword && (
            <View className="mb-5 flex-row items-center gap-2">
              <View
                className="w-5 h-5 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isConfirmPasswordValid
                    ? "#10B98120"
                    : "#EF444420",
                }}
              >
                <Ionicons
                  name={isConfirmPasswordValid ? "checkmark" : "close"}
                  size={14}
                  color={isConfirmPasswordValid ? "#10B981" : "#EF4444"}
                />
              </View>
              <Text
                className={`text-sm ${
                  isConfirmPasswordValid
                    ? "text-green-600 font-medium"
                    : "text-red-500 font-medium"
                }`}
              >
                {isConfirmPasswordValid
                  ? "Passwords match"
                  : "Passwords do not match"}
              </Text>
            </View>
          )}

          {/* Terms & Conditions */}
          <View className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <View className="flex-row items-start gap-3">
              <Ionicons
                name="information-circle"
                size={18}
                color="#F59E0B"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Text className="text-xs text-gray-700 flex-1">
                By creating an account, you agree to our{" "}
                <Text className="font-semibold text-primary">
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text className="font-semibold text-primary">
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>

          {/* Register Button with Yellow Accent */}
          <View className="mb-4">
            <LinearGradient
              colors={["#F7DD6F", "#F5C842"]}
              className="rounded-lg overflow-hidden"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Pressable
                onPress={handleRegister}
                disabled={!isFormValid}
                className={`py-4 items-center ${!isFormValid && "opacity-50"}`}
              >
                <Text className="text-dark font-bold text-base">
                  Create Account
                </Text>
              </Pressable>
            </LinearGradient>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center items-center gap-2">
            <Text className="text-gray-600 text-sm">
              Already have an account?
            </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text className="text-primary font-bold text-sm">Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeArea>
  );
}
