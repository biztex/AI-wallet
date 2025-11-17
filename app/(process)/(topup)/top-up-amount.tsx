"use client"

import { DebitIcon } from "@/components/Icons/debit"
import { DeleteIcon } from "@/components/Icons/delete"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const PAYMENT_METHODS = [
  { id: "debit", name: "Debit", balance: "$11,510.00" },
  { id: "credit", name: "Credit Card", balance: "$8,250.00" },
  { id: "bank", name: "Bank Account", balance: "$15,890.00" },
]

export default function TopUpAmountScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [amount, setAmount] = useState("2,256")
  const [selectedQuickAmount, setSelectedQuickAmount] = useState("$6000.00")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)

  const handleNumberPress = (num: string) => {
    if (num === "backspace") {
      setAmount(amount.slice(0, -1))
    } else if (num === "*") {
      // Handle special character if needed
    } else {
      setAmount(amount + num)
    }
  }

  const handleQuickAmount = (quickAmount: string) => {
    setSelectedQuickAmount(quickAmount)
    const numericAmount = quickAmount.replace("$", "").replace(".00", "")
    setAmount(numericAmount)
  }

  const handleConfirm = () => {
    router.push("/top-up-confirmation")
  }

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Top up</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Bank Selection Card */}
        <TouchableOpacity
          style={[styles.bankCard, { backgroundColor: colors.card }]}
          onPress={() => setShowPaymentMethodModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.bankLeft}>
            <DebitIcon />
            <Text style={[styles.bankLabel, { color: colors.text }]}>{selectedPaymentMethod.name}</Text>
          </View>
          <View style={styles.bankRight}>
            <Text style={[styles.bankBalance, { color: colors.text }]}>{selectedPaymentMethod.balance}</Text>
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M5 7.5L10 12.5L15 7.5"
                stroke={colors.text}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </TouchableOpacity>

        {/* Amount Input Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountHeader}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Enter amount:</Text>
            <Text style={[styles.feeText, { color: colors.textSecondary }]}>Top up fee $3.0</Text>
          </View>
          <View style={styles.amountDisplay}>
            <Text style={[styles.currencyText, { color: colors.textSecondary }]}>USD</Text>
            <Text style={[styles.amountText, { color: colors.text }]}>{amount}</Text>
            <View style={[styles.cursor, { backgroundColor: colors.text }]} />
          </View>
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountButtons}>
          {["$1500.00", "$3000.00", "$6000.00"].map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={[
                styles.quickAmountButton,
                { backgroundColor: colors.card },
                selectedQuickAmount === quickAmount && styles.quickAmountButtonActive,
              ]}
              onPress={() => handleQuickAmount(quickAmount)}
            >
              <Text
                style={[
                  styles.quickAmountText,
                  { color: colors.text },
                  selectedQuickAmount === quickAmount && styles.quickAmountTextActive,
                ]}
              >
                {quickAmount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity onPress={handleConfirm} activeOpacity={0.8}>
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>CONFIRM</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Custom Keypad */}
        <View style={styles.keypad}>
          {[
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            ["*", "0", "backspace"],
          ].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity key={key} style={styles.keypadButton} onPress={() => handleNumberPress(key)}>
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

      <Modal visible={showPaymentMethodModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Payment Method</Text>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentMethodOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedPaymentMethod(method)
                  setShowPaymentMethodModal(false)
                }}
                activeOpacity={0.7}
              >
                <View style={styles.paymentMethodLeft}>
                  <DebitIcon />
                  <View>
                    <Text style={[styles.paymentMethodName, { color: colors.text }]}>{method.name}</Text>
                    <Text style={[styles.paymentMethodBalance, { color: colors.textSecondary }]}>{method.balance}</Text>
                  </View>
                </View>
                {selectedPaymentMethod.id === method.id && (
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
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowPaymentMethodModal(false)}>
              <Text style={styles.modalCloseButtonText}>CLOSE</Text>
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
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
    color: "#000000",
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
  bankLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  bankRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bankBalance: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  amountSection: {
    marginBottom: 24,
  },
  amountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: "#888888",
  },
  feeText: {
    fontSize: 14,
    color: "#888888",
  },
  amountDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencyText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#888888",
  },
  amountText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#000000",
  },
  cursor: {
    width: 2,
    height: 48,
    backgroundColor: "#000000",
  },
  quickAmountButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  quickAmountButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  quickAmountButtonActive: {
    backgroundColor: "#4CAF50",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  quickAmountTextActive: {
    color: "#FFFFFF",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
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
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  paymentMethodOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "600",
  },
  paymentMethodBalance: {
    fontSize: 13,
  },
  modalCloseButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
