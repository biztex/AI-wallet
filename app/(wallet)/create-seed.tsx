"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { WalletManager } from "@/utils/wallet-manager"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Clipboard from "expo-clipboard"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export default function CreateSeed() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [seedPhrase, setSeedPhrase] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const generateSeed = async () => {
      try {
        const mnemonic = await WalletManager.generateSeedPhrase()
        const seed = mnemonic.split(" ")
        setSeedPhrase(seed)
        await AsyncStorage.setItem("temp_wallet_seed", JSON.stringify(seed))
      } catch (error) {
        console.error("Error generating seed phrase:", error)
        Alert.alert("Error", "Failed to generate seed phrase. Please try again.")
      }
    }

    generateSeed()
  }, [])

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(seedPhrase.join(" "))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [seedPhrase])

  const handleContinue = useCallback(() => {
    Alert.alert("Important", "Have you written down your seed phrase? You'll need it to confirm in the next step.", [
      { text: "Not Yet", style: "cancel" },
      { text: "Yes, Continue", onPress: () => router.push("/(wallet)/confirm-seed") },
    ])
  }, [router])

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const renderSeedWord = useCallback(
    (word: string, index: number) => (
      <View key={index} style={[styles.seedItem, { borderBottomColor: colors.border }]}>
        <Text style={[styles.seedNumber, { color: colors.textSecondary }]}>{index + 1}</Text>
        <Text style={[styles.seedWord, { color: colors.text }]}>{word}</Text>
      </View>
    ),
    [colors],
  )

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
        <View style={styles.lockIconContainer}>
          <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2C9.243 2 7 4.243 7 7V10H6C4.346 10 3 11.346 3 13V20C3 21.654 4.346 23 6 23H18C19.654 23 21 21.654 21 20V13C21 11.346 19.654 10 18 10H17V7C17 4.243 14.757 2 12 2ZM9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V10H9V7ZM19 20C19 20.551 18.551 21 18 21H6C5.449 21 5 20.551 5 20V13C5 12.449 5.449 12 6 12H18C18.551 12 19 12.449 19 13V20Z"
              fill={colors.primary}
            />
            <Path
              d="M12 14C11.448 14 11 14.448 11 15V17C11 17.552 11.448 18 12 18C12.552 18 13 17.552 13 17V15C13 14.448 12.552 14 12 14Z"
              fill={colors.primary}
            />
          </Svg>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Secure Your Wallet</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Write down these 12 words in the exact order. This is your backup phrase.
        </Text>

        <View style={[styles.seedContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {seedPhrase.map(renderSeedWord)}
        </View>

        <View style={styles.warningContainer}>
          <View style={[styles.warningBadge, { backgroundColor: colors.primary + "33" }]}>
            <Text style={[styles.warningText, { color: colors.primary }]}>
              🛡️ Never share these words. Anyone with this phrase can access your funds.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: copied ? colors.border : colors.card, borderColor: colors.border },
          ]}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionButtonText, { color: copied ? colors.textSecondary : colors.primary }]}>
            {copied ? "Copied to Clipboard" : "Copy Seed Phrase"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
          activeOpacity={0.7}
        >
          <Text style={[styles.continueButtonText, { color: colors.background }]}>
            I've Written Down My Seed Phrase
          </Text>
        </TouchableOpacity>
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
  lockIconContainer: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  seedContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  seedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  seedNumber: {
    fontSize: 14,
    width: 30,
    textAlign: "center",
    fontWeight: "600",
    marginRight: 12,
  },
  seedWord: {
    fontSize: 16,
    fontWeight: "500",
  },
  warningContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  warningBadge: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  warningText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
})
