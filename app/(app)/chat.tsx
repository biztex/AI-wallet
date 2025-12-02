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

// Extract JSON from AI response text
function extractJSONFromText(text: string): WalletActionPayload | null {
  try {
    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      // Validate that it has an action field
      if (parsed && typeof parsed === "object" && parsed.action) {
        return parsed as WalletActionPayload
      }
    }
  } catch (error) {
    // JSON parsing failed, return null
  }
  return null
}

// Get action display name for progress message
function getActionDisplayName(action: string): string {
  const actionMap: Record<string, string> = {
    swap: "Swap",
    send: "Send",
    buy: "Buy",
    sell: "Sell",
    giftCardTrade: "Gift card trade",
    billPay: "Bill pay",
    receive: "Receive",
  }
  return actionMap[action] || action
}

// Detect if a message is a confirmation request and extract action parameters
function isConfirmationMessage(text: string): {
  isConfirmation: boolean
  actionType?: WalletActionType
  params?: any
} {
  const normalized = text.toLowerCase().trim()
  const hasJustConfirm =
    normalized.includes("just confirm") || normalized.includes("just to confirm")

  if (!hasJustConfirm || !normalized.includes("right?")) {
    return { isConfirmation: false }
  }

  const swapMatch = text.match(
    /swap\s+([\d.,]+)\s+([A-Za-z0-9]+)\s+(?:for|to)\s+([A-Za-z0-9]+)\s+on\s+([^,]+),?\s+right\?/i
  )
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

  const sendMatch = text.match(
    /send\s+([\d.,]+)\s+([A-Za-z0-9]+)\s+to\s+(0x[a-fA-F0-9]{40}|[A-HJ-NP-Za-km-z1-9]{26,44})\s+on\s+([^,]+),?\s+right\?/i
  )
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

  const buyMatch = text.match(
    /buy\s+([$\w\s.,]+?)\s+worth\s+of\s+([A-Za-z0-9]+)\s+on\s+([^,]+),?\s+right\?/i
  )
  if (buyMatch) {
    return {
      isConfirmation: true,
      actionType: "buy",
      params: {
        fiatAmount: buyMatch[1].trim(),
        token: buyMatch[2],
        chainName: buyMatch[3].trim(),
      },
    }
  }

  const sellMatch = text.match(/sell\s+([\d.,]+)\s+([A-Za-z0-9]+)\s+on\s+([^,]+),?\s+right\?/i)
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

  const giftCardMatch = text.match(
    /trade\s+a\s+(.+?)\s+gift\s+card\s+worth\s+([$\w\s.,]+?)(?:\s+(?:in|for)\s+([^,]+))?,?\s+right\?/i
  )
  if (giftCardMatch) {
    return {
      isConfirmation: true,
      actionType: "giftCardTrade",
      params: {
        brand: giftCardMatch[1].trim(),
        amount: giftCardMatch[2].trim(),
        country: giftCardMatch[3]?.trim(),
      },
    }
  }

  const billPayMatch = text.match(
    /pay\s+([$\w\s.,]+)\s+to\s+(.+?)(?:\s+(?:in|for)\s+([^,]+))?,?\s+right\?/i
  )
  if (billPayMatch) {
    return {
      isConfirmation: true,
      actionType: "billPay",
      params: {
        amount: billPayMatch[1].trim(),
        provider: billPayMatch[2].trim(),
        country: billPayMatch[3]?.trim(),
      },
    }
  }

  return { isConfirmation: false }
}

