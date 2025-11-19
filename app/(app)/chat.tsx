"use client"
import { BackButton } from "@/components/Icons/back-button"
import { SendButton } from "@/components/Icons/send-button"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import env from "@/env.json"
import { router } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

// ⭐ ADD THIS IMPORT
import { correctVoiceTranscription } from "@/utils/typo-correction"
import { Feather } from "@expo/vector-icons"
import { Audio } from "expo-av"
import * as FileSystem from "expo-file-system"

const OPENAI_WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions"
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

// Chain ID mapping
const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  eth: 1,
  bsc: 56,
  binance: 56,
  "bnb chain": 56,
  "binance smart chain": 56,
  polygon: 137,
  matic: 137,
  arbitrum: 42161,
  arb: 42161,
  base: 8453,
  solana: 0, // Solana doesn't use chain IDs
  sol: 0,
  bitcoin: 0, // Bitcoin doesn't use chain IDs
  btc: 0,
}

// Normalize chain name to standard format
function normalizeChainName(chainName: string): string {
  const lower = chainName.toLowerCase().trim()
  if (lower.includes("ethereum") || lower === "eth") return "Ethereum"
  if (lower.includes("bsc") || lower.includes("binance") || lower.includes("bnb")) return "BSC"
  if (lower.includes("polygon") || lower === "matic") return "Polygon"
  if (lower.includes("arbitrum") || lower === "arb") return "Arbitrum"
  if (lower === "base") return "Base"
  if (lower.includes("solana") || lower === "sol") return "Solana"
  if (lower.includes("bitcoin") || lower === "btc") return "Bitcoin"
  return chainName
}

// Get chain ID from chain name
function getChainId(chainName: string): number | null {
  const normalized = normalizeChainName(chainName).toLowerCase()
  return CHAIN_IDS[normalized] ?? null
}

