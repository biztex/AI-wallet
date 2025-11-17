"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { WalletManager } from "@/utils/wallet-manager"; // Assuming WalletManager is imported here
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export default function WalletChoice() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const [hasExistingWallets, setHasExistingWallets] = useState(false)

  useEffect(() => {
    const checkWallets = async () => {
      const wallets = await WalletManager.getAllWallets()
      setHasExistingWallets(wallets.length > 0)
    }
    checkWallets()
  }, [])

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {hasExistingWallets ? "Add Wallet" : "Setup Wallet"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {hasExistingWallets ? "Add Another Wallet" : "Setup Your Wallet"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {hasExistingWallets
            ? "Create a new wallet or import an existing one to your collection"
            : "Choose how you want to get started with your multi-chain wallet"}
        </Text>

        {/* Create New Wallet Option */}
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(wallet)/create-seed")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + "22" }]}>
            <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                fill={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Create New Wallet</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Generate a new wallet with a secure seed phrase
            </Text>
          </View>
        </TouchableOpacity>

        {/* Import Existing Wallet Option */}
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(wallet)/import-wallet")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + "22" }]}>
            <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                fill={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Import Wallet</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Import using seed phrase or private key
            </Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.infoBox, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.infoText, { color: colors.primary }]}>
            {hasExistingWallets
              ? "🔒 Additional wallets use your existing security PIN"
              : "🔒 Your keys are stored securely on your device"}
          </Text>
        </View>
      </View>
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
    paddingHorizontal: 0,
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
  content: {
    flex: 1,
    marginTop: 0,
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
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
})
