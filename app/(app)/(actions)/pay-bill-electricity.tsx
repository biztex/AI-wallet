"use client"

import { IkejaIcon } from "@/components/Icons/ikeja"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const PROVIDERS = [
  { id: "eedc", name: "EEDC - Enugu Electricity" },
  { id: "ikedc", name: "IKEDC - Ikeja Electric" },
  { id: "ekedc", name: "EKEDC - Eko Electricity" },
  { id: "phed", name: "PHED - Port Harcourt Electric" },
]

const PACKAGES = [
  { id: "prepaid", name: "Prepaid" },
  { id: "postpaid", name: "Postpaid" },
]

const RECENT_PURCHASES = [
  { id: "1", name: "Airtime Recharge", ref: "#26247878", time: "10:30 AM" },
  { id: "2", name: "Data Purchase", ref: "#26247877", time: "10:25 AM" },
  { id: "3", name: "Electricity Bill", ref: "#26247876", time: "10:20 AM" },
]

export default function PayBillElectricityScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const ENABLED_BUTTON_GRADIENT: [string, string] = ["#84C718", "#09791A"]

  const [meterNumber, setMeterNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<(typeof PROVIDERS)[number] | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<(typeof PACKAGES)[number] | null>(null)
  const [showProviderModal, setShowProviderModal] = useState(false)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const isFormValid = useMemo(() => {
    return selectedProvider !== null && selectedPackage !== null && meterNumber !== "" && amount !== ""
  }, [selectedProvider, selectedPackage, meterNumber, amount])

  const handlePay = useCallback(() => {
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

  const renderRecentItem = ({ item }: { item: (typeof RECENT_PURCHASES)[0] }) => (
    <View style={[styles.recentItem, { backgroundColor: colors.card }]}>
      <View style={styles.recentLeft}>
        <IkejaIcon />
        <View style={styles.recentInfo}>
          <Text style={[styles.recentName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.recentRef, { color: colors.textSecondary }]}>Ref: {item.ref}</Text>
        </View>
      </View>
      <Text style={[styles.recentTime, { color: colors.textSecondary }]}>{item.time}</Text>
    </View>
  )

  const keyExtractor = (item: { id: string }) => item.id

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pay Electricity</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>
          <TouchableOpacity
            style={[styles.dropdownContainer, { backgroundColor: colors.card }]}
            onPress={() => setShowProviderModal(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.dropdownPlaceholder, { color: selectedProvider ? colors.text : colors.textSecondary }]}
            >
              {selectedProvider ? selectedProvider.name : "Choose Provider"}
            </Text>
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M5 7.5L10 12.5L15 7.5"
                stroke={colors.textSecondary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dropdownContainer, { backgroundColor: colors.card }]}
            onPress={() => setShowPackageModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownPlaceholder, { color: selectedPackage ? colors.text : colors.textSecondary }]}>
              {selectedPackage ? selectedPackage.name : "Select Package"}
            </Text>
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M5 7.5L10 12.5L15 7.5"
                stroke={colors.textSecondary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Meter Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0123456789"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={meterNumber}
              onChangeText={setMeterNumber}
              maxLength={15}
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
            onPress={handlePay}
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
                {isProcessing ? "PROCESSING..." : "PAY"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <Text style={[styles.recentTitle, { color: colors.text }]}>Recent Purchases</Text>
          <FlatList
            data={RECENT_PURCHASES}
            renderItem={renderRecentItem}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
            contentContainerStyle={styles.recentList}
          />
        </View>
      </ScrollView>

      <Modal visible={showProviderModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Provider</Text>
            {PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedProvider(provider)
                  setShowProviderModal(false)
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{provider.name}</Text>
                {selectedProvider?.id === provider.id && (
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
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowProviderModal(false)}>
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

      <Modal visible={showPackageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Package</Text>
            {PACKAGES.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedPackage(pkg)
                  setShowPackageModal(false)
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{pkg.name}</Text>
                {selectedPackage?.id === pkg.id && (
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
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowPackageModal(false)}>
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
            <Text style={[styles.successMessage, { color: colors.text }]}>Electricity bill payment successful.</Text>
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
  formSection: { gap: 16, marginBottom: 32 },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownPlaceholder: { fontSize: 14, flex: 1 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: "600" },
  input: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56, fontSize: 14 },
  payButton: { borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", marginTop: 16 },
  payButtonText: { fontSize: 16, fontWeight: "700" },
  recentSection: { marginBottom: 20 },
  recentTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  recentList: { gap: 12 },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  recentInfo: { flex: 1, gap: 2 },
  recentName: { fontSize: 14, fontWeight: "600" },
  recentRef: { fontSize: 12 },
  recentTime: { fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "70%", paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dropdownOptionText: { fontSize: 16, fontWeight: "600" },
  modalCloseButton: { marginTop: 20 },
  modalCloseButtonGradient: { borderRadius: 16, height: 50, justifyContent: "center", alignItems: "center" },
  modalCloseButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
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
