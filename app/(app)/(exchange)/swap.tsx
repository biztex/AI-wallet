"use client"

import { BchIcon } from "@/components/Icons/bch"
import { BitcoinIcon } from "@/components/Icons/bitcoin"
import { DeleteIcon } from "@/components/Icons/delete"
import { SwapIcon } from "@/components/Icons/swap"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Path, Svg } from "react-native-svg"

const BTC_BALANCE = 0.5
const BCH_BALANCE = 2.5
const CONVERSION_RATE = 0.015

export default function Exchange() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [amount, setAmount] = useState("0")
  const [fromCurrency, setFromCurrency] = useState("BTC")
  const [toCurrency, setToCurrency] = useState("BCH")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(0.5) // Default 0.5%
  const [showSlippageModal, setShowSlippageModal] = useState(false)

  const keypadButtons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "back"]

  const convertedAmount = useMemo(() => {
    const numAmount = Number.parseFloat(amount) || 0
    if (fromCurrency === "BTC" && toCurrency === "BCH") {
      return (numAmount * CONVERSION_RATE).toFixed(6)
    } else if (fromCurrency === "BCH" && toCurrency === "BTC") {
      return (numAmount / CONVERSION_RATE).toFixed(6)
    }
    return "0"
  }, [amount, fromCurrency, toCurrency])

  const minimumReceived = useMemo(() => {
    const converted = Number.parseFloat(convertedAmount)
    const slippageMultiplier = 1 - slippageTolerance / 100
    return (converted * slippageMultiplier).toFixed(6)
  }, [convertedAmount, slippageTolerance])

  const currentBalance = useMemo(() => {
    return fromCurrency === "BTC" ? BTC_BALANCE : BCH_BALANCE
  }, [fromCurrency])

  const handleKeypad = useCallback((value: string) => {
    if (value === "backspace") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"))
    } else if (value === "*") {
      setAmount((prev) => (prev.includes(".") ? prev : prev + "."))
    } else {
      setAmount((prev) => (prev === "0" ? value : prev + value))
    }
  }, [])

  const handleCurrencySwap = useCallback(() => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }, [fromCurrency, toCurrency])

  const handleMin = useCallback(() => {
    setAmount("0.0001")
  }, [])

  const handleMax = useCallback(() => {
    setAmount(currentBalance.toString())
  }, [currentBalance])

  const handlePreviewConvert = useCallback(() => {
    const numAmount = Number.parseFloat(amount)
    if (numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter an amount greater than 0")
      return
    }
    if (numAmount > currentBalance) {
      Alert.alert("Insufficient Balance", `You only have ${currentBalance} ${fromCurrency} available`)
      return
    }
    setShowPreviewModal(true)
  }, [amount, currentBalance, fromCurrency])

  const handleConfirmConvert = useCallback(() => {
    setShowPreviewModal(false)
    Alert.alert("Success", `Successfully converted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency}`)
    setAmount("0")
  }, [amount, fromCurrency, convertedAmount, toCurrency])

  const handleSlippagePreset = useCallback((value: number) => {
    setSlippageTolerance(value)
  }, [])

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollViewContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#84C718", "#09791A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerSection}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/home")} style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M15 18L9 12L15 6" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Swap</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setShowSlippageModal(true)} style={styles.settingsButton}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="#fff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                  stroke="#fff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/bridge")} style={styles.bridgeButton}>
              <Text style={styles.bridgeButtonText}>Bridge</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exchange Container */}
        <View style={styles.exchangeContainer}>
          {/* You Send Section */}
          <View style={[styles.currencyCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>You Send</Text>
              <Text style={[styles.cardBalance, { color: colors.textSecondary }]}>
                Balance: {currentBalance} {fromCurrency}
              </Text>
            </View>
            <View style={styles.currencySelection}>
              <View style={styles.currencyBox}>
                {fromCurrency === "BTC" ? (
                  <View style={styles.bitcoinIcon}>
                    <BitcoinIcon />
                  </View>
                ) : (
                  <View style={styles.bchIcon}>
                    <BchIcon />
                  </View>
                )}
                <Text style={[styles.currencyText, { color: colors.text }]}>{fromCurrency}</Text>
              </View>
              <Text style={[styles.amountDisplay, { color: colors.text }]}>{amount}</Text>
            </View>
          </View>

          {/* Swap Button - Center */}
          <View style={styles.swapButtonContainer}>
            <TouchableOpacity onPress={handleCurrencySwap} activeOpacity={0.7}>
              <View style={[styles.swapButton, { backgroundColor: colors.background }]}>
                <SwapIcon />
              </View>
            </TouchableOpacity>
          </View>

          {/* You Receive Section */}
          <View style={[styles.currencyCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>You Receive</Text>
              <Text style={[styles.cardBalance, { color: colors.textSecondary }]}>
                ~{convertedAmount} {toCurrency}
              </Text>
            </View>
            <View style={styles.currencySelection}>
              <Text style={[styles.amountDisplay, { color: colors.text }]}>{convertedAmount}</Text>
              <View style={styles.currencyBox}>
                <Text style={[styles.currencyText, { color: colors.text }]}>{toCurrency}</Text>
                {toCurrency === "BTC" ? (
                  <View style={styles.bitcoinIcon}>
                    <BitcoinIcon />
                  </View>
                ) : (
                  <View style={styles.bchIcon}>
                    <BchIcon />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Exchange Details */}
          <View style={[styles.exchangeDetails, { backgroundColor: colors.card }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Exchange Rate</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                1 {fromCurrency} = {CONVERSION_RATE} {toCurrency}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fee</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>0.01%</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Minimum Received</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{minimumReceived} {toCurrency}</Text>
            </View>
          </View>

          {/* Min/Max Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]} onPress={handleMin} activeOpacity={0.7}>
              <Text style={[styles.controlButtonText, { color: colors.text }]}>Min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]} onPress={handleMax} activeOpacity={0.7}>
              <Text style={[styles.controlButtonText, { color: colors.text }]}>Max</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSlippageModal(true)} style={[styles.controlButton, { backgroundColor: colors.card }]} activeOpacity={0.7}>
              <Text style={[styles.controlButtonText, { color: colors.text }]}>Slippage: {slippageTolerance}%</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {[
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            ["*", "0", "backspace"],
          ].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity key={key} style={styles.keypadButton} onPress={() => handleKeypad(key)}>
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

        {/* Preview Convert Button */}
        <TouchableOpacity
          onPress={handlePreviewConvert}
          disabled={Number.parseFloat(amount) <= 0}
          activeOpacity={0.7}
          style={{ opacity: Number.parseFloat(amount) > 0 ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButton}
          >
            <Text style={styles.submitText}>PREVIEW CONVERT</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Slippage Settings Modal */}
        <Modal visible={showSlippageModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Slippage Tolerance</Text>

              <Text style={[styles.slippageDescription, { color: colors.textSecondary }]}>
                Your transaction will revert if the price changes unfavorably by more than this percentage.
              </Text>

              <View style={styles.slippagePresets}>
                {[0.1, 0.5, 1.0].map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.slippagePresetButton,
                      { borderColor: colors.border },
                      slippageTolerance === preset && styles.slippagePresetButtonActive,
                    ]}
                    onPress={() => handleSlippagePreset(preset)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.slippagePresetText,
                        { color: colors.text },
                        slippageTolerance === preset && styles.slippagePresetTextActive,
                      ]}
                    >
                      {preset}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.slippageCustomContainer}>
                <Text style={[styles.slippageCustomLabel, { color: colors.textSecondary }]}>Custom</Text>
                <View style={[styles.slippageCustomInput, { borderColor: colors.border }]}>
                  <Text style={[styles.slippageCustomValue, { color: colors.text }]}>{slippageTolerance}%</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setShowSlippageModal(false)} activeOpacity={0.7}>
                <LinearGradient
                  colors={["#84C718", "#09791A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.slippageCloseButton}
                >
                  <Text style={styles.slippageCloseButtonText}>DONE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showPreviewModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Conversion</Text>

              <View style={styles.previewDetails}>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>From</Text>
                  <Text style={[styles.previewValue, { color: colors.text }]}>
                    {amount} {fromCurrency}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>To</Text>
                  <Text style={[styles.previewValue, { color: colors.text }]}>
                    {convertedAmount} {toCurrency}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Exchange Rate</Text>
                  <Text style={[styles.previewValue, { color: colors.text }]}>
                    1 {fromCurrency} = {CONVERSION_RATE} {toCurrency}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Slippage Tolerance</Text>
                  <Text style={[styles.previewValue, { color: colors.text }]}>{slippageTolerance}%</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Minimum Received</Text>
                  <Text style={[styles.previewValue, { color: colors.text }]}>
                    {minimumReceived} {toCurrency}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Fee</Text>
                  <Text style={[styles.previewValue, { color: colors.text }]}>0.1%</Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowPreviewModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirmConvert} activeOpacity={0.7}>
                  <LinearGradient
                    colors={["#84C718", "#09791A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.modalButton, styles.confirmButton]}
                  >
                    <Text style={styles.confirmButtonText}>CONFIRM</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerSection: {
    paddingTop: 30,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bridgeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  bridgeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  exchangeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  currencyCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardBalance: {
    fontSize: 12,
    fontWeight: "400",
  },
  currencySelection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currencyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountDisplay: {
    fontSize: 20,
    fontWeight: "600",
  },
  swapButtonContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exchangeDetails: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 8,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bitcoinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
  },
  bchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  keypad: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  keypadButton: {
    width: "30%",
    aspectRatio: 1.2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A3A3C",
    borderRadius: 10,
  },
  keypadText: {
    fontSize: 24,
    fontWeight: "400",
  },
  submitButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  slippageDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  slippagePresets: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  slippagePresetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slippagePresetButtonActive: {
    backgroundColor: "#84C718",
    borderColor: "#84C718",
  },
  slippagePresetText: {
    fontSize: 14,
    fontWeight: "600",
  },
  slippagePresetTextActive: {
    color: "#fff",
  },
  slippageCustomContainer: {
    marginBottom: 24,
  },
  slippageCustomLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  slippageCustomInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  slippageCustomValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  slippageCloseButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  slippageCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  previewDetails: {
    gap: 16,
    marginBottom: 24,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "600",
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
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {},
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
