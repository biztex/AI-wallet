"use client"

import { ScanIcon } from "@/components/Icons/scan"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { Ionicons } from "@expo/vector-icons"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { Alert, Animated, Button, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const BARCODE_TYPES = ["qr"]
const SCAN_FRAME_SIZE = 280
const CORNER_SIZE = 40
const CORNER_BORDER_WIDTH = 4

export default function ScanQRCodeScreen() {
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const scanLineAnim = useRef(new Animated.Value(0)).current
  const cornerScaleAnim = useRef(new Animated.Value(1)).current
  const successScaleAnim = useRef(new Animated.Value(0)).current
  const successOpacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }
  }, [scanned, scanLineAnim])

  useEffect(() => {
    if (!scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cornerScaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(cornerScaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }
  }, [scanned, cornerScaleAnim])

  const handleBarCodeScanned = useCallback(
    ({ type, data }: { type: string; data: string }) => {
      if (scanned) return

      setScanned(true)

      Vibration.vibrate(100)

      // Success animation
      Animated.parallel([
        Animated.spring(successScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(successOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      setTimeout(() => {
        Alert.alert(
          "QR Code Scanned Successfully",
          `Data: ${data}`,
          [
            {
              text: "Scan Again",
              onPress: () => {
                setScanned(false)
                successScaleAnim.setValue(0)
                successOpacityAnim.setValue(0)
              },
            },
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
          { cancelable: false },
        )
      }, 500)
    },
    [router, scanned, successScaleAnim, successOpacityAnim],
  )

  const handleRequestPermission = useCallback(async () => {
    try {
      await requestPermission()
    } catch (error) {
      console.error("[DEV] Error requesting camera permission:", error)
      Alert.alert("Error", "Failed to request camera permission. Please try again.")
    }
  }, [requestPermission])

  const toggleTorch = useCallback(() => {
    setTorchEnabled((prev) => !prev)
  }, [])

  const handleBackPress = useCallback(() => {
    router.push("/home")
  }, [router])

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Scan QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, { color: colors.text }]}>Loading camera...</Text>
        </View>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Scan QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, { color: colors.text }]}>We need your permission to use the camera</Text>
          <Button onPress={handleRequestPermission} title="Grant Permission" color={colors.primary} />
        </View>
      </View>
    )
  }

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_FRAME_SIZE - 4],
  })

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Scan QR Code</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          enableTorch={torchEnabled}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: BARCODE_TYPES as unknown as any,
          }}
        >
          <View style={styles.overlay}>
            <Text style={styles.instructionText}>Position QR code within the frame</Text>

            <View
              style={[
                styles.scanFrame,
                {
                  borderColor: scanned ? colors.primary : colors.textSecondary + "4D",
                  borderWidth: 2,
                },
              ]}
            >
              {!scanned && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      backgroundColor: colors.primary,
                      transform: [{ translateY: scanLineTranslateY }],
                    },
                  ]}
                />
              )}

              <Animated.View
                style={[
                  styles.corner,
                  styles.cornerTopLeft,
                  { borderColor: scanned ? colors.primary : "#4CAF50", transform: [{ scale: cornerScaleAnim }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.corner,
                  styles.cornerTopRight,
                  { borderColor: scanned ? colors.primary : "#4CAF50", transform: [{ scale: cornerScaleAnim }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.corner,
                  styles.cornerBottomLeft,
                  { borderColor: scanned ? colors.primary : "#4CAF50", transform: [{ scale: cornerScaleAnim }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.corner,
                  styles.cornerBottomRight,
                  { borderColor: scanned ? colors.primary : "#4CAF50", transform: [{ scale: cornerScaleAnim }] },
                ]}
              />

              {scanned && (
                <Animated.View
                  style={[
                    styles.successIndicator,
                    {
                      backgroundColor: colors.primary,
                      transform: [{ scale: successScaleAnim }],
                      opacity: successOpacityAnim,
                    },
                  ]}
                >
                  <Ionicons name="checkmark" size={60} color="#FFFFFF" />
                </Animated.View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.torchButton, { backgroundColor: torchEnabled ? colors.primary : colors.card }]}
              onPress={toggleTorch}
            >
              <Ionicons
                name={torchEnabled ? "flash" : "flash-off"}
                size={24}
                color={torchEnabled ? "#FFFFFF" : colors.text}
              />
            </TouchableOpacity>
          </View>
        </CameraView>

        {/* Status Indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <ScanIcon />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {scanned ? "QR Code Detected!" : "Scanning..."}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 40,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.light.text,
  },
  scannerContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: "relative",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#4CAF50",
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderBottomRightRadius: 20,
  },
  successIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
  },
  torchButton: {
    position: "absolute",
    bottom: 180,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 40,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
})
