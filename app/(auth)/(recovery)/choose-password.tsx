"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const MIN_PASSWORD_LENGTH = 8
const STORAGE_KEY_PASSWORD = "walletPassword"

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: "Password is required" }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { isValid: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }
  }
  return { isValid: true }
}

export default function ChoosePassword() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const handleContinue = useCallback(async () => {
    if (isLoading) return

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      Alert.alert("Error", passwordValidation.message)
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await AsyncStorage.setItem(STORAGE_KEY_PASSWORD, password)
      router.push("/create-seed")
    } catch (error) {
      console.error("[DEV] Error saving password:", error)
      Alert.alert("Error", "Failed to save password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [password, confirmPassword, isLoading, router])

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton} activeOpacity={0.7}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18L9 12L15 6"
              stroke={colors.text}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Password</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Set your unique password.</Text>



      {/* Password Inputs */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter your password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.text }]}>Enter password again</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Confirm your password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!isLoading}
          autoCapitalize="none"
        />
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Continue Button */}
      <TouchableOpacity onPress={handleContinue} disabled={isLoading} activeOpacity={0.7} style={{ opacity: isLoading ? 0.6 : 1 }}>
        <LinearGradient
          colors={["#84C718", "#09791A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.verifyButton}
        >
          <Text style={[styles.verifyButtonText, { color: colors.background }]}>
            {isLoading ? "SAVING..." : "CONTINUE"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  subtitle: {
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 14,
    textAlign: "center",
  },
  inputContainer: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: -8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  spacer: {
    flex: 1,
  },
  verifyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
