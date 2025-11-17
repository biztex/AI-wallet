"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { WalletManager } from "@/utils/wallet-manager"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const VERIFICATION_WORDS_COUNT = 4

export default function ConfirmSeed() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [originalSeed, setOriginalSeed] = useState<string[]>([])
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [verificationIndices, setVerificationIndices] = useState<number[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const loadSeedPhrase = useCallback(async () => {
    try {
      const seedJson = await AsyncStorage.getItem("temp_wallet_seed")
      if (!seedJson) {
        Alert.alert("Error", "Could not load seed phrase. Please try again.")
        router.back()
        return
      }

      const seed = JSON.parse(seedJson)
      setOriginalSeed(seed)

      const indices: number[] = []
      while (indices.length < VERIFICATION_WORDS_COUNT) {
        const randomIndex = Math.floor(Math.random() * seed.length)
        if (!indices.includes(randomIndex)) {
          indices.push(randomIndex)
        }
      }
      indices.sort((a, b) => a - b)
      setVerificationIndices(indices)

      const wordsToVerify = indices.map((i) => seed[i])
      const shuffled = [...wordsToVerify].sort(() => Math.random() - 0.5)
      setShuffledWords(shuffled)
    } catch (error) {
      console.error("Error loading seed phrase:", error)
      Alert.alert("Error", "Could not load seed phrase. Please try again.")
      router.back()
    }
  }, [router])

  useEffect(() => {
    loadSeedPhrase()
  }, [loadSeedPhrase])

  const handleWordPress = useCallback(
    (word: string) => {
      setSelectedWords((prev) => (prev.length < verificationIndices.length ? [...prev, word] : prev))
    },
    [verificationIndices.length],
  )

  const handleRemoveWord = useCallback((index: number) => {
    setSelectedWords((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleVerify = useCallback(async () => {
    const isCorrect = verificationIndices.every((originalIndex, i) => selectedWords[i] === originalSeed[originalIndex])

    if (!isCorrect) {
      Alert.alert("Incorrect", "The words don't match. Please try again.", [
        { text: "OK", onPress: () => setSelectedWords([]) },
      ])
      return
    }

    setIsCreating(true)
    try {
      const seedPhrase = originalSeed.join(" ")
      const tempPin = "000000"

      const existingWallets = await WalletManager.getAllWallets()
      let walletData

      if (existingWallets.length > 0) {
        const newWalletData = await WalletManager.createWallet(seedPhrase, tempPin)
        walletData = await WalletManager.addWallet(newWalletData)
        console.log("[DEV] Added new wallet:", {
          id: walletData.id,
          name: walletData.name,
          evm: walletData.evmAddress,
          solana: walletData.solanaAddress,
        })

        await AsyncStorage.removeItem("temp_wallet_seed")
        Alert.alert("Success!", "Your wallet has been added successfully.", [
          { text: "Continue", onPress: () => router.push("/(app)/home") },
        ])
      } else {
        // First wallet - use legacy create and require PIN setup
        walletData = await WalletManager.createWallet(seedPhrase, tempPin)
        console.log("[DEV] Created first wallet:", {
          evm: walletData.evmAddress,
          solana: walletData.solanaAddress,
        })

        await AsyncStorage.removeItem("temp_wallet_seed")
        Alert.alert("Success!", "Your wallet has been created successfully.", [
          { text: "Continue", onPress: () => router.push("/(wallet)/setup-security?source=create") },
        ])
      }
    } catch (error) {
      console.error("Wallet creation error:", error)
      Alert.alert("Error", `Failed to create wallet. ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsCreating(false)
    }
  }, [verificationIndices, selectedWords, originalSeed, router])

  const isComplete = useMemo(
    () => selectedWords.length === verificationIndices.length,
    [selectedWords.length, verificationIndices.length],
  )

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const renderPositionBox = useCallback(
    (position: number, index: number) => (
      <View key={position} style={styles.positionBox}>
        <Text style={[styles.positionLabel, { color: colors.textSecondary }]}>Word #{position + 1}</Text>
        {selectedWords[index] ? (
          <TouchableOpacity
            style={[styles.selectedWordBox, { backgroundColor: colors.primary }]}
            onPress={() => handleRemoveWord(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.selectedWord, { color: colors.background }]}>{selectedWords[index]}</Text>
            <Text style={[styles.removeIcon, { color: colors.background }]}>×</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.emptyWordBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyWordText, { color: colors.textSecondary }]}>Tap word below</Text>
          </View>
        )}
      </View>
    ),
    [colors, selectedWords, handleRemoveWord],
  )

  const renderWordButton = useCallback(
    (word: string, index: number) => {
      const isSelected = selectedWords.includes(word)
      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.wordButton,
            { backgroundColor: colors.card, borderColor: colors.border },
            isSelected && { backgroundColor: colors.border, opacity: 0.5 },
          ]}
          onPress={() => !isSelected && handleWordPress(word)}
          disabled={isSelected}
          activeOpacity={0.7}
        >
          <Text style={[styles.wordButtonText, { color: colors.text }, isSelected && { color: colors.textSecondary }]}>
            {word}
          </Text>
        </TouchableOpacity>
      )
    },
    [colors, selectedWords, handleWordPress],
  )

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Confirm Seed</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Confirm Your Seed Phrase</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select the words in the correct order to verify you've saved your seed phrase.
        </Text>
      </View>

      <View style={styles.positionsContainer}>{verificationIndices.map(renderPositionBox)}</View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Words:</Text>
      <View style={styles.wordsGrid}>{shuffledWords.map(renderWordButton)}</View>

      <TouchableOpacity
        style={[
          styles.verifyButton,
          { backgroundColor: colors.primary },
          (!isComplete || isCreating) && { backgroundColor: colors.border, opacity: 0.6 },
        ]}
        onPress={handleVerify}
        disabled={!isComplete || isCreating}
        activeOpacity={0.7}
      >
        <Text style={[styles.verifyButtonText, { color: colors.background }]}>
          {isCreating ? "CREATING WALLET..." : "VERIFY & CREATE WALLET"}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
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
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  positionsContainer: {
    marginBottom: 32,
  },
  positionBox: {
    marginBottom: 16,
  },
  positionLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "600",
  },
  selectedWordBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedWord: {
    fontSize: 16,
    fontWeight: "600",
  },
  removeIcon: {
    fontSize: 24,
    fontWeight: "300",
  },
  emptyWordBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  emptyWordText: {
    fontSize: 14,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  wordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  wordButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  wordButtonText: {
    fontSize: 15,
    fontWeight: "500",
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
  bottomSpacer: {
    height: 40,
  },
})
