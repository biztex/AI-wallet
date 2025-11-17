"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const RECOVERY_WORDS = [
  "gloom",
  "police",
  "month",
  "stamp",
  "viable",
  "claim",
  "hospital",
  "heart",
  "alcohol",
  "off",
  "ocean",
  "ghost",
] as const

export default function RecoveryPhrase() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const handleVerify = useCallback(() => {
    router.push("/recovery-verify")
  }, [router])

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const renderWord = useCallback(
    (word: string, index: number) => (
      <View key={index} style={styles.wordRow}>
        <View style={[styles.numberBox, { backgroundColor: colors.primary }]}>
          <Text style={[styles.numberText, { color: colors.background }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
      </View>
    ),
    [colors],
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back Button */}
      <View style={[styles.headerContainer, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recovery Phrase</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>This Is Your Recovery Phrase</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Make sure to write it down as shown here.{"\n"}You have to verify this later.
        </Text>
      </View>

      {/* Words Grid */}
      <View style={styles.wordsContainer}>{RECOVERY_WORDS.map(renderWord)}</View>

      {/* Verify Button */}
      <TouchableOpacity onPress={handleVerify} activeOpacity={0.7}>
        <LinearGradient
          colors={["#84C718", "#09791A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.verifyButton}
        >
          <Text style={styles.verifyButtonText}>CONTINUE</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingHorizontal: 0,
    paddingBottom: 16,
    marginBottom: 20,
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
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  wordsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  wordRow: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  numberBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: {
    fontSize: 14,
    fontWeight: "600",
  },
  wordText: {
    fontSize: 16,
    fontWeight: "500",
  },
  verifyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
