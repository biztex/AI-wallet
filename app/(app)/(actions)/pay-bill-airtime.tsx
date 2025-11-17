"use client"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const AVAILABLE_BALANCE = 10378.0

const NETWORK_PROVIDERS = [
  { id: "mtn", name: "MTN", color: "#FFCC00" },
  { id: "9mobile", name: "9mobile", color: "#00A65A" },
  { id: "glo", name: "Glo", color: "#4CAF50" },
  { id: "airtel", name: "Airtel", color: "#FF0000" },
]

const TOPUP_AMOUNTS = [
  { id: "100", value: 100, label: "₦100" },
  { id: "200", value: 200, label: "₦200" },
  { id: "500", value: 500, label: "₦500" },
  { id: "1000", value: 1000, label: "₦1000" },
  { id: "1500", value: 1500, label: "₦1500" },
  { id: "2000", value: 2000, label: "₦2000" },
]

export default function PayBillAirtimeScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const ENABLED_BUTTON_GRADIENT: [string, string] = ["#84C718", "#09791A"]

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedTopup, setSelectedTopup] = useState<number | null>(null)
  const [airtimeAmount, setAirtimeAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const isFormValid = useMemo(() => {
    return selectedNetwork && phoneNumber.length === 11 && airtimeAmount !== ""
  }, [selectedNetwork, phoneNumber, airtimeAmount])

  const handleContinue = useCallback(() => {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Buy Airtime</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select network provider</Text>
          <View style={styles.networkGrid}>
            {NETWORK_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.networkCard,
                  { backgroundColor: colors.card },
                  selectedNetwork === provider.id && { borderWidth: 2, borderColor: colors.primary },
                ]}
                onPress={() => setSelectedNetwork(provider.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.networkIcon, { backgroundColor: provider.color }]}>
                  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                      fill="#FFFFFF"
                    />
                    <Path
                      d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                      fill="#FFFFFF"
                    />
                    <Path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#FFFFFF" />
                  </Svg>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone number</Text>
            <View style={[styles.phoneInputContainer, { backgroundColor: colors.card }]}>
              <TextInput
                style={[styles.phoneInput, { color: colors.text }]}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={11}
              />
              <TouchableOpacity style={styles.contactIcon}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                    stroke={colors.textSecondary}
                    strokeWidth={2}
                  />
                  <Path
                    d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                    stroke={colors.textSecondary}
                    strokeWidth={2}
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.topupSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top up</Text>
            <View style={styles.topupGrid}>
              {TOPUP_AMOUNTS.map((topup) => (
                <TouchableOpacity
                  key={topup.id}
                  style={[
                    styles.topupButton,
                    { backgroundColor: colors.card },
                    selectedTopup === topup.value && {
                      backgroundColor: `${colors.primary}15`,
                      borderWidth: 2,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    setSelectedTopup(topup.value)
                    setAirtimeAmount(topup.value.toString())
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.topupText, { color: selectedTopup === topup.value ? colors.primary : colors.text }]}
                  >
                    {topup.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Amount</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="How much airtime?"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={airtimeAmount}
              onChangeText={setAirtimeAmount}
            />
            <Text style={[styles.balanceText, { color: colors.textSecondary }]}>
              Wallet Balance {formatCurrency(AVAILABLE_BALANCE)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isFormValid || isProcessing}
            activeOpacity={0.8}
            style={{ opacity: !isFormValid && !isProcessing ? 0.5 : 1 }}
          >
            <LinearGradient
              colors={ENABLED_BUTTON_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButton}
            >
              <Text style={[styles.continueButtonText, { color: "#FFFFFF" }]}>
                {isProcessing ? "PROCESSING..." : "Continue"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
            <Text style={[styles.successAmount, { color: colors.text }]}>{formatCurrency(airtimeAmount)}</Text>
            <Text style={[styles.successMessage, { color: colors.text }]}>Airtime purchase successful.</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  networkGrid: { flexDirection: "row", gap: 12, marginBottom: 32, flexWrap: "wrap" },
  networkCard: {
    width: 79,
    height: 79,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  networkIcon: { width: 48, height: 48, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  inputGroup: { gap: 12, marginBottom: 24 },
  inputLabel: { fontSize: 15, fontWeight: "600" },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  phoneInput: { flex: 1, fontSize: 15 },
  contactIcon: { padding: 4 },
  topupSection: { marginBottom: 24 },
  topupGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  topupButton: {
    width: "30%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  topupText: { fontSize: 15, fontWeight: "700" },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  balanceText: { fontSize: 13, marginTop: 8, fontWeight: "600" },
  continueButton: { borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", marginTop: 24 },
  continueButtonText: { fontSize: 16, fontWeight: "700" },
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
  successAmount: { fontSize: 32, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  successMessage: { fontSize: 15, textAlign: "center", marginBottom: 8, fontWeight: "600" },
  transactionId: { fontSize: 13, textAlign: "center", marginBottom: 32, fontWeight: "500" },
  homeButton: { borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", width: "100%" },
  homeButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
})