const WALLET_ASSISTANT_PROMPT = `
You are a helpful Pucket blockchain wallet assistant with extensive blockchain knowledge. Speak warmly and naturally because each response appears with typewriter animation.
Your role is to help users perform wallet functions: Swap, Send, Receive, and Sell. You must determine which action the user intends and extract ALL required parameters.
SUPPORTED ACTIONS AND REQUIRED PARAMETERS:
1. SWAP - Exchange one token for another
   Required: tokenFrom, tokenTo, amount, chainId
   Example: "I want to swap 100 USDT to ETH on Ethereum"
2. SEND - Transfer tokens to another address
   Required: receiverAddress, token, amount, chainId
   Example: "Send 50 USDT to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb on Ethereum"
3. RECEIVE - Get wallet address to receive tokens
   Required: walletAddress (user's own address)
   Example: "What's my wallet address?" or "I want to receive tokens"
4. SELL - Sell tokens for fiat
   Required: token, amount, chainId
   Example: "I want to sell 1 ETH on Ethereum"
CHAIN SUPPORT:
- Ethereum (chainId: 1)
- BSC / Binance Smart Chain (chainId: 56)
- Polygon (chainId: 137)
- Arbitrum (chainId: 42161)
- Base (chainId: 8453)
- Solana (no chainId)
- Bitcoin (no chainID)

TOKEN NORMALIZATION:
- Ethereum → ETH
- Bitcoin → BTC
- Tether → USDT
- USD Coin → USDC
- Solana → SOL
- BEP → BEP

WORKFLOW FOR EACH ACTION:
1. IDENTIFY ACTION: Determine if user wants Swap, Send, Receive, or Sell from their message.
2. EXTRACT PARAMETERS: Extract all required parameters for the identified action. Ask concise follow-up questions if anything is missing or unclear. Never guess values.

3. CLARIFICATION: If the question is unclear or parameters are missing, ask specific questions. For example:
   - "Which token would you like to swap from?"
   - "What's the recipient's wallet address?"
   - "Which blockchain network should we use?"

4. CONFIRMATION: Once you have ALL required parameters, confirm with the user:
   - Swap: "Just to confirm, you want to swap {amount} {tokenFrom} to {tokenTo} on {chainId}, right?"
   - Send: "Just to confirm, you want to send {amount} {token} to {receiverAddress} on {chainId}, right?"
   - Receive: "Here's your wallet address: {walletAddress}. Would you like to proceed with receiving?"
   - Sell: "Just to confirm, you want to sell {amount} {token} on {chainId}, right?"

5. EXECUTION: If user confirms positively (yes, proceed, confirm, etc.), respond ONLY with this exact JSON format (no other text):
   - Swap: {"action":"swap","tokenFrom":"...","tokenTo":"...","amount":...,"chainId":...}
   - Send: {"action":"send","receiverAddress":"...","token":"...","amount":...,"chainId":...}
   - Receive: {"action":"receive","walletAddress":"..."}
   - Sell: {"action":"sell","token":"...","amount":...,"chainId":...}

6. CANCELLATION: If user says no to confirmation:
   - Ask: "No problem. Would you like to cancel this operation?"
   - If yes: "Okay, the operation has been canceled."
   - If no: "Alright, let's try again. [Ask what they'd like to do]"

IMPORTANT RULES:
- Never skip confirmations. Never output JSON except when the user explicitly confirms.
- Always extract chainId. If user doesn't specify, ask which chain/network they want to use.
- For addresses, validate format (0x for EVM, base58 for Solana).
- Keep sentences short and conversational for typewriter effect.
- If user asks for clarity (just wants to understand), don't proceed - only clarify.
- If user confirms (wants to proceed), then execute the action.
`

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
  const [isThinking, setIsThinking] = useState(false)
  const [actionStatus, setActionStatus] = useState<{
    type: "idle" | "swap" | "send" | "receive" | "sell"
    message: string
  }>({ type: "idle", message: "" })
  const scrollViewRef = useRef<ScrollView>(null)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const recordingWaveAnim = useRef(new Animated.Value(0))
  const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null)
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const conversionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const openAiApiKey =
    env.OPENAI_API_KEY ||
    process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
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
      pulseAnimationRef.current?.stop()
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }
      if (conversionTimeoutRef.current) {
        clearTimeout(conversionTimeoutRef.current)
        conversionTimeoutRef.current = null
      }
      if (actionStatus.type !== "idle") {
        setActionStatus({ type: "idle", message: "" })
      }
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 120)

    return () => clearTimeout(timeout)
  }, [messages])

  useEffect(() => {
    if (isRecording) {
      pulseAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingWaveAnim.current, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(recordingWaveAnim.current, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      )
      pulseAnimationRef.current.start()
    } else {
      pulseAnimationRef.current?.stop()
      recordingWaveAnim.current.setValue(0)
    }
  }, [isRecording])

  const startAssistantTypewriter = useCallback(
    (fullText: string) => {
      if (!fullText) return

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }

      const messageId = `${Date.now()}-bot`
      const timestamp = new Date()

      setMessages((prev) => [...prev, { id: messageId, text: "", sender: "bot", timestamp }])

      let charIndex = 0
      typingIntervalRef.current = setInterval(() => {
        charIndex += 1
        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? { ...message, text: fullText.slice(0, Math.min(charIndex, fullText.length)) }
              : message
          )
        )

        if (charIndex >= fullText.length && typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
      }, 18)
    },
    [setMessages]
  )

  const sendAssistantResponse = useCallback(
    async (conversation: Message[]) => {
      if (!openAiApiKey) {
        Alert.alert("Missing API key", "Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.")
        startAssistantTypewriter("I need an OpenAI API key before I can help. Please add it and try again.")
        return
      }

      try {
        setIsThinking(true)
        const response = await fetch(OPENAI_CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.2,
            messages: [
              { role: "system", content: WALLET_ASSISTANT_PROMPT },
              ...conversation.map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
              })),
            ],
          }),
        })

        if (!response.ok) {
          const errorMessage = await response.text()
          throw new Error(errorMessage)
        }

        const data = await response.json()
        const assistantText = data?.choices?.[0]?.message?.content?.trim()
        setIsThinking(false)

        if (assistantText) {
          // Check if the response is a JSON with an action
          try {
            const jsonMatch = assistantText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0])
              
              // Handle Swap action
              if (parsed.action === "swap" && parsed.tokenFrom && parsed.tokenTo && parsed.amount) {
                // chainId can be a number or chain name string
                const chainId = typeof parsed.chainId === "number" 
                  ? parsed.chainId 
                  : (parsed.chainId ? getChainId(parsed.chainId) : getChainId("ethereum"))
                setActionStatus({ type: "swap", message: "Swapping..." })
                if (conversionTimeoutRef.current) {
                  clearTimeout(conversionTimeoutRef.current)
                }
                conversionTimeoutRef.current = setTimeout(() => {
                  setActionStatus({ type: "idle", message: "" })
                  startAssistantTypewriter("The operation was successful.")
                  conversionTimeoutRef.current = null
                }, 3000)
                return
              }
              
              // Handle Send action
              if (parsed.action === "send" && parsed.receiverAddress && parsed.token && parsed.amount) {
                // chainId can be a number or chain name string
                const chainId = typeof parsed.chainId === "number" 
                  ? parsed.chainId 
                  : (parsed.chainId ? getChainId(parsed.chainId) : getChainId("ethereum"))
                setActionStatus({ type: "send", message: "Sending..." })
                if (conversionTimeoutRef.current) {
                  clearTimeout(conversionTimeoutRef.current)
                }
                conversionTimeoutRef.current = setTimeout(() => {
                  setActionStatus({ type: "idle", message: "" })
                  startAssistantTypewriter("The operation was successful.")
                  conversionTimeoutRef.current = null
                }, 3000)
                return
              }
              
              // Handle Receive action
              if (parsed.action === "receive" && parsed.walletAddress) {
                setActionStatus({ type: "receive", message: "Receiving..." })
                if (conversionTimeoutRef.current) {
                  clearTimeout(conversionTimeoutRef.current)
                }
                conversionTimeoutRef.current = setTimeout(() => {
                  setActionStatus({ type: "idle", message: "" })
                  startAssistantTypewriter("The operation was successful.")
                  conversionTimeoutRef.current = null
                }, 2000)
                return
              }
              
              // Handle Sell action
              if (parsed.action === "sell" && parsed.token && parsed.amount) {
                // chainId can be a number or chain name string
                const chainId = typeof parsed.chainId === "number" 
                  ? parsed.chainId 
                  : (parsed.chainId ? getChainId(parsed.chainId) : getChainId("ethereum"))
                setActionStatus({ type: "sell", message: "Selling..." })
                if (conversionTimeoutRef.current) {
                  clearTimeout(conversionTimeoutRef.current)
                }
                conversionTimeoutRef.current = setTimeout(() => {
                  setActionStatus({ type: "idle", message: "" })
                  startAssistantTypewriter("The operation was successful.")
                  conversionTimeoutRef.current = null
                }, 3000)
                return
              }
            }
          } catch {
            // Not JSON or invalid JSON, treat as normal text
          }
          
          startAssistantTypewriter(assistantText)
        } else {
          startAssistantTypewriter("I didn't receive a message back. Mind asking again?")
        }
      } catch (error) {
        console.error("sendAssistantResponse error", error)
        setIsThinking(false)
        startAssistantTypewriter("I hit a snag while thinking. Please try again in a moment.")
      }
    },
    [openAiApiKey, startAssistantTypewriter]
  )

  const handleSendMessage = useCallback(() => {
    const trimmed = chatMessage.trim()
    if (trimmed === "" || isThinking) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: "user",
      timestamp: new Date(),
    }

    const updatedConversation = [...messages, userMessage]
    setMessages(updatedConversation)
    setChatMessage("")
    sendAssistantResponse(updatedConversation)
  }, [chatMessage, isThinking, messages, sendAssistantResponse])

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
          // Apply typo correction to voice transcription
          const corrected = correctVoiceTranscription(transcription)
          setChatMessage((prev) => (prev ? `${prev} ${corrected}` : corrected))
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
            {/* {message.sender === "bot" && (
              <View style={styles.avatarContainer}>
                <AssistantAvatarIcon />
              </View>
            )} */}
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
            {/* {message.sender === "user" && (
              <View style={styles.avatarContainer}>
                <UserAvatarIcon />
              </View>
            )} */}
          </View>
        ))}
        {actionStatus.type !== "idle" && (
          <View style={styles.conversionStatusRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.conversionStatusText, { color: colors.text }]}>
              {actionStatus.message}
            </Text>
          </View>
        )}
        {isThinking && <ThinkingIndicator color={colors.textSecondary} />}
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
          <View style={styles.voiceButtonWrapper}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.voiceButtonWave,
                {
                  opacity: recordingWaveAnim.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.35, 0],
                  }),
                  transform: [
                    {
                      scale: recordingWaveAnim.current.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.35],
                      }),
                    },
                  ],
                },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isRecording && styles.voiceButtonRecording,
                isTranscribing && styles.voiceButtonDisabled,
              ]}
              onPress={handleVoicePress}
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Feather name="mic" size={20} color={isRecording ? "#FFFFFF" : colors.text} />
              )}
            </TouchableOpacity>
          </View>

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

