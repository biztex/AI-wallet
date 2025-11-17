"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from "expo-camera"
import * as ImageManipulator from "expo-image-manipulator"
import { useRouter } from "expo-router"
import { useRef, useState } from "react"
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export default function CameraScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [facing, setFacing] = useState<CameraType>("back")
  const [flash, setFlash] = useState<FlashMode>("off")
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView>(null)

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, { color: colors.text }]}>
            We need your permission to access the camera
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={[styles.permissionButtonText, { color: colors.background }]}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"))
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
        })

        if (photo) {
          const screenWidth = Dimensions.get("window").width
          const frameWidth = Math.min(screenWidth - 40, 350)
          const frameSize = frameWidth

          const photoAspectRatio = photo.width / photo.height
          const screenAspectRatio = screenWidth / Dimensions.get("window").height

          let cropX, cropY, cropWidth, cropHeight

          if (photoAspectRatio > screenAspectRatio) {
            cropHeight = photo.height
            cropWidth = photo.height * screenAspectRatio
            cropX = (photo.width - cropWidth) / 2
            cropY = 0
          } else {
            cropWidth = photo.width
            cropHeight = photo.width / screenAspectRatio
            cropX = 0
            cropY = (photo.height - cropHeight) / 2
          }

          const frameRatio = frameSize / screenWidth
          const squareSize = cropWidth * frameRatio
          const squareX = cropX + (cropWidth - squareSize) / 2
          const squareY = cropY + (cropHeight - squareSize) / 2

          const croppedPhoto = await ImageManipulator.manipulateAsync(
            photo.uri,
            [
              {
                crop: {
                  originX: squareX,
                  originY: squareY,
                  width: squareSize,
                  height: squareSize,
                },
              },
            ],
            { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
          )

          router.push({
            pathname: "/confirm-photo",
            params: { photoUri: croppedPhoto.uri },
          })
        }
      } catch (error) {
        console.error("[DEV] Error capturing photo:", error)
        Alert.alert("Error", "Failed to capture photo. Please try again.")
      }
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CameraView ref={cameraRef} style={styles.cameraView} facing={facing} flash={flash}>
        {/* Header Controls */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/select-id-type")}
            style={[styles.backButton, { backgroundColor: "rgba(255, 255, 255, 0.2)" }]}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M15 18L9 12L15 6" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            {/* Flash Toggle */}
            <TouchableOpacity
              onPress={toggleFlash}
              style={[styles.headerButton, flash === "on" && styles.headerButtonActive]}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={flash === "on" ? "#FFFFFF" : "none"}
                />
              </Svg>
            </TouchableOpacity>

            {/* Camera Flip */}
            <TouchableOpacity style={styles.headerButton} onPress={toggleCameraFacing}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 17C14.2091 17 16 15.2091 16 13C16 10.79086 14.2091 9 12 9C9.79086 9 8 10.79086 8 13C8 15.2091 9.79086 17 12 17Z"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionText, { color: colors.background }]}>
            Place the{" "}
            <Text style={[styles.highlightText, { color: colors.primary }]}>information Page of Passport</Text> in the
            frame
          </Text>
        </View>

        {/* Document Frame Overlay */}
        <View style={styles.frameContainer}>
          <View style={[styles.frame, { borderColor: colors.background }]} />
        </View>

        {/* Capture Button */}
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={[
              styles.captureButton,
              { backgroundColor: colors.background, borderColor: colors.background + "4D" },
            ]}
            onPress={handleCapture}
          >
            <View style={[styles.captureButtonInner, { backgroundColor: colors.background }]} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  cameraView: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 26,
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  instructionText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 26,
  },
  highlightText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  frameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  frame: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 350,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
  },
})