const WALLET_ASSISTANT_PROMPT = `
You are **Pucket**, a warm, highly helpful AI crypto wallet assistant.
Your tone must always feel friendly, human, simple, and beginner-safe.
Assume the user knows nothing about networks, tokens, gas fees, or blockchains.
Automatically simplify, correct mistakes, and guide the user gently.

====================================================
SUPPORTED ACTIONS
====================================================
- Swap crypto
- Send crypto
- Receive crypto
- Buy crypto
- Sell crypto
- Trade gift cards
- Pay bills

If the conversation opens with no action provided, greet them:
"Hello! How can I assist you today? Would you like to swap, send, receive, buy, sell crypto, trade gift cards, or pay bills?"

====================================================
BEGINNER-FRIENDLY BEHAVIOR (STRICT)
====================================================
- Never say "BEP20", "ERC20", "TRC20" unless the *user* said it first.
- If user says "BEP20", interpret it as **Binance Chain (BSC, chainId 56)**.
- Treat "BNB Chain", "Binance Smart Chain", "BEP20", and "BSC" as the **same network**.
- Explain only when necessary, in short and simple human language.
- Default assumption: user is a complete crypto beginner.

====================================================
SUPPORTED CHAINS
====================================================
- Ethereum (1)
- BSC (56)
- Polygon (137)
- Arbitrum (42161)
- Base (8453)
- Solana (no chainId)
- Bitcoin (no chainId)

====================================================
TOKEN NORMALIZATION RULES
====================================================
Convert common names automatically:
- Ethereum → ETH
- Bitcoin → BTC
- Tether → USDT
- USD Coin → USDC
- Solana → SOL

====================================================
NATIVE TOKEN AUTO-NETWORK RULE
====================================================
Never ask for the network when the token is native to one chain:
- BNB → BSC (56)
- MATIC → Polygon (137)
- SOL → Solana
- BTC → Bitcoin

ETH can appear on **Ethereum / Arbitrum / Base**.  
If the user doesn't mention a network, ask:
"To confirm, which network would you like to use for ETH?"

Stablecoins (USDT, USDC, DAI) appear on multiple chains — if network is missing, ask:
"To confirm, which network would you like to use?"

====================================================
ACTION PARAMETERS (VERY IMPORTANT)
====================================================
Collect parameters according to the action:

**Swap:** tokenFrom, tokenTo, amount, chainId  
**Send:** receiverAddress, token, amount, chainId  
**Receive:** token only (show address immediately—no confirmation step)  
**Buy:** token, fiatAmount or cryptoAmount, chainId  
**Sell:** token, amount, chainId  
**Gift Card Trade:** brand, amount, country  
**Bill Pay:** provider, amount, country  

If ANY required parameter is missing, ask a short, warm clarification question:
- "To confirm, which token would you like to send?"
- "To confirm, which network would you like to use?"
- "To confirm, how much would you like to swap?"

Stay warm and human at all times.

====================================================
RECEIVE LOGIC (IMPROVED)
====================================================
When user wants to receive:
1. Ask: "Sure! Which token would you like to receive?"
2. After they answer, show their receiving address and the correct network.
3. Do **not** ask for confirmation.
4. Do **not** say "Would you like to proceed with receiving?"

====================================================
ACTION WORKFLOW
====================================================
1. Detect the user's intent.
2. Extract or request missing parameters.
3. Once you have all required information:
   Output ONLY the confirmation line in this exact format:

**SWAP**
"Just confirm, you want to swap {amount} {tokenFrom} for {tokenTo} on {chainName}, right?"
**SEND**
"Just confirm, you want to send {amount} {token} to {receiverAddress} on {chainName}, right?"
**BUY**
"Just confirm, you want to buy {fiatAmount} worth of {token} on {chainName}, right?"
**SELL**
"Just confirm, you want to sell {amount} {token} on {chainName}, right?"
**GIFT CARD TRADE**
"Just confirm, you want to trade a {brand} gift card worth {amount}, right?"
**BILL PAY**
"Just confirm, you want to pay {amount} to {provider}, right?"

4. After user replies "yes", output ONLY the final JSON.
5. Never output JSON before confirmation.

====================================================
CANCELLATION FLOW
====================================================
If user replies "no" to a confirmation:
- Ask: "No worries — would you like to cancel this action?"
- If yes: "Alright, it's canceled."
- If no: "Okay — tell me what you'd like to do instead."

====================================================
SAFETY & VALIDATION
====================================================
- Validate EVM addresses (0x...) and Solana base58 when sending.
- Never proceed if the address format is invalid.
- Keep every message warm, short, simple, and human-friendly.

====================================================
JSON OUTPUT FORMAT (CRITICAL)
====================================================
After user confirms with "yes", output ONLY a JSON object with this structure:

For SWAP:
{
  "action": "swap",
  "tokenFrom": "ETH",
  "tokenTo": "USDT",
  "amount": "100",
  "chainName": "Ethereum",
  "chainId": 1
}

For SEND:
{
  "action": "send",
  "token": "USDT",
  "amount": "50",
  "receiverAddress": "0x...",
  "chainName": "BSC",
  "chainId": 56
}

For BUY:
{
  "action": "buy",
  "token": "BTC",
  "fiatAmount": "$100",
  "chainName": "Bitcoin",
  "chainId": null
}

For SELL:
{
  "action": "sell",
  "token": "ETH",
  "amount": "1",
  "chainName": "Ethereum",
  "chainId": 1
}

For GIFT CARD TRADE:
{
  "action": "giftCardTrade",
  "brand": "Amazon",
  "amount": "$50",
  "country": "US"
}

For BILL PAY:
{
  "action": "billPay",
  "provider": "Electricity Company",
  "amount": "$75",
  "country": "US"
}

IMPORTANT: Output ONLY the JSON, no other text before or after it.
`

