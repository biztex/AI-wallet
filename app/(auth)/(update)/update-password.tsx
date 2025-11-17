"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { getPinAPI } from "@/utils/pin-api"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const MIN_PIN_LENGTH = 4

const validatePIN = (pin: string): { isValid: boolean; message?: string } => {
  if (!pin) {
    return { isValid: false, message: "PIN is required" }
  }
  if (pin.length < MIN_PIN_LENGTH) {
    return { isValid: false, message: `PIN must be at least ${MIN_PIN_LENGTH} digits` }
  }
  if (!/^\d+$/.test(pin)) {
    return { isValid: false, message: "PIN must contain only numbers" }
  }
  return { isValid: true }
}

export default function UpdatePasswordScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleBack = useCallback(() => {
    router.push("/account")
  }, [])

  const handleSave = useCallback(async () => {
    if (isLoading) return

    if (!newPin) {
      Alert.alert("Error", "Please enter a new PIN")
      return
    }

    const newPinValidation = validatePIN(newPin)
    if (!newPinValidation.isValid) {
      Alert.alert("Error", newPinValidation.message)
      return
    }

    if (newPin !== confirmPin) {
      Alert.alert("Error", "New PINs do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await getPinAPI().updateWalletPIN(newPin, confirmPin)

      Alert.alert("Success", response.message || "Wallet PIN updated successfully", [
        {
          text: "OK",
          onPress: () => router.push("/account"),
        },
      ])
    } catch (error) {
      console.error("[DEV] PIN update error:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update PIN. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [newPin, confirmPin, isLoading, router])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Update PIN</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <Text style={[styles.pageTitle, { color: colors.text }]}>Update Wallet PIN</Text>

        {/* Context Info */}
        <Text style={[styles.contextInfo, { color: colors.textSecondary }]}>
          This will update your wallet PIN (used to access your wallets and perform transactions).
        </Text>

        {/* New PIN */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>New PIN</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={newPin}
            onChangeText={setNewPin}
            secureTextEntry
            placeholder="Enter new PIN"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            editable={!isLoading}
            maxLength={6}
          />
        </View>

        {/* Confirm PIN */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Confirm PIN</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={confirmPin}
            onChangeText={setConfirmPin}
            secureTextEntry
            placeholder="Confirm new PIN"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            editable={!isLoading}
            maxLength={6}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.7}
          style={{ opacity: isLoading ? 0.6 : 1 }}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>{isLoading ? "SAVING..." : "SAVE"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  contextInfo: {
    fontSize: 14,
    marginBottom: 24,
    fontStyle: "italic",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
})
