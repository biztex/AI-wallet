"use client"
import { BackButton } from "@/components/Icons/back-button"
import { SendButton } from "@/components/Icons/send-button"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { router } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"

// ⭐ ADD THIS IMPORT
import { Feather } from "@expo/vector-icons"
import { Audio } from "expo-av"
import * as FileSystem from "expo-file-system"

const OPENAI_WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions"

type Message = {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function HomeScreen() {
  const [chatMessage, setChatMessage] = useState("")
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const recordingRef = useRef<Audio.Recording | null>(null)

  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const openAiApiKey =
    (globalThis as any)?.process?.env?.EXPO_PUBLIC_OPENAI_API_KEY ??
    (globalThis as any)?.process?.env?.OPENAI_API_KEY ??
    ""

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardVisible(true)
      setKeyboardHeight(e.endCoordinates?.height || 0)
    })
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShow.remove()
      keyboardDidHide.remove()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => null)
      }
    }
  }, [])

  const handleSendMessage = useCallback(() => {
    if (chatMessage.trim() === "") return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: chatMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Chat AI in Development",
      sender: "bot",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, botMessage])
    setChatMessage("")

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [chatMessage])

  const handleMenuPress = useCallback(() => {
    setShowMenuModal(true)
  }, [])

  const handleCloseMenu = useCallback(() => {
    setShowMenuModal(false)
  }, [])

  const handleMenuNavigation = useCallback((route: string) => {
    setShowMenuModal(false)
    router.push(route as any)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync()
      if (!permission.granted) {
        Alert.alert(
          "Microphone access needed",
          "Enable microphone permissions to record voice commands."
        )
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      })

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      recordingRef.current = recording
      setIsRecording(true)
    } catch (error) {
      console.error("startRecording error", error)
      Alert.alert("Recording error", "Unable to start recording. Please try again.")
    }
  }, [])

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current
    if (!recording) return null

    try {
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      recordingRef.current = null
      setIsRecording(false)
      return uri
    } catch (error) {
      console.error("stopRecording error", error)
      Alert.alert("Recording error", "Unable to stop the recording. Please try again.")
      setIsRecording(false)
      return null
    }
  }, [])

  const transcribeAudioAsync = useCallback(
    async (audioUri: string | null) => {
      if (!audioUri) return

      if (!openAiApiKey) {
        Alert.alert("Missing API key", "Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.")
        return
      }

      setIsTranscribing(true)

      try {
        const formData = new FormData()
        formData.append("file", {
          uri: audioUri,
          name: `voice-${Date.now()}.m4a`,
          type: "audio/m4a",
        } as any)
        formData.append("model", "whisper-1")
        formData.append("response_format", "text")

        const response = await fetch(OPENAI_WHISPER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: formData,
        })

        const responseText = await response.text()
        if (!response.ok) {
          throw new Error(responseText)
        }

        const transcription = responseText.trim()
        if (transcription.length > 0) {
          setChatMessage((prev) => (prev ? `${prev} ${transcription}` : transcription))
        }
      } catch (error) {
        console.error("transcribeAudioAsync error", error)
        Alert.alert("Transcription failed", "Unable to convert audio into text.")
      } finally {
        setIsTranscribing(false)
        try {
          await FileSystem.deleteAsync(audioUri, { idempotent: true })
        } catch {
          // ignore cleanup errors
        }
      }
    },
    [openAiApiKey]
  )

  const handleVoicePress = useCallback(async () => {
    if (isTranscribing) return
    if (isRecording) {
      const uri = await stopRecording()
      await transcribeAudioAsync(uri)
      return
    }

    await startRecording()
  }, [isRecording, isTranscribing, startRecording, stopRecording, transcribeAudioAsync])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BackButton />
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>AI Chat</Text>
        </View>
        <View style={styles.menuButtonHeader}>
          <Text style={{ fontSize: 20 }}>🤖</Text>
        </View>
      </View>

      {/* Chat Messages Section */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatMessagesContainer}
        contentContainerStyle={[
          styles.chatMessagesContent,
          { paddingBottom: keyboardVisible ? keyboardHeight + 30 : 100 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === "user" ? styles.userMessageContainer : styles.aiMessageContainer,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === "user"
                  ? [styles.userMessageBubble, { backgroundColor: colors.primary }]
                  : [styles.aiMessageBubble, { backgroundColor: colors.card }],
              ]}
            >
              <Text style={[styles.messageText, { color: message.sender === "user" ? "#FFFFFF" : colors.text }]}>
                {message.text}
              </Text>
            </View>
            {message.sender === "user" && <View style={styles.messageSpacer} />}
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.chatFooter,
          {
            backgroundColor: colors.background,
            bottom: keyboardVisible ? Math.max(0, keyboardHeight - 30) : 0,
          }
        ]}
      >
        {/* Actions (hidden) */}
        <View style={[styles.chatActionsContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.chatActionButton}>
            <Text style={[styles.chatActionText, { color: colors.text }]}>Save response</Text>
          </TouchableOpacity>
          <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.chatActionButton}
            onPress={() => {
              setMessages([])
            }}
          >
            <Text style={[styles.chatActionText, { color: colors.text }]}>Clear Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Input */}
        <View style={[styles.chatInputContainer, { backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.chatInput, { color: colors.text }]}
            placeholder="What can I do for you?"
            placeholderTextColor={colors.textSecondary}
            value={chatMessage}
            onChangeText={setChatMessage}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />

          {/* 🎤 REAL MIC ICON (Feather) */}
          <TouchableOpacity
            style={[
              styles.voiceButton,
              (isRecording || isTranscribing) && { backgroundColor: colors.background, borderRadius: 16 },
            ]}
            onPress={handleVoicePress}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Feather name={isRecording ? "square" : "mic"} size={22} color={colors.text} />
            )}
          </TouchableOpacity>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSendMessage}
          >
            <SendButton />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  menuButtonHeader: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
  },
  headerSpacer: {
    width: 40,
  },

  chatMessagesContainer: {
    flex: 1,
  },
  chatMessagesContent: {
    paddingTop: 16,
    paddingBottom: 100,
    paddingHorizontal: 12,
  },

  messageContainer: {
    marginBottom: 8,
  },
  aiMessageContainer: {
    flexDirection: "row",
    gap: 0,
  },
  userMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  aiMessageBubble: {
    backgroundColor: "#333333",
    borderTopLeftRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: "#2A2A2A",
    borderTopRightRadius: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 19.5,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  messageSpacer: {
    display: "none",
  },

  chatFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 8 : 12,
    backgroundColor: "transparent",
    borderTopWidth: 0,
  },

  chatActionsContainer: {
    display: "none",
  },
  chatActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  actionDivider: {
    width: 1,
    height: 16,
  },
  chatActionText: {
    fontSize: 14,
    fontWeight: "500",
  },

  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: "#1E1E1E",
  },
  chatInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
    color: "#FFFFFF",
  },

  /* 🎤 Mic Button Style */
  voiceButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 2,
    cursor: "pointer",
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
})
