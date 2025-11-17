"use client"
import { BEPIcon } from "@/components/Icons/crypto/bep"
import { BTCIcon } from "@/components/Icons/crypto/bitcoin"
import { ETHIcon } from "@/components/Icons/crypto/etherium"
import { SOLIcon } from "@/components/Icons/crypto/solana"
import { USDTIcon } from "@/components/Icons/crypto/tether"
import { DeleteIcon } from "@/components/Icons/delete"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Path, Svg } from "react-native-svg"

const AVAILABLE_BALANCE = 10378.5
const BTC_RATE = 0.0000234 // Example: 1 USD = 0.0000234 BTC
const QUICK_AMOUNTS = [100, 250, 1000] as const


type PaymentMethod = {
  id: string
  label: string
}

type Cryptocurrency = {
  id: string
  label: string
  name: string
  rate: number
  Icon: any
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "card", label: "Card" },
  { id: "bank", label: "Bank Transfer" },
  { id: "paypal", label: "PayPal" },
  { id: "apple-pay", label: "Apple Pay" },
]

const CRYPTOCURRENCIES: Cryptocurrency[] = [
  { id: "btc", label: "BTC", name: "Bitcoin", rate: 0.0000234, Icon: BTCIcon },
  { id: "eth", label: "ETH", name: "Ethereum", rate: 0.00035, Icon: ETHIcon },
  { id: "usdt", label: "USDT", name: "Tether", rate: 1.0, Icon: USDTIcon },
  { id: "usdc", label: "USDC", name: "USD Coin", rate: 1.0, Icon: USDTIcon },
  { id: "bep", label: "BEP", name: "BEP", rate: 1.0, Icon: BEPIcon },
  { id: "sol", label: "SOL", name: "Solana", rate: 0.0125, Icon: SOLIcon },
]

export default function BuyBitcoin() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false)
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0])
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTOCURRENCIES[0])

  const cryptoAmount = amount ? (Number.parseFloat(amount) * selectedCrypto.rate).toFixed(8) : "0"

  const handleQuickAmount = useCallback((value: number) => {
    setAmount(value.toString())
  }, [])

  const handleKeypad = useCallback((value: string) => {
    if (value === "backspace") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : ""))
    } else if (value === ".") {
      setAmount((prev) => (prev.includes(".") ? prev : prev + "."))
    } else {
      setAmount((prev) => (prev === "" || prev === "0" ? value : prev + value))
    }
  }, [])

  const handlePercentage = useCallback((percent: number) => {
    const calculatedAmount = (AVAILABLE_BALANCE * percent).toFixed(2)
    setAmount(calculatedAmount)
  }, [])

  const handleMax = useCallback(() => {
    setAmount(AVAILABLE_BALANCE.toString())
  }, [])

  const handleClear = useCallback(() => {
    setAmount("")
  }, [])

  const handleSubmit = useCallback(() => {
    const numAmount = Number.parseFloat(amount)
    if (!amount || numAmount < 100) {
      console.warn("[Pucket] Minimum amount is $100")
      return
    }
    router.push("/top-up")
  }, [amount, router])

  const isButtonEnabled = amount !== "" && Number.parseFloat(amount) >= 100

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/home")} style={styles.backButton}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Instant Buy</Text>
        <TouchableOpacity
          style={[styles.switchButton, { backgroundColor: colors.card }]}
          onPress={() => router.push("/sell-bitcoin")}
        >
          <Text style={[styles.switchButtonText, { color: colors.primary }]}>SELL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Amount Display - Centered */}
        <View style={styles.amountSection}>
          <Text style={[styles.amountValue, { color: colors.text }]}>
            {amount || "0"}
            <Text style={styles.currencyLabel}> USD</Text>
          </Text>
          <Text style={[styles.btcAmount, { color: colors.textSecondary }]}>
            ≈ {cryptoAmount} {selectedCrypto.label}
          </Text>
        </View>

        {/* Exchange Rate */}
        <View style={styles.rateContainer}>
          <Text style={[styles.rateText, { color: colors.textSecondary }]}>
            1 USD ≈ {selectedCrypto.rate.toFixed(8)} {selectedCrypto.label}
          </Text>
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountContainer}>
          {QUICK_AMOUNTS.map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.quickAmountButton, { backgroundColor: colors.card }]}
              onPress={() => handleQuickAmount(value)}
            >
              <Text style={[styles.quickAmountText, { color: colors.text }]}>$ {value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method & Currency Selectors */}
        <View style={styles.selectorsContainer}>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: colors.card }]}
            onPress={() => setShowPaymentDropdown(true)}
          >
            <View style={styles.selectorContent}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 4H3C2.44772 4 2 4.44772 2 5V19C2 19.5523 2.44772 20 3 20H21C21.5523 20 22 19.5523 22 19V5C22 4.44772 21.5523 4 21 4Z"
                  stroke={colors.text}
                  strokeWidth={2}
                />
                <Path d="M2 10H22" stroke={colors.text} strokeWidth={2} />
              </Svg>
              <Text style={[styles.selectorText, { color: colors.text }]}>{selectedPayment.label}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selector, { backgroundColor: colors.card }]}
            onPress={() => setShowCryptoDropdown(true)}
          >
            <View style={styles.selectorContent}>
              <selectedCrypto.Icon />
              <Text style={[styles.selectorText, { color: colors.text }]}>{selectedCrypto.label}</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M6 9L12 15L18 9"
                  stroke={colors.text}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>
        </View>

        {/* Buy Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!isButtonEnabled}
          style={{ opacity: isButtonEnabled ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buyButton}
          >
            <Text style={styles.buyButtonText}>Buy {selectedCrypto.label}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Numeric Keypad */}
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

      <Modal
        visible={showPaymentDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaymentDropdown(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPaymentDropdown(false)}>
          <View style={[styles.dropdownContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>Select Payment Method</Text>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.dropdownItem,
                  { borderBottomColor: colors.border },
                  selectedPayment.id === method.id && { backgroundColor: colors.primary + "20" },
                ]}
                onPress={() => {
                  setSelectedPayment(method)
                  setShowPaymentDropdown(false)
                }}
              >
                <Text style={[styles.dropdownItemText, { color: colors.text }]}>{method.label}</Text>
                {selectedPayment.id === method.id && (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17L4 12"
                      stroke={colors.primary}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showCryptoDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCryptoDropdown(false)}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={[styles.modalContentBottom, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Crypto</Text>
            {CRYPTOCURRENCIES.map((crypto) => (
              <TouchableOpacity
                key={crypto.id}
                style={[styles.cryptoOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedCrypto(crypto)
                  setShowCryptoDropdown(false)
                }}
                activeOpacity={0.7}
              >
                <View style={styles.cryptoOptionLeft}>
                  <crypto.Icon />
                  <Text style={[styles.cryptoOptionText, { color: colors.text }]}>
                    {crypto.name} ({crypto.label})
                  </Text>
                </View>
                {selectedCrypto.id === crypto.id && (
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
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCryptoDropdown(false)}>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  switchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  switchButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  amountSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 12,
  },
  amountValue: {
    fontSize: 56,
    fontWeight: "700",
    letterSpacing: -1,
  },
  currencyLabel: {
    fontSize: 32,
    fontWeight: "400",
  },
  btcAmount: {
    fontSize: 16,
    marginTop: 8,
  },
  rateContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  rateText: {
    fontSize: 13,
  },
  quickAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: "600",
  },
  selectorsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  selector: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buyButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    width: "80%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownItemSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  modalOverlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContentBottom: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  cryptoOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cryptoOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cryptoOptionText: {
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
})