function ThinkingIndicator({ color }: { color: string }) {
  const dotOne = useRef(new Animated.Value(0)).current
  const dotTwo = useRef(new Animated.Value(0)).current
  const dotThree = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const makeAnimation = (animatedValue: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: -4,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.delay(120),
        ])
      )

    const animations = [
      makeAnimation(dotOne, 0),
      makeAnimation(dotTwo, 120),
      makeAnimation(dotThree, 240),
    ]

    animations.forEach((animation) => animation.start())

    return () => {
      animations.forEach((animation) => animation.stop())
    }
  }, [dotOne, dotTwo, dotThree])

  return (
    <View style={styles.thinkingIndicator}>
      {[dotOne, dotTwo, dotThree].map((animValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.thinkingDot,
            {
              backgroundColor: color,
              transform: [{ translateY: animValue }],
            },
          ]}
        />
      ))}
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
    gap: 8,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 8,
  },

  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    overflow: "hidden",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  voiceButtonWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  voiceButtonWave: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 75, 75, 0.45)",
  },
  voiceButtonRecording: {
    backgroundColor: "#FF4B4B",
    borderRadius: 16,
    width: 32,
    height: 32,
  },
  voiceButtonDisabled: {
    opacity: 0.6,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  thinkingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  conversionStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  conversionStatusText: {
    fontSize: 14,
    fontWeight: "500",
  },
})