type Message = {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  isProgress?: boolean
}

type WalletActionType = "swap" | "send" | "receive" | "sell" | "buy" | "giftCardTrade" | "billPay"

type PendingAction = {
  type: WalletActionType
  params: Record<string, any>
  confirmationMessage?: string
}

type WalletActionPayload =
  | {
      action: "swap"
      tokenFrom: string
      tokenTo: string
      amount: string
      chainName: string
      chainId: number | null
    }
  | {
      action: "send"
      token: string
      amount: string
      receiverAddress: string
      chainName: string
      chainId: number | null
    }
  | {
      action: "sell"
      token: string
      amount: string
      chainName: string
      chainId: number | null
    }
  | {
      action: "buy"
      token: string
      fiatAmount?: string
      cryptoAmount?: string
      chainName: string
      chainId: number | null
    }
  | {
      action: "giftCardTrade"
      brand: string
      amount: string
      country?: string | null
    }
  | {
      action: "billPay"
      provider: string
      amount: string
      country?: string | null
    }

function buildActionPayload(actionType: WalletActionType, params: Record<string, any>): WalletActionPayload | null {
  const chainName = params.chainName ? normalizeChainName(params.chainName) : undefined
  const chainId = chainName ? getChainId(chainName) : null

  switch (actionType) {
    case "swap":
      if (params.tokenFrom && params.tokenTo && params.amount && chainName) {
        return {
          action: "swap",
          tokenFrom: params.tokenFrom,
          tokenTo: params.tokenTo,
          amount: params.amount,
          chainName,
          chainId,
        }
      }
      return null
    case "send":
      if (params.token && params.amount && params.receiverAddress && chainName) {
        return {
          action: "send",
          token: params.token,
          amount: params.amount,
          receiverAddress: params.receiverAddress,
          chainName,
          chainId,
        }
      }
      return null
    case "sell":
      if (params.token && params.amount && chainName) {
        return {
          action: "sell",
          token: params.token,
          amount: params.amount,
          chainName,
          chainId,
        }
      }
      return null
    case "buy":
      if (params.token && (params.fiatAmount || params.cryptoAmount) && chainName) {
        return {
          action: "buy",
          token: params.token,
          fiatAmount: params.fiatAmount,
          cryptoAmount: params.cryptoAmount,
          chainName,
          chainId,
        }
      }
      return null
    case "giftCardTrade":
      if (params.brand && params.amount) {
        return {
          action: "giftCardTrade",
          brand: params.brand,
          amount: params.amount,
          country: params.country ?? null,
        }
      }
      return null
    case "billPay":
      if (params.provider && params.amount) {
        return {
          action: "billPay",
          provider: params.provider,
          amount: params.amount,
          country: params.country ?? null,
        }
      }
      return null
    default:
      return null
  }
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
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const recordingWaveAnim = useRef(new Animated.Value(0))
  const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null)
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasSentWelcomeRef = useRef(false)

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

  useEffect(() => {
    if (hasSentWelcomeRef.current) return
    hasSentWelcomeRef.current = true
    startAssistantTypewriter(
      "Hello! How can I assist you today?\nWould you like to swap, send, receive, buy, sell crypto, trade gift cards, or pay bills?"
    )
  }, [startAssistantTypewriter])

  // Handle action from JSON payload (when AI outputs JSON directly)
  const handleActionFromJSON = useCallback((payload: WalletActionPayload) => {
    // Log the payload for debugging
    console.log("Action payload from JSON:", payload)

    // Get action display name
    const actionName = getActionDisplayName(payload.action)
    const progressText = `${actionName} in progress`

    // Create progress message with spinner
    const progressMessageId = `${Date.now()}-progress`
    const progressMessage: Message = {
      id: progressMessageId,
      text: progressText,
      sender: "bot",
      timestamp: new Date(),
      isProgress: true,
    }

    setMessages((prev) => [...prev, progressMessage])

    // After 3 seconds, remove progress message and show success
    setTimeout(() => {
      setMessages((prev) => {
        // Remove the progress message
        const filtered = prev.filter((msg) => msg.id !== progressMessageId)
        // Add success message
        const successMessage: Message = {
          id: `${Date.now()}-success`,
          text: "Operation successful.",
          sender: "bot",
          timestamp: new Date(),
        }
        return [...filtered, successMessage]
      })
    }, 3000)
  }, [])

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
          // First, check if the response contains JSON (action payload)
          const actionPayload = extractJSONFromText(assistantText)
          
          if (actionPayload) {
            // AI has output JSON - extract action and show progress
            // Don't display the JSON text to the user
            handleActionFromJSON(actionPayload)
            return
          }
          
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
    [openAiApiKey, startAssistantTypewriter, handleActionFromJSON]
  )

  // AI-based confirmation judge so it can understand each user's natural positive/negative responses
  const judgeConfirmation = useCallback(
    async (userResponse: string, confirmationMessage: string, conversation: Message[]): Promise<boolean> => {
      if (!openAiApiKey) {
        return false
      }

      try {
        // Use a short window of recent messages as context
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
                content: `You are a confirmation judge for a crypto wallet assistant.
Your job is to decide if the user AGREES or DISAGREES with the confirmation request.

Confirmation message:
"${confirmationMessage}"

User reply:
"${userResponse}"

AGREEMENT examples:
- yes, yep, yeah, sure, ok, okay, confirm, proceed, right, correct, exactly, that's right, do it, go ahead, let's go, sounds good, fine, etc.

DISAGREEMENT examples:
- no, nope, cancel, stop, don't, wait, not yet, wrong, or if they ask a question or change details.

Respond with ONLY a JSON object in this exact format:
{"agrees": true or false}
`,
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
            // Try to parse a bare JSON object or JSON embedded in text
            const jsonMatch = judgmentText.match(/\{[\s\S]*\}/)
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

  const handleConfirmedAction = useCallback(
    (actionType: WalletActionType, params: Record<string, any>) => {
      setPendingAction(null)
      const payload = buildActionPayload(actionType, params)

      if (!payload) {
        startAssistantTypewriter("Thanks for confirming! I'm ready to help with the next step.")
        return
      }

      // Use the same handler as JSON-based actions
      handleActionFromJSON(payload)
    },
    [handleActionFromJSON]
  )

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

    // If there's a pending action, check if user agrees or disagrees
    if (pendingAction && pendingAction.confirmationMessage) {
      setIsThinking(true)
      const agrees = await judgeConfirmation(trimmed, pendingAction.confirmationMessage, updatedConversation)
      setIsThinking(false)

      if (agrees) {
        // User agreed - send their response to AI, which should output JSON
        // Clear pending action first
        setPendingAction(null)
        // Continue conversation - AI will output JSON according to prompt
        sendAssistantResponse(updatedConversation)
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
  }, [chatMessage, isThinking, messages, sendAssistantResponse, pendingAction, handleConfirmedAction, judgeConfirmation])

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
              <View style={styles.messageContent}>
                <Text style={[styles.messageText, { color: message.sender === "user" ? "#FFFFFF" : colors.text }]}>
                  {message.text}
                </Text>
                {message.isProgress && (
                  <ActivityIndicator
                    size="small"
                    color={message.sender === "user" ? "#FFFFFF" : colors.text}
                    style={styles.progressSpinner}
                  />
                )}
              </View>
            </View>
            {/* {message.sender === "user" && (
              <View style={styles.avatarContainer}>
                <UserAvatarIcon />
              </View>
            )} */}
          </View>
        ))}
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
  messageContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  progressSpinner: {
    marginLeft: 4,
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
})
