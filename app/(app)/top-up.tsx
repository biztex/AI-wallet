"use client"

import { CanadaBankIcon } from "@/components/Icons/canada-bank"
import { NigeriaBankIcon } from "@/components/Icons/nigeria-bank"
import { PayFastIcon } from "@/components/Icons/payfast"
import { PaypalIcon } from "@/components/Icons/paypal"
import { WesterUnionIcon } from "@/components/Icons/western-union"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Circle, Path } from "react-native-svg"

export default function TopUpScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [selectedMethod, setSelectedMethod] = useState("Bank of Nigeria")

  const handleContinue = () => {
    router.push("/top-up-amount")
  }

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        {/* Bank Transfer Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Bank Transfer</Text>

        <TouchableOpacity
          style={[
            styles.methodCard,
            { backgroundColor: colors.card },
            selectedMethod === "Bank of Nigeria" && { borderWidth: 1, borderColor: colors.primary },
          ]}
          onPress={() => setSelectedMethod("Bank of Nigeria")}
        >
          <View style={styles.methodLeft}>
            <View style={styles.iconContainer}>
              <NigeriaBankIcon />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodName, { color: colors.text }]}>Bank of Nigeria</Text>
              <Text style={[styles.methodAccount, { color: colors.textSecondary }]}>**** **** **** 1121</Text>
            </View>
          </View>
          {selectedMethod === "Bank of Nigeria" && (
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={10} fill="#4CAF50" />
              <Path
                d="M8 12L11 15L16 9"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodCard,
            { backgroundColor: colors.card },
            selectedMethod === "Bank of Canada" && { borderWidth: 1, borderColor: colors.primary },
          ]}
          onPress={() => setSelectedMethod("Bank of Canada")}
        >
          <View style={styles.methodLeft}>
            <View style={styles.iconContainer}>
              <CanadaBankIcon />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodName, { color: colors.text }]}>Bank of Canada</Text>
              <Text style={[styles.methodAccount, { color: colors.textSecondary }]}>**** **** **** 1564</Text>
            </View>
          </View>
          {selectedMethod === "Bank of Canada" && (
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={10} fill="#4CAF50" />
              <Path
                d="M8 12L11 15L16 9"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </TouchableOpacity>

        {/* Other Section */}
        <Text style={[styles.sectionTitle, styles.sectionTitleMargin, { color: colors.text }]}>Other</Text>

        <TouchableOpacity
          style={[
            styles.methodCard,
            { backgroundColor: colors.card },
            selectedMethod === "Paypal" && { borderWidth: 1, borderColor: colors.primary },
          ]}
          onPress={() => setSelectedMethod("Paypal")}
        >
          <View style={styles.methodLeft}>
            <View style={styles.iconContainer}>
              <PaypalIcon />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodName, { color: colors.text }]}>Paypal</Text>
              <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>Easy payment</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodCard,
            { backgroundColor: colors.card },
            selectedMethod === "PayFast" && { borderWidth: 1, borderColor: colors.primary },
          ]}
          onPress={() => setSelectedMethod("PayFast")}
        >
          <View style={styles.methodLeft}>
            <View style={styles.iconContainer}>
              <PayFastIcon />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodName, { color: colors.text }]}>PayFast</Text>
              <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>Easy payment</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodCard,
            { backgroundColor: colors.card },
            selectedMethod === "Western Union" && { borderWidth: 1, borderColor: colors.primary },
          ]}
          onPress={() => setSelectedMethod("Western Union")}
        >
          <View style={styles.methodLeft}>
            <View style={styles.iconContainer}>
              <WesterUnionIcon />
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodName, { color: colors.text }]}>Western Union</Text>
              <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>Easy payment</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.8}>
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>CONTINUE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionTitleMargin: {
    marginTop: 24,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  methodAccount: {
    fontSize: 14,
  },
  methodSubtitle: {
    fontSize: 14,
  },
  footer: {
    padding: 20,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
