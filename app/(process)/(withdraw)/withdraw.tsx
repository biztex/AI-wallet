"use client"

import { BankIcon } from "@/components/Icons/bank"
import { DeleteIcon } from "@/components/Icons/delete"
import { Canada } from "@/components/Icons/flags/canada"
import { Nigeria } from "@/components/Icons/flags/nigeria"
import { UK } from "@/components/Icons/flags/uk"
import { USA } from "@/components/Icons/flags/usa"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Circle, Path } from "react-native-svg"


const BANK_OPTIONS = [
  { id: 1, name: "Bank of America", account: "**** **** **** 1121", country: "USA" },
  { id: 2, name: "Bank of Nigeria", account: "**** **** **** 1121", country: "Nigeria" },
] as const

const COUNTRIES = [
  { id: "usa", name: "USA", flag: USA },
  { id: "nigeria", name: "Nigeria", flag: Nigeria },
  { id: "uk", name: "UK", flag: UK },
  { id: "canada", name: "Canada", flag: Canada },
] as const

const MAX_AMOUNT = 12652
const MIN_AMOUNT = 1
const ACTIVE_OPACITY = 0.7

const formatAmount = (value: number): string => {
  return value.toLocaleString()
}

const parseAmount = (value: string): number => {
  return Number.parseFloat(value.replace(/,/g, "")) || 0
}

