"use client"
import { BEPIcon } from "@/components/Icons/crypto/bep"
import { BTCIcon } from "@/components/Icons/crypto/bitcoin"
import { ETHIcon } from "@/components/Icons/crypto/etherium"
import { SOLIcon } from "@/components/Icons/crypto/solana"
import { USDTIcon } from "@/components/Icons/crypto/tether"
import { DeleteIcon } from "@/components/Icons/delete"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import * as Clipboard from "expo-clipboard"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const AVAILABLE_BALANCE = 2.23464
const TRANSACTION_FEE = 0.0006

const CRYPTO_OPTIONS = [
  { name: "Bitcoin", symbol: "BTC", Icon: BTCIcon },
  { name: "Ethereum", symbol: "ETH", Icon: ETHIcon },
  { name: "Tether", symbol: "USDT", Icon: USDTIcon },
  { name: "USD Coin", symbol: "USDC", Icon: USDTIcon },
  { name: "BEP", symbol: "BEP", Icon: BEPIcon },
  { name: "Solana", symbol: "SOL", Icon: SOLIcon },
]

export default function SendScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("0")
  const [note, setNote] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<{ name: string; symbol: string; Icon: any }>(
    () => CRYPTO_OPTIONS[0],
  )


  const handleKeypad = useCallback((value: string) => {
    if (value === "backspace") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"))
    } else if (value === ".") {
      setAmount((prev) => (prev.includes(".") ? prev : prev + "."))
    } else {
      setAmount((prev) => (prev === "0" ? value : prev + value))
    }
  }, [])

  const handlePercentage = useCallback((percent: number) => {
    const calculatedAmount = (AVAILABLE_BALANCE * percent).toFixed(8)
    setAmount(calculatedAmount)
  }, [])

  const handleMax = useCallback(() => {
    setAmount(AVAILABLE_BALANCE.toString())
  }, [])

  const handleClear = useCallback(() => {
    setAmount("0")
  }, [])

  const usdValue = useMemo(() => {
    const btcAmount = Number.parseFloat(amount) || 0
    const btcToUsd = 45000
    return (btcAmount * btcToUsd).toFixed(2)
  }, [amount])

  const handleSend = useCallback(() => {
    if (!address.trim()) {
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (numAmount <= 0) {
      return
    }

    if (numAmount > AVAILABLE_BALANCE) {
      return
    }

    setShowSuccessModal(true)
  }, [address, amount, selectedCrypto])

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false)
    setAddress("")
    setAmount("0")
    setNote("")
    router.push("/home")
  }, [router])

  const handleBackPress = useCallback(() => {
    router.push("/home")
  }, [router])

  const handlePasteAddress = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync()
      if (text) {
        setAddress(text)
        setShowAddressModal(false)
      }
    } catch (error) {
      console.error("Error pasting address:", error)
    }
  }, [])

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
          <View style={[styles.tab, styles.activeTab, { backgroundColor: colors.card }]}>
            <Text style={[styles.tabText, styles.activeTabText, { color: colors.text }]}>Send</Text>
          </View>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => router.push("/(app)/(actions)/receive")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, { color: colors.textSecondary }]}>Receive</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.currencySelector, { backgroundColor: colors.card }]}
          onPress={() => setShowCryptoModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.currencyLeft}>
            <selectedCrypto.Icon />
            <View>
              <Text style={[styles.currencyName, { color: colors.text }]}>{selectedCrypto.name}</Text>
              <Text style={[styles.currencyBalance, { color: colors.textSecondary }]}>
                {AVAILABLE_BALANCE} {selectedCrypto.symbol}
              </Text>
            </View>
          </View>
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
              d="M5 7.5L10 12.5L15 7.5"
              stroke={colors.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.amountSection}>
          <Text style={[styles.amountValue, { color: colors.text }]}>{amount}</Text>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>{selectedCrypto.symbol}</Text>
          <Text style={[styles.usdValue, { color: colors.textSecondary }]}>≈ ${usdValue} USD</Text>
        </View>

        <TouchableOpacity
          style={[styles.recipientSelector, { backgroundColor: colors.card }]}
          onPress={() => setShowAddressModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.recipientIcon}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={styles.recipientInfo}>
            <Text style={[styles.recipientLabel, { color: colors.textSecondary }]}>Send to</Text>
            <Text style={[styles.recipientText, { color: colors.text }]} numberOfLines={1}>
              {address || "Select recipient"}
            </Text>
          </View>
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
              d="M7.5 15L12.5 10L7.5 5"
              stroke={colors.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.keypadContainer}>
          <View style={styles.keypadLeft}>
            <TouchableOpacity style={styles.sideButton} onPress={handleMax} activeOpacity={0.7}>
              <Text style={[styles.sideButtonText, { color: colors.primary }]}>MAX</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideButton} onPress={() => handlePercentage(0.75)} activeOpacity={0.7}>
              <Text style={[styles.sideButtonText, { color: colors.primary }]}>75%</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideButton} onPress={() => handlePercentage(0.5)} activeOpacity={0.7}>
              <Text style={[styles.sideButtonText, { color: colors.primary }]}>50%</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideButton} onPress={handleClear} activeOpacity={0.7}>
              <Text style={[styles.sideButtonText, { color: colors.primary }]}>CLEAR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keypadRight}>
            {[
              ["1", "2", "3"],
              ["4", "5", "6"],
              ["7", "8", "9"],
              [".", "0", "backspace"],
            ].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.keypadButton}
                    onPress={() => handleKeypad(key)}
                    activeOpacity={0.7}
                  >
                    {key === "backspace" ? (
                      <DeleteIcon />
                    ) : (
                      <Text style={[styles.keypadText, { color: colors.text }]}>{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomButtonContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!address || Number.parseFloat(amount) <= 0}
          activeOpacity={0.8}
          style={{ opacity: address && Number.parseFloat(amount) > 0 ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Text style={styles.sendButtonText}>SEND {selectedCrypto.symbol}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.successModalOverlay}>
          <View style={[styles.successModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconOuter}>
                <View style={[styles.successIconInner, { backgroundColor: colors.primary }]}>
                  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                    <Path
                      d="M10 20L17 27L30 13"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Transaction Sent!</Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Your {selectedCrypto.name} transaction has been successfully broadcasted.
            </Text>
            <View style={styles.successDetails}>
              <View style={styles.successRow}>
                <Text style={[styles.successLabel, { color: colors.textSecondary }]}>Amount</Text>
                <Text style={[styles.successValue, { color: colors.text }]}>
                  {amount} {selectedCrypto.symbol}
                </Text>
              </View>
              <View style={styles.successRow}>
                <Text style={[styles.successLabel, { color: colors.textSecondary }]}>Fee</Text>
                <Text style={[styles.successValue, { color: colors.text }]}>
                  {TRANSACTION_FEE} {selectedCrypto.symbol}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleCloseSuccessModal} activeOpacity={0.8} style={{ width: "100%" }}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.successButton}
              >
                <Text style={styles.successButtonText}>DONE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Crypto Selector Modal */}
      <Modal visible={showCryptoModal} transparent animationType="slide">
        <View style={styles.modalOverlayBottom}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Crypto</Text>
            {CRYPTO_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c.symbol}
                style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedCrypto(c)
                  setShowCryptoModal(false)
                }}
              >
                <View style={styles.dropdownOptionLeft}>
                  <c.Icon />
                  <Text style={[styles.dropdownOptionText, { color: colors.text }]}>
                    {c.name} ({c.symbol})
                  </Text>
                </View>
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

      {/* Address Modal */}
      <Modal visible={showAddressModal} transparent animationType="slide">
        <View style={styles.modalOverlayBottom}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Enter Recipient Address</Text>
            <TextInput
              style={[
                styles.addressInput,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
              ]}
              placeholder="Paste or enter address"
              placeholderTextColor={colors.textSecondary}
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={handlePasteAddress}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>PASTE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                onPress={() => setShowAddressModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>DONE</Text>
              </TouchableOpacity>
            </View>
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  currencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencyName: {
    fontSize: 15,
    fontWeight: "600",
  },
  currencyBalance: {
    fontSize: 12,
    marginTop: 2,
  },
  amountSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  amountValue: {
    fontSize: 56,
    fontWeight: "700",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  usdValue: {
    fontSize: 14,
  },
  recipientSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  recipientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(132, 199, 24, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  recipientInfo: {
    flex: 1,
  },
  recipientLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  recipientText: {
    fontSize: 14,
    fontWeight: "500",
  },
  keypadContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  keypadLeft: {
    gap: 12,
    width: 70,
  },
  sideButton: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(132, 199, 24, 0.1)",
    borderRadius: 8,
  },
  sideButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  keypadRight: {
    flex: 1,
    gap: 12,
  },
  keypadRow: {
    flexDirection: "row",
    gap: 12,
  },
  keypadButton: {
    flex: 1,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  keypadText: {
    fontSize: 24,
    fontWeight: "400",
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  sendButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  successModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
  },
  successIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  successDetails: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  successRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  successValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  successButton: {
    borderRadius: 12,
    height: 56,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
  dropdownOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  addressInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
