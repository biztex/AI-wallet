"use client"

import { DeleteIcon } from "@/components/Icons/delete"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export default function SetupSecurity() {
  const router = useRouter()
  const { source } = useLocalSearchParams<{ source?: "import" | "create" }>()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [step, setStep] = useState<"create" | "confirm">("create")

  const handlePinInput = (value: string) => {
    if (value.length <= 6) {
      if (step === "create") {
        setPin(value)
      } else {
        setConfirmPin(value)
      }
    }
  }

  const handleContinue = async () => {
    if (step === "create") {
      if (pin.length !== 6) {
        Alert.alert("Error", "PIN must be 6 digits")
        return
      }
      setStep("confirm")
    } else {
      if (pin !== confirmPin) {
        Alert.alert("Error", "PINs do not match. Please try again.", [
          {
            text: "OK",
            onPress: () => {
              setConfirmPin("")
              setStep("create")
              setPin("")
            },
          },
        ])
        return
      }

      try {
        // Save PIN to wallet
        await AsyncStorage.setItem("wallet_pin", pin)

        console.log("[DEV] PIN saved successfully, wallet source:", source || "unknown")

        if (source === "import") {
          Alert.alert("Success!", "Your wallet is now secured with a PIN", [
            {
              text: "Continue",
              onPress: () => router.replace("/(app)/home"),
            },
          ])
        } else {
          Alert.alert("Success!", "Your wallet is now secured with a PIN", [
            {
              text: "Continue",
              onPress: () => router.push(`/(wallet)/wallet-address?source=${source || "unknown"}`),
            },
          ])
        }
      } catch (error) {
        Alert.alert("Error", "Failed to save PIN. Please try again.")
      }
    }
  }

  const renderPinDots = (currentPin: string) => {
    return (
      <View style={styles.pinDotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              { borderColor: colors.border },
              index < currentPin.length && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          />
        ))}
      </View>
    )
  }

  const keypadLayout = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "backspace"],
  ]

  const handleKeyPress = (key: string) => {
    const currentPin = step === "create" ? pin : confirmPin

    if (key === "backspace") {
      handlePinInput(currentPin.slice(0, -1))
    } else if (key === "*") {
      // Star button doesn't do anything for now
      return
    } else {
      handlePinInput(currentPin + key)
    }
  }

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.headerContainer}>
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
        <View style={styles.iconContainer}>
          <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2C9.243 2 7 4.243 7 7V10H6C4.346 10 3 11.346 3 13V20C3 21.654 4.346 23 6 23H18C19.654 23 21 21.654 21 20V13C21 11.346 19.654 10 18 10H17V7C17 4.243 14.757 2 12 2ZM9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V10H9V7Z"
              fill={colors.primary}
            />
          </Svg>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{step === "create" ? "Create PIN" : "Confirm PIN"}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {step === "create" ? "Create a 6-digit PIN to secure your wallet" : "Re-enter your PIN to confirm"}
        </Text>

        {/* PIN Dots Display */}
        {renderPinDots(step === "create" ? pin : confirmPin)}

        {/* Removed hidden TextInput to prevent any keyboard from opening */}

        <View style={styles.numberPad}>
          {keypadLayout.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.numberButton]}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.7}
                >
                  {key === "backspace" ? (
                    <DeleteIcon />
                  ) : (
                    <Text style={[styles.numberText, { color: colors.text }]}>{key}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primary },
            (step === "create" ? pin.length !== 6 : confirmPin.length !== 6) && {
              backgroundColor: colors.border,
              opacity: 0.6,
            },
          ]}
          onPress={handleContinue}
          disabled={step === "create" ? pin.length !== 6 : confirmPin.length !== 6}
          activeOpacity={0.7}
        >
          <Text style={[styles.continueButtonText, { color: colors.background }]}>
            {step === "create" ? "Continue" : "Confirm PIN"}
          </Text>
        </TouchableOpacity>

        {/* Warning */}
        <View style={[styles.warningContainer, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.warningText, { color: colors.primary }]}>
            🛡️ Remember your PIN. You'll need it to unlock your wallet.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  pinDotsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  numberPad: {
    width: "100%",
    maxWidth: 300,
    gap: 12,
    marginBottom: 32,
  },
  keypadRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  numberButton: {
    flex: 1,
    aspectRatio: 1.2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 24,
    fontWeight: "600",
  },
  continueButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  warningContainer: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  warningText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
})