export default function WithdrawScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [amount, setAmount] = useState("8256")
  const [showBankModal, setShowBankModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState("Bank of Nigeria")
  const [selectedPercentage, setSelectedPercentage] = useState("100%")
  const [isLoading, setIsLoading] = useState(false)
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [newBankForm, setNewBankForm] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    bvn: "",
    country: "USA",
  })

  const currentAmount = useMemo(() => parseAmount(amount), [amount])

  const handleKeypad = useCallback((value: string) => {
    if (value === "backspace") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : ""))
    } else if (value === ".") {
      setAmount((prev) => (prev.includes(".") ? prev : prev + "."))
    } else {
      setAmount((prev) => {
        const newAmount = prev === "" || prev === "0" ? value : prev + value
        if (parseAmount(newAmount) > MAX_AMOUNT) return prev
        return newAmount
      })
    }
  }, [])

  const handlePercentage = useCallback((percent: number) => {
    const calculatedAmount = Math.floor(MAX_AMOUNT * percent).toString()
    setAmount(calculatedAmount)
  }, [])

  const handleMax = useCallback(() => {
    setAmount(MAX_AMOUNT.toString())
  }, [])

  const handleClear = useCallback(() => {
    setAmount("")
  }, [])

  const handleBankSelect = useCallback((bank: string) => {
    setSelectedBank(bank)
    setShowBankModal(false)
  }, [])

  const handleWithdraw = useCallback(async () => {
    if (currentAmount < MIN_AMOUNT) {
      return
    }

    if (currentAmount > MAX_AMOUNT) {
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setShowSuccessModal(true)
    } catch (error) {
      console.error("[DEV] Withdraw error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentAmount])

  const getBankFlag = useCallback((bankName: string) => {
    if (bankName.includes("America")) return <USA />
    if (bankName.includes("Nigeria")) return <Nigeria />
    if (bankName.includes("UK")) return <UK />
    if (bankName.includes("Canada")) return <Canada />
    return <USA />
  }, [])


  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Withdraw</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Bank Selection Card */}
        <TouchableOpacity
          style={[styles.bankCard, { backgroundColor: colors.card }]}
          onPress={() => setShowBankModal(true)}
          activeOpacity={ACTIVE_OPACITY}
        >
          <View style={styles.bankLeft}>
            {getBankFlag(selectedBank)}
            <View style={styles.bankInfo}>
              <Text style={[styles.bankName, { color: colors.text }]}>{selectedBank}</Text>
              <Text style={[styles.bankAccount, { color: colors.textSecondary }]}>**** **** **** 1121</Text>
            </View>
          </View>
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

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <View style={styles.amountDisplay}>
            <Text style={[styles.amountText, { color: colors.text }]}>${amount}</Text>
            <View style={[styles.cursor, { backgroundColor: colors.text }]} />
          </View>
          <Text style={[styles.maxAmount, { color: colors.textSecondary }]}>Maximum ${formatAmount(MAX_AMOUNT)}</Text>
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity
          onPress={handleWithdraw}
          disabled={isLoading}
          activeOpacity={ACTIVE_OPACITY}
          style={isLoading ? { opacity: 0.6 } : undefined}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.withdrawButton}
          >
            <Text style={[styles.withdrawButtonText, { color: "#FFFFFF" }]}>
              {isLoading ? "PROCESSING..." : "WITHDRAW"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Custom Keypad */}
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
      </View>

      {/* Bank Selection Modal */}
      <Modal visible={showBankModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select your bank</Text>

            {/* Bank Options */}
            {BANK_OPTIONS.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[styles.bankOption, { backgroundColor: colors.background }]}
                onPress={() => handleBankSelect(bank.name)}
                activeOpacity={ACTIVE_OPACITY}
              >
                <View style={styles.bankOptionLeft}>
                  {getBankFlag(bank.name)}
                  <View style={styles.bankOptionInfo}>
                    <Text style={[styles.bankOptionName, { color: colors.text }]}>{bank.name}</Text>
                    <Text style={[styles.bankOptionAccount, { color: colors.textSecondary }]}>{bank.account}</Text>
                  </View>
                </View>
                {selectedBank === bank.name && (
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Circle cx={12} cy={12} r={10} fill={colors.primary} />
                    <Path
                      d="M8 12L11 15L16 9"
                      stroke={colors.background}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </TouchableOpacity>
            ))}

            {/* Add New Bank Option */}
            <TouchableOpacity
              style={[styles.addBankOption, { backgroundColor: colors.background }]}
              onPress={() => {
                setShowBankModal(false)
                setShowAddBankModal(true)
              }}
              activeOpacity={ACTIVE_OPACITY}
            >
              <View style={styles.addBankLeft}>
                <BankIcon />
                <Text style={[styles.addBankText, { color: colors.text }]}>Add new bank</Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke={colors.text}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowBankModal(false)} activeOpacity={ACTIVE_OPACITY}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>CONTINUE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddBankModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.addBankModalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Bank</Text>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: colors.text }]}>Country</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countrySelector}>
                  {COUNTRIES.map((country) => {
                    const FlagComponent = country.flag
                    return (
                      <TouchableOpacity
                        key={country.id}
                        style={[
                          styles.countryOption,
                          { backgroundColor: colors.background },
                          newBankForm.country === country.name && { borderColor: colors.primary, borderWidth: 2 },
                        ]}
                        onPress={() => setNewBankForm({ ...newBankForm, country: country.name })}
                      >
                        <FlagComponent />
                        <Text style={[styles.countryName, { color: colors.text }]}>{country.name}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: colors.text }]}>Bank Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Enter bank name"
                  placeholderTextColor={colors.textSecondary}
                  value={newBankForm.bankName}
                  onChangeText={(text) => setNewBankForm({ ...newBankForm, bankName: text })}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: colors.text }]}>Account Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Enter account number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={newBankForm.accountNumber}
                  onChangeText={(text) => setNewBankForm({ ...newBankForm, accountNumber: text })}
                />
              </View>

              {newBankForm.country !== "Nigeria" && (
                <View style={styles.formField}>
                  <Text style={[styles.label, { color: colors.text }]}>Routing Number</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="Enter routing number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    value={newBankForm.routingNumber}
                    onChangeText={(text) => setNewBankForm({ ...newBankForm, routingNumber: text })}
                  />
                </View>
              )}

              <View style={styles.formField}>
                <Text style={[styles.label, { color: colors.text }]}>BVN (Bank Verification Number)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Enter BVN"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={newBankForm.bvn}
                  onChangeText={(text) => setNewBankForm({ ...newBankForm, bvn: text })}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.background }]}
                  onPress={() => setShowAddBankModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddBankModal(false)
                    setShowBankModal(false)
                  }}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={["#84C718", "#09791A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalButton}
                  >
                    <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>Add Bank</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
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
            <Text style={[styles.successTitle, { color: colors.text }]}>Withdrawal Successful</Text>
            <Text style={[styles.successAmount, { color: colors.text }]}>${amount}</Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Your withdrawal has been initiated successfully
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false)
                router.back()
              }}
              activeOpacity={ACTIVE_OPACITY}
              style={{ width: "100%" }}
            >
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bankCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bankLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bankInfo: {
    gap: 4,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "600",
  },
  bankAccount: {
    fontSize: 14,
  },
  amountSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  amountDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  amountText: {
    fontSize: 48,
    fontWeight: "700",
  },
  cursor: {
    width: 2,
    height: 48,
    marginLeft: 4,
  },
  maxAmount: {
    fontSize: 14,
  },
  withdrawButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  keypadContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
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
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
  },
  bankOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bankOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bankOptionInfo: {
    gap: 4,
  },
  bankOptionName: {
    fontSize: 16,
    fontWeight: "600",
  },
  bankOptionAccount: {
    fontSize: 14,
  },
  addBankOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  addBankLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addBankText: {
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addBankModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  countrySelector: {
    flexDirection: "row",
  },
  countryOption: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 80,
  },
  countryName: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  successButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
