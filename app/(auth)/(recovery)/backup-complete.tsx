"use client"

import { VerificationTwoIcon } from "@/components/Icons/verification-two"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const STORAGE_KEY_WALLET = "hasWallet"

export default function BackupComplete() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      await AsyncStorage.setItem(STORAGE_KEY_WALLET, "true")
      router.replace("/home")
    } catch (error) {
      console.error("[DEV] Error saving wallet status:", error)
      Alert.alert("Error", "Failed to save wallet status. Continue anyway?", [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setIsLoading(false),
        },
        {
          text: "Continue",
          onPress: () => router.replace("/home"),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, router])

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Backup Complete</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contentWrapper}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <VerificationTwoIcon />
        </View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Your Backup Is Complete</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            You should now have your recovery phrase and password written down for future reference.
          </Text>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={handleContinue}
        disabled={isLoading}
        activeOpacity={0.7}
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        <LinearGradient
          colors={["#84C718", "#09791A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.continueButton}
        >
          <Text style={[styles.continueButtonText, { color: "#FFFFFF" }]}>{isLoading ? "LOADING..." : "CONTINUE"}</Text>
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
    marginBottom: 20,
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
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  messageContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
