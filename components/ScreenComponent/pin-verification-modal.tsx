"use client"

import { DeleteIcon } from "@/components/Icons/delete"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { WalletManager } from "@/utils/wallet-manager"
import { useCallback, useState } from "react"
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

interface PinVerificationModalProps {
  visible: boolean
  onSuccess: () => void
  onCancel: () => void
  title?: string
  subtitle?: string
}

export function PinVerificationModal({
  visible,
  onSuccess,
  onCancel,
  title = "Enter PIN",
  subtitle = "Enter your PIN to continue",
}: PinVerificationModalProps) {
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const handlePinInput = useCallback(
    async (value: string) => {
      if (value.length > 6) return

      setPin(value)
      setError("")

      if (value.length === 6) {
        const isValid = await WalletManager.verifyPIN(value)
        if (isValid) {
          setPin("")
          onSuccess()
        } else {
          setError("Incorrect PIN. Please try again.")
          setPin("")
        }
      }
    },
    [onSuccess],
  )

  const handleCancel = useCallback(() => {
    setPin("")
    setError("")
    onCancel()
  }, [onCancel])

  const renderPinDots = useCallback(() => {
    return (
      <View style={styles.pinDotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              { borderColor: colors.border },
              index < pin.length && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          />
        ))}
      </View>
    )
  }, [pin.length, colors])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>

          {renderPinDots()}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.hiddenInput}
            value={pin}
            onChangeText={handlePinInput}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            secureTextEntry
          />

          <View style={styles.numpadContainer}>
            {[
              ["1", "2", "3"],
              ["4", "5", "6"],
              ["7", "8", "9"],
              ["*", "0", "backspace"],
            ].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.numpadRow}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.numpadButton}
                    onPress={() => {
                      if (key === "backspace") {
                        handlePinInput(pin.slice(0, -1))
                      } else if (key === "*") {
                        // Asterisk functionality can be added here
                      } else {
                        handlePinInput(pin + key)
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    {key === "backspace" ? (
                      <DeleteIcon />
                    ) : (
                      <Text style={[styles.numpadText, { color: colors.text }]}>{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
  },
  pinDotsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: {
    color: "#F44336",
    fontSize: 13,
    marginBottom: 16,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  numpadContainer: {
    width: "100%",
    maxWidth: 280,
    marginBottom: 16,
  },
  numpadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  numpadButton: {
    width: "30%",
    aspectRatio: 1.2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
  },
  numpadText: {
    fontSize: 24,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
})
