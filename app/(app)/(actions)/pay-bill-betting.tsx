"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export default function PayBillBettingScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const ENABLED_BUTTON_GRADIENT: [string, string] = ["#84C718", "#09791A"]

  const [bettingPlatform, setBettingPlatform] = useState("")
  const [userId, setUserId] = useState("")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const isFormValid = useMemo(() => {
    return bettingPlatform !== "" && userId !== "" && amount !== ""
  }, [bettingPlatform, userId, amount])

  const handleFundAccount = useCallback(() => {
    if (isFormValid && !isProcessing) {
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        setShowSuccessModal(true)
      }, 1000)
    }
  }, [isFormValid, isProcessing])

  const handleBackToHome = useCallback(() => {
    setShowSuccessModal(false)
    router.push("/home")
  }, [router])

  const formatCurrency = useCallback((value: string | number) => {
    const numericValue = typeof value === "number" ? value : Number.parseFloat(value.replace(/[^0-9.]/g, ""))
    if (Number.isNaN(numericValue)) return "₦0.00"
    return `₦${numericValue.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Fund Betting Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Betting Platform</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="e.g Bet9ja, SportyBet"
                placeholderTextColor={colors.textSecondary}
                value={bettingPlatform}
                onChangeText={setBettingPlatform}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>User ID</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter your betting user ID"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={userId}
                onChangeText={setUserId}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Amount</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="₦0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <TouchableOpacity
              onPress={handleFundAccount}
              disabled={!isFormValid || isProcessing}
              activeOpacity={0.8}
              style={{ opacity: isFormValid && !isProcessing ? 1 : 0.5 }}
            >
              <LinearGradient
                colors={ENABLED_BUTTON_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.payButton}
              >
                <Text style={[styles.payButtonText, { color: "#FFFFFF" }]}>
                  {isProcessing ? "PROCESSING..." : "FUND ACCOUNT"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.successModalOverlay}>
          <View style={[styles.successModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
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
            <Text style={[styles.successAmount, { color: colors.text }]}>{formatCurrency(amount)}</Text>
            <Text style={[styles.successMessage, { color: colors.text }]}>Betting account funded successfully.</Text>
            <Text style={[styles.transactionId, { color: colors.textSecondary }]}>Transaction ID: #26247878</Text>
            <TouchableOpacity onPress={handleBackToHome} activeOpacity={0.8} style={{ width: "100%" }}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.homeButton}
              >
                <Text style={styles.homeButtonText}>BACK TO HOME</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  content: { paddingTop: 24, paddingBottom: 40 },
  formSection: { gap: 16 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: "600" },
  input: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56, fontSize: 14 },
  payButton: { borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", marginTop: 16 },
  payButtonText: { fontSize: 16, fontWeight: "700" },
  successModalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
  successModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  successIconContainer: { alignItems: "center", marginBottom: 24 },
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
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  successAmount: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  successMessage: { fontSize: 15, textAlign: "center", marginBottom: 8, fontWeight: "600" },
  transactionId: { fontSize: 12, textAlign: "center", marginBottom: 24, fontWeight: "500" },
  homeButton: { borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", width: "100%" },
  homeButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
})
