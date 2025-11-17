"use client"

import { DeleteIcon } from "@/components/Icons/delete"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { AuthStorage } from "@/utils/auth-storage"
import { WalletManager } from "@/utils/wallet-manager"
import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export default function UnlockWallet() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const handlePinInput = async (value: string) => {
    if (value.length <= 6) {
      setPin(value)
      setError("")

      if (value.length === 6) {
        const isValid = await WalletManager.verifyPIN(value)
        if (isValid) {
          const loggedIn = await AuthStorage.isLoggedIn()
          if (loggedIn) {
            router.replace("/chat")
          } else {
            router.replace("/(app)/home")
          }
        } else {
          setError("Incorrect PIN. Please try again.")
          setPin("")
        }
      }
    }
  }

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              { borderColor: colors.border },
              index < pin.length && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          />
        ))}
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C9.243 2 7 4.243 7 7V10H6C4.346 10 3 11.346 3 13V20C3 21.654 4.346 23 6 23H18C19.654 23 21 21.654 21 20V13C21 11.346 19.654 10 18 10H17V7C17 4.243 14.757 2 12 2ZM9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V10H9V7Z"
            fill={colors.primary}
          />
        </Svg>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter your PIN to unlock your wallet</Text>
      </View>

      {/* PIN Dots Display */}
      {renderPinDots()}

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Hidden PIN Input */}
      <TextInput
        style={styles.hiddenInput}
        value={pin}
        onChangeText={handlePinInput}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus={false}
        secureTextEntry
      />

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {[
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
          ["*", "0", "backspace"],
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberPadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.numberButton}
                onPress={() => {
                  if (key === "backspace") {
                    handlePinInput(pin.slice(0, -1))
                  } else if (key === "*") {
                    // Asterisk functionality can be added here
                  } else {
                    handlePinInput(pin + key)
                  }
                }}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  pinDotsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#F44336",
    marginBottom: 16,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  numberPad: {
    width: "100%",
    maxWidth: 300,
  },
  numberPadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  numberButton: {
    width: "30%",
    aspectRatio: 1.2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
  },
  numberText: {
    fontSize: 24,
    fontWeight: "600",
  },
})
