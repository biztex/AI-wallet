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

// Detect if a message is a confirmation request and extract action parameters
function isConfirmationMessage(text: string): {
  isConfirmation: boolean
  actionType?: "swap" | "send" | "receive" | "sell"
  params?: any
} {
  const lower = text.toLowerCase().trim()
  
  // SWAP confirmation pattern: "Just to confirm, you want to swap {amount} {tokenFrom} to {tokenTo} on {chainName}, right?"
  if (lower.includes("just to confirm") && lower.includes("swap") && lower.includes("to") && lower.includes("on") && lower.includes("right?")) {
    // Extract amount and tokens
    const swapMatch = text.match(/swap\s+([\d.]+)\s+(\w+)\s+to\s+(\w+)\s+on\s+([^,]+)/i)
    if (swapMatch) {
      return {
        isConfirmation: true,
        actionType: "swap",
        params: {
          amount: swapMatch[1],
          tokenFrom: swapMatch[2],
          tokenTo: swapMatch[3],
          chainName: swapMatch[4].trim(),
        },
      }
    }
  }
  
  // SEND confirmation pattern: "Just to confirm, you want to send {amount} {token} to {receiverAddress} on {chainName}, right?"
  if (lower.includes("just to confirm") && lower.includes("send") && lower.includes("to") && lower.includes("on") && lower.includes("right?")) {
    const sendMatch = text.match(/send\s+([\d.]+)\s+(\w+)\s+to\s+(0x[a-fA-F0-9]{40}|[A-HJ-NP-Za-km-z1-9]{32,44}|[A-HJ-NP-Za-km-z1-9]{26,})\s+on\s+([^,]+)/i)
    if (sendMatch) {
      return {
        isConfirmation: true,
        actionType: "send",
        params: {
          amount: sendMatch[1],
          token: sendMatch[2],
          receiverAddress: sendMatch[3],
          chainName: sendMatch[4].trim(),
        },
      }
    }
  }
  
  // RECEIVE confirmation pattern: "Would you like to proceed with receiving?"
  if (lower.includes("would you like to proceed with receiving") || lower.includes("proceed with receiving")) {
    return {
      isConfirmation: true,
      actionType: "receive",
      params: {},
    }
  }
  
  // SELL confirmation pattern: "Just to confirm, you want to sell {amount} {token} on {chainName}, right?"
  if (lower.includes("just to confirm") && lower.includes("sell") && lower.includes("on") && lower.includes("right?")) {
    const sellMatch = text.match(/sell\s+([\d.]+)\s+(\w+)\s+on\s+([^,]+)/i)
    if (sellMatch) {
      return {
        isConfirmation: true,
        actionType: "sell",
        params: {
          amount: sellMatch[1],
          token: sellMatch[2],
          chainName: sellMatch[3].trim(),
        },
      }
    }
  }
  
  return { isConfirmation: false }
}

// AI-based confirmation judgment prompt
const CONFIRMATION_JUDGE_PROMPT = `
You are a confirmation judge. Your job is to determine if a user agrees or disagrees with a confirmation request.

The assistant just asked the user to confirm an action with a message like:
- "Just to confirm, you want to swap 10 ETH to USDT on Ethereum, right?"
- "Just to confirm, you want to send 5 ETH to 0x1234... on Ethereum, right?"
- "Would you like to proceed with receiving?"
- "Just to confirm, you want to sell 100 USDT on Polygon, right?"

The user responded with: "{userResponse}"

Your task:
1. Determine if the user AGREES or DISAGREES with the confirmation
2. Respond with ONLY a JSON object in this exact format:
{
  "agrees": true or false,
  "reason": "brief reason for your judgment"
}

Examples:
- User says "yes", "yep", "sure", "correct", "right", "go ahead", "do it" → agrees: true
- User says "no", "cancel", "wrong", "stop", "don't" → agrees: false
- User asks a clarifying question → agrees: false (they need more info)
- User makes a correction → agrees: false (they want changes)

Respond ONLY with the JSON object, nothing else.
`

