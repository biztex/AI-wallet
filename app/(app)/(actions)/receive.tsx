"use client"
import { QrIcon } from "@/components/Icons/qr"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import * as Clipboard from "expo-clipboard"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const BITCOIN_ADDRESS = "34HuwzDnSwXVRNCoYFCpQnRBXV2sVYmGUY" as const

export default function ReceiveScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const [isCopying, setIsCopying] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<{ name: string; symbol: string }>(() => ({
    name: "Bitcoin",
    symbol: "BTC",
  }))

  const handleCopyAddress = useCallback(async () => {
    if (isCopying) return
    setIsCopying(true)
    try {
      await Clipboard.setStringAsync(BITCOIN_ADDRESS)
      Alert.alert("Success", "Address copied to clipboard")
    } catch (error) {
      console.error("Error copying address:", error)
      Alert.alert("Error", "Failed to copy address")
    } finally {
      setIsCopying(false)
    }
  }, [isCopying])

  const handleShareAddress = useCallback(async () => {
    if (isSharing) return
    setIsSharing(true)
    try {
      await Share.share({
        message: `My ${selectedCrypto.name} Address: ${BITCOIN_ADDRESS}`,
        title: `${selectedCrypto.name} Address`,
      })
    } catch (error) {
      console.error("Error sharing address:", error)
    } finally {
      setIsSharing(false)
    }
  }, [isSharing, selectedCrypto])

  const handleBackPress = useCallback(() => {
    router.push("/home")
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

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.tab} onPress={() => router.push("/(app)/(actions)/send")} activeOpacity={0.7}>
            <Text style={[styles.tabText, { color: colors.textSecondary }]}>Send</Text>
          </TouchableOpacity>
          <View style={[styles.tab, styles.activeTab, { backgroundColor: colors.card }]}>
            <Text style={[styles.tabText, styles.activeTabText, { color: colors.text }]}>Receive</Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.qrSection}>
          <View style={styles.qrContainer}>
            <QrIcon />
          </View>

          <Text style={[styles.addressLabel, { color: colors.text }]}>Deposit address:</Text>
          <Text style={[styles.addressText, { color: colors.text }]} selectable>
            {BITCOIN_ADDRESS}
          </Text>

          <Text style={[styles.warningText, { color: colors.textSecondary }]}>
            Deposit assets using the {selectedCrypto.name} blockchain only. Assets sent from other blockchains will be
            lost.
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleShareAddress}
            disabled={isSharing}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M16 6L12 2L8 6"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path d="M12 2V15" stroke={colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleCopyAddress}
            disabled={isCopying}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.083 2.57C15.7094 2.20466 15.2076 2.00007 14.685 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V9C4 8.46957 4.21071 7.96086 4.58579 7.58579C4.96086 7.21071 5.46957 7 6 7H8"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Copy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showCryptoModal} transparent animationType="slide">
        <View style={styles.modalOverlayBottom}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Crypto</Text>
            {[
              { name: "Bitcoin", symbol: "BTC" },
              { name: "Ethereum", symbol: "ETH" },
              { name: "Tether", symbol: "USDT" },
              { name: "USD Coin", symbol: "USDC" },
              { name: "BEP", symbol: "BEP" },
              { name: "Solana", symbol: "SOL" },
            ].map((c) => (
              <TouchableOpacity
                key={c.symbol}
                style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedCrypto(c)
                  setShowCryptoModal(false)
                }}
              >
                <Text style={[styles.dropdownOptionText, { color: colors.text }]}>
                  {c.name} ({c.symbol})
                </Text>
                {selectedCrypto.symbol === c.symbol && (
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12L10 17L19 8"
                      stroke="#4CAF50"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCryptoModal(false)}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalCloseButtonGradient}
              >
                <Text style={styles.modalCloseButtonText}>CLOSE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "600",
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    flexGrow: 1,
    justifyContent: "center",
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  qrContainer: {
    marginBottom: 40,
    transform: [{ scale: 1.3 }],
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  warningText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalCloseButton: {
    marginTop: 20,
  },
  modalCloseButtonGradient: {
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
