"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

import x from "@/assets/x.png"

export default function HomeScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkWalletStatus = async () => {
      try {
        const hasWallet = await AsyncStorage.getItem("hasWallet")
        const walletCreated = await AsyncStorage.getItem("walletCreated")
        const walletPassword = await AsyncStorage.getItem("wallet_password")
        const hasLaunched = await AsyncStorage.getItem("hasLaunched")

        console.log("[DEV] Wallet Status Check:", {
          hasWallet,
          walletCreated,
          walletPassword: walletPassword ? "Set" : "Not Set",
          hasLaunched,
        })

        if (hasWallet === "true" || walletCreated === "true" || walletPassword !== null) {
          router.replace("/unlock-wallet")
        } else {
          if (hasLaunched !== "true") {
            await AsyncStorage.setItem("hasLaunched", "true")
          }
        }
      } catch (error) {
        console.error("[DEV] Error checking wallet status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkWalletStatus()
  }, [router])

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem("hasLaunched", "true")
      router.push("/(wallet)/wallet-choice")
    } catch (error) {
      console.error("[DEV] Error navigating:", error)
      router.push("/(wallet)/wallet-choice")
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.onboardingContainer, { backgroundColor: colors.background }]}>
        {/* Top section with illustration */}
        <View style={[styles.illustrationContainer]}>
          <Image source={x} style={styles.illustration} resizeMode="contain" />
        </View>

        {/* Bottom card with content */}
        <View style={[styles.contentCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Explore now</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>to experience the benefits</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>GET STARTED</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  illustrationContainer: {
    flex: 1,
    backgroundColor: "#c8e6b0",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  illustration: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingTop: 40,
    marginTop: -32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 20,
  },
  homeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 40,
  },
  homeSubtitle: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginTop: 8,
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.light.tint,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
  },
})
