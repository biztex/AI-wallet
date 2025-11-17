"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { WalletManager } from "@/utils/wallet-manager"
import * as Clipboard from "expo-clipboard"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import QRCode from "react-native-qrcode-svg"
import Svg, { Path } from "react-native-svg"

export default function WalletAddress() {
  const router = useRouter()
  const { source } = useLocalSearchParams<{ source?: "import" | "create" | "unknown" }>()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [address, setAddress] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadAddress()
  }, [])

  const loadAddress = async () => {
    console.log("[DEV] Loading EVM address, source:", source)

    const addr = await WalletManager.getAddressForChain("EVM")

    console.log("[DEV] Loaded address:", addr)

    setAddress(addr || "")
  }

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [address])

  const handleDone = () => {
    router.replace("/(app)/home")
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet Address</Text>
        <TouchableOpacity onPress={handleDone}>
          <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Your Wallet Address</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {source === "import"
            ? "This is your imported wallet address. You can now receive crypto on different networks."
            : source === "create"
              ? "This is your new wallet address. Share it to receive crypto on different networks."
              : "Share this address to receive crypto on different networks"}
        </Text>

        {/* QR Code */}
        <View style={[styles.qrContainer, { backgroundColor: colors.card }]}>
          {address && <QRCode value={address} size={200} backgroundColor="white" color="black" />}
        </View>

        {/* Address Display */}
        <View style={[styles.addressContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>Address</Text>
          <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="middle">
            {address}
          </Text>
        </View>

        {/* Copy Button */}
        <TouchableOpacity
          style={[styles.copyButton, { backgroundColor: copied ? colors.border : colors.primary }]}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.copyIcon}>
            <Path
              d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
              fill={colors.background}
            />
          </Svg>
          <Text style={[styles.copyButtonText, { color: colors.background }]}>
            {copied ? "Copied!" : "Copy Address"}
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.infoText, { color: colors.primary }]}>
            {source === "import"
              ? "✅ Your imported wallet is ready to use. EVM address works for Ethereum, BSC, Polygon, Arbitrum, and Optimism"
              : "💡 EVM address works for Ethereum, BSC, Polygon, Arbitrum, and Optimism"}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  doneText: {
    fontSize: 16,
    fontWeight: "600",
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
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  addressContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  addressText: {
    fontSize: 14,
    fontWeight: "500",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  copyIcon: {
    marginRight: 4,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  infoContainer: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
})