const WALLET_ASSISTANT_PROMPT = `
You are a helpful Pucket wallet assistant with extensive blockchain knowledge. 
Speak warmly and naturally because each response appears with typewriter animation.
Your job is to help users perform blockchain wallet actions: Swap, Send, Receive, and Sell.
Follow all rules below.
====================================================
SUPPORTED ACTIONS AND REQUIRED PARAMETERS
====================================================
1. SWAP — Exchange one token for another  
   Required: tokenFrom, tokenTo, amount, chainId  
2. SEND — Transfer tokens to another address  
   Required: receiverAddress, token, amount, chainId  
3. RECEIVE — Show the user’s receiving wallet address  
   Required from the user: nothing  
4. SELL — Sell crypto for fiat  
   Required: token, amount, chainId  
====================================================
CHAIN SUPPORT
====================================================
- Ethereum (chainId: 1)
- BSC (chainId: 56)
- Polygon (chainId: 137)
- Arbitrum (chainId: 42161)
- Base (chainId: 8453)
- Solana (no chainId)
- Bitcoin (no chainId)
====================================================
TOKEN NORMALIZATION
====================================================
Normalize tokens automatically:
- Ethereum → ETH
- Bitcoin → BTC
- Tether → USDT
- USD Coin → USDC
- Solana → SOL
====================================================
NATIVE TOKEN HANDLING (IMPORTANT)
====================================================
These tokens are native and uniquely tied to ONE network:
- BNB → BSC (56)
- MATIC → Polygon (137)
- SOL → Solana (no chainId)
- BTC → Bitcoin (no chainId)
When tokenFrom is one of these:
✔ DO NOT ask for network  
✔ DO NOT treat chainId as missing  
✔ Automatically assign the correct chainId  
ETH is native to multiple networks:
- Ethereum
- Arbitrum
- Base  
When user mentions ETH without a network:
✔ You MUST ask:  
“To confirm, which network would you like to use?”
====================================================
STABLECOIN RULE
====================================================
Stablecoins (USDT, USDC, DAI) appear on multiple networks.
When user swaps or sends them without network:
✔ Ask: “To confirm, which network would you like to use?”
====================================================
ACTION WORKFLOW
====================================================
STEP 1 — IDENTIFY INTENT  
Determine if user wants: Swap, Send, Receive, or Sell.
STEP 2 — EXTRACT PARAMETERS  
Collect all required parameters.
If ANY required parameter is missing *except when chainId is auto-detected from a native token*:
Ask a short confirm-style question.
Examples:
- “To confirm, which token would you like to swap from?”
- “To confirm, how much would you like to send?”
- “To confirm, what is the recipient's wallet address?”
- “To confirm, which network would you like to use?”
STEP 3 — CONFIRMATION  
Once all required details are known, always confirm with EXACTLY these formats:
SWAP:
"Just to confirm, you want to swap {amount} {tokenFrom} to {tokenTo} on {chainName}, right?"
SEND:
"Just to confirm, you want to send {amount} {token} to {receiverAddress} on {chainName}, right?"
RECEIVE:
"Would you like to proceed with receiving?"
SELL:
"Just to confirm, you want to sell {amount} {token} on {chainName}, right?"

IMPORTANT: 
- Output ONLY the confirmation message text, nothing else.
- Do NOT output any JSON after the confirmation message.
- After showing the confirmation message, WAIT for the user's response. 
- Do NOT execute any action until the user confirms positively (yes, confirm, proceed, right, correct, etc.).
- Never output JSON during confirmation.
====================================================
CANCELLATION FLOW
====================================================
If user says NO:
Ask: “Would you like to cancel this operation?”
If YES:
“Okay, the operation has been canceled.”
If NO:
“Alright, let’s try again. What would you like to do?”
====================================================
ADDITIONAL RULES
====================================================
- Receive never asks user for info.  
- Validate EVM addresses (0x...) and Solana base58.  
- Keep responses warm and short.  
- Never ask network if tokenFrom is native and unique.  
- Never skip confirmation.  
- Never output JSON without confirmation.
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
  const [pendingAction, setPendingAction] = useState<{
    type: "swap" | "send" | "receive" | "sell"
    params: any
    confirmationMessage?: string
  } | null>(null)
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
          // Check if the assistant response is a confirmation message
          const confirmation = isConfirmationMessage(assistantText)
          
          // If we found confirmation in text format, extract params from text
          if (confirmation.isConfirmation && confirmation.actionType && confirmation.params) {
            setPendingAction({
              type: confirmation.actionType,
              params: confirmation.params,
              confirmationMessage: assistantText,
            })
            startAssistantTypewriter(assistantText)
            return
          }
          
          // Normal response, no pending action
          setPendingAction(null)
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

  // Ask AI to judge if user agrees or disagrees with confirmation
  const judgeConfirmation = useCallback(
    async (userResponse: string, confirmationMessage: string, conversation: Message[]): Promise<boolean> => {
      if (!openAiApiKey) {
        return false
      }

      try {
        // Build context from recent conversation
        const recentMessages = conversation.slice(-4).map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        }))

        const response = await fetch(OPENAI_CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.1,
            messages: [
              {
                role: "system",
                content: `You are a confirmation judge. Your job is to determine if a user AGREES or DISAGREES with a confirmation request.

