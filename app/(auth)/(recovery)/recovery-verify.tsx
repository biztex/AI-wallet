"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

// Sample recovery phrase words
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
]

export default function RecoveryVerify() {
  const router = useRouter()
  const [selectedWords, setSelectedWords] = useState<number[]>([])
  const [showError, setShowError] = useState(false)
  const [errorWord, setErrorWord] = useState<number | null>(null)
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const handleWordPress = (index: number) => {
    // Check if word is already selected
    if (selectedWords.includes(index)) {
      return
    }

    const newSelected = [...selectedWords, index]
    const expectedIndex = newSelected.length - 1

    // Check if the selected word is in the correct position
    if (index !== expectedIndex) {
      // Wrong order
      setShowError(true)
      setErrorWord(index)
      return
    }

    // Correct selection
    setSelectedWords(newSelected)
    setShowError(false)
    setErrorWord(null)
  }

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const handleBackup = () => {
    // Reset selection
    setSelectedWords([])
    setShowError(false)
    setErrorWord(null)
    router.back()
  }

  const handleVerify = () => {
    if (selectedWords.length === 12) {
      router.push("/backup-complete")
    }
  }

  const isComplete = selectedWords.length === 12

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Verify Recovery</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {showError ? "Wrong Answer" : "This Is Your Recovery Phrase"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {showError
            ? `Sorry, that's not the correct ${selectedWords.length + 1}${getOrdinalSuffix(selectedWords.length + 1)} word. Give it another try.`
            : "Make sure to write it down as shown here.\nYou have to verify this later."}
        </Text>
      </View>

      {/* Words Grid */}
      <View style={styles.wordsContainer}>
        {RECOVERY_WORDS.map((word, index) => {
          const isSelected = selectedWords.includes(index)
          const isError = errorWord === index

          return (
            <TouchableOpacity
              key={index}
              style={styles.wordRow}
              onPress={() => handleWordPress(index)}
              disabled={isSelected}
            >
              <View
                style={[
                  styles.numberBox,
                  { backgroundColor: colors.card },
                  isSelected && { backgroundColor: colors.primary },
                  isError && { backgroundColor: "#F44336" },
                ]}
              >
                <Text
                  style={[
                    styles.numberText,
                    { color: colors.textSecondary },
                    (isSelected || isError) && { color: colors.background },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleVerify}
          disabled={!isComplete}
          activeOpacity={0.7}
          style={{ opacity: isComplete ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.verifyButton}
          >
            <Text style={styles.verifyButtonText}>VERIFY</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) return "st"
  if (j === 2 && k !== 12) return "nd"
  if (j === 3 && k !== 13) return "rd"
  return "th"
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
  buttonContainer: {
    marginBottom: 20,
  },
  backupButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backupButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  verifyButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  verifyButtonFull: {
    flex: 2,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
