"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { WalletManager } from "@/utils/wallet-manager"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

type ImportMethod = "mnemonic" | "privateKey"

export default function ImportWallet() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [importMethod, setImportMethod] = useState<ImportMethod>("mnemonic")
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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

  const handleImport = async () => {
    if (!inputValue.trim()) {
      Alert.alert("Error", "Please enter your seed phrase or private key")
      return
    }

    setIsLoading(true)
    try {
      let walletData

      if (importMethod === "mnemonic") {
        if (!WalletManager.validateSeedPhrase(inputValue.trim())) {
          throw new Error("Invalid seed phrase. Please check and try again.")
        }

        const tempPin = "000000"
        walletData = await WalletManager.importWallet(inputValue.trim(), tempPin)
      } else {
        const tempPin = "000000"
        walletData = await WalletManager.importFromPrivateKey(inputValue.trim(), undefined, tempPin)
      }

      const existingWallets = await WalletManager.getAllWallets()
      if (existingWallets.length > 0) {
        walletData = await WalletManager.addWallet(walletData)
        console.log("[DEV] Added imported wallet:", {
          id: walletData.id,
          name: walletData.name,
          evm: walletData.evmAddress,
          solana: walletData.solanaAddress,
        })

        Alert.alert("Success!", "Wallet imported successfully", [
          { text: "Continue", onPress: () => router.push("/(app)/home") },
        ])
      } else {
        console.log("[DEV] Imported first wallet:", {
          evm: walletData.evmAddress,
          solana: walletData.solanaAddress,
        })

        Alert.alert("Success!", "Wallet imported successfully", [
          { text: "Continue", onPress: () => router.push("/(wallet)/setup-security?source=import") },
        ])
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to import wallet")
    } finally {
      setIsLoading(false)
    }
  }

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
              d="M21 16V8C21 6.895 20.105 6 19 6H5C3.895 6 3 6.895 3 8V16C3 17.105 3.895 18 5 18H19C20.105 18 21 17.105 21 16Z"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path d="M1 10H23" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M7 14H7.01" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          {hasExistingWallets ? "Import Another Wallet" : "Import Wallet"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {hasExistingWallets
            ? "Import an existing wallet to add to your collection using a seed phrase or private key"
            : "Import your existing wallet using a seed phrase or private key. Multi-chain support is automatic."}
        </Text>

        <View style={styles.methodContainer}>
          <TouchableOpacity
            style={[
              styles.methodButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              importMethod === "mnemonic" && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setImportMethod("mnemonic")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.methodText,
                { color: colors.text },
                importMethod === "mnemonic" && { color: colors.primary, fontWeight: "700" },
              ]}
            >
              Seed Phrase
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              importMethod === "privateKey" && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setImportMethod("privateKey")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.methodText,
                { color: colors.text },
                importMethod === "privateKey" && { color: colors.primary, fontWeight: "700" },
              ]}
            >
              Private Key
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {importMethod === "mnemonic" ? "Enter your 12-word seed phrase" : "Enter your private key"}
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
              importMethod === "mnemonic" && styles.multilineInput,
            ]}
            placeholder={
              importMethod === "mnemonic"
                ? "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                : "Wallet Address (auto-detected)"
            }
            placeholderTextColor={colors.textSecondary}
            value={inputValue}
            onChangeText={setInputValue}
            multiline={importMethod === "mnemonic"}
            numberOfLines={importMethod === "mnemonic" ? 4 : 1}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={importMethod === "privateKey"}
          />
        </View>

        <View style={[styles.warningContainer, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.warningText, { color: colors.primary }]}>
            {hasExistingWallets
              ? "🔒 This wallet will use your existing security PIN"
              : "🔒 Your keys are stored securely on your device and synced encrypted to the server. All chains are supported automatically."}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.importButton, { backgroundColor: colors.primary }, isLoading && { opacity: 0.6 }]}
          onPress={handleImport}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={[styles.importButtonText, { color: colors.background }]}>
            {isLoading ? "Importing..." : "Import Wallet"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createNewButton}
          onPress={() => router.push("/(wallet)/wallet-choice")}
          activeOpacity={0.7}
        >
          <Text style={[styles.createNewText, { color: colors.primary }]}>Don't have a wallet? Create new</Text>
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
  iconContainer: {
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
  methodContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  methodText: {
    fontSize: 15,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  warningContainer: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
  importButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  createNewButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  createNewText: {
    fontSize: 14,
    fontWeight: "600",
  },
})