The assistant asked the user to confirm an action with this message:
"${confirmationMessage}"

The user responded with:
"${userResponse}"

Your task: Determine if the user AGREES or DISAGREES with the confirmation.

Examples of AGREEMENT:
- "yes", "yep", "sure", "ok", "okay", "confirm", "proceed", "right", "correct", "exactly", "that's right", "do it", "go ahead", "let's go", etc.

Examples of DISAGREEMENT:
- "no", "cancel", "wrong", "stop", "don't", "wait", "not yet", etc.
- Questions or corrections indicate disagreement (they need more info or changes)

Respond with ONLY a JSON object in this exact format:
{
  "agrees": true or false,
  "reason": "brief reason for your judgment"
}

Nothing else, just the JSON object.`,
              },
              ...recentMessages,
            ],
          }),
        })

        if (!response.ok) {
          return false
        }

        const data = await response.json()
        const judgmentText = data?.choices?.[0]?.message?.content?.trim()

        if (judgmentText) {
          try {
            const jsonMatch = judgmentText.match(/\{[\s\S]*"agrees"[\s\S]*\}/)
            if (jsonMatch) {
              const judgment = JSON.parse(jsonMatch[0])
              return judgment.agrees === true
            }
          } catch {
            // JSON parsing failed
          }
        }

        return false
      } catch (error) {
        console.error("judgeConfirmation error", error)
        return false
      }
    },
    [openAiApiKey]
  )

  // Execute action after positive confirmation
  const executeAction = useCallback((actionType: "swap" | "send" | "receive" | "sell", params: any) => {
    // Set appropriate spinner message
    let spinnerMessage = ""
    switch (actionType) {
      case "swap":
        spinnerMessage = "Swapping..."
        break
      case "send":
        spinnerMessage = "Sending..."
        break
      case "receive":
        spinnerMessage = "Receiving..."
        break
      case "sell":
        spinnerMessage = "Selling..."
        break
    }

    setActionStatus({ type: actionType, message: spinnerMessage })
    setPendingAction(null)

    // Clear any existing timeout
    if (conversionTimeoutRef.current) {
      clearTimeout(conversionTimeoutRef.current)
    }

    // After 3 seconds, show success message
    conversionTimeoutRef.current = setTimeout(() => {
      setActionStatus({ type: "idle", message: "" })
      startAssistantTypewriter("Operation successful.")
      conversionTimeoutRef.current = null
    }, 3000)
  }, [startAssistantTypewriter])

  const handleSendMessage = useCallback(async () => {
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

    // If there's a pending action, ask AI to judge if user agrees or disagrees
    if (pendingAction && pendingAction.confirmationMessage) {
      setIsThinking(true)
      const agrees = await judgeConfirmation(trimmed, pendingAction.confirmationMessage, updatedConversation)
      setIsThinking(false)

      if (agrees) {
        // User agreed, execute the action
        executeAction(pendingAction.type, pendingAction.params)
        return
      } else {
        // User disagreed or needs clarification, clear pending action and continue normally
        setPendingAction(null)
        // Continue with normal response
        sendAssistantResponse(updatedConversation)
        return
      }
    }

    // No pending action, continue normally
    sendAssistantResponse(updatedConversation)
  }, [chatMessage, isThinking, messages, sendAssistantResponse, pendingAction, executeAction, judgeConfirmation])

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
