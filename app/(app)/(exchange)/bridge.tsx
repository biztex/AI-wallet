"use client"
import { BEPIcon } from "@/components/Icons/crypto/bep"
import { BTCIcon } from "@/components/Icons/crypto/bitcoin"
import { ETHIcon } from "@/components/Icons/crypto/etherium"
import { SOLIcon } from "@/components/Icons/crypto/solana"
import { USDTIcon } from "@/components/Icons/crypto/tether"
import { SwapIcon } from "@/components/Icons/swap"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Circle, Path, Svg } from "react-native-svg"

type Chain = "ETH" | "BTC" | "SOL" | "BNB" | "ARB" | "BASE"
type TokenSymbol = "BTC" | "ETH" | "USDT" | "USDC" | "SOL" | "BEP"

interface Token {
  symbol: TokenSymbol
  name: string
  chain: Chain
  balance: number
  icon: string
}

const AVAILABLE_TOKENS: Token[] = [
  { symbol: "BTC", name: "Bitcoin", chain: "BTC", balance: 0.5, icon: "BTC" },
  { symbol: "ETH", name: "Ethereum", chain: "ETH", balance: 2.3, icon: "ETH" },
  { symbol: "ETH", name: "Ethereum", chain: "ARB", balance: 1.2, icon: "ETH" },
  { symbol: "ETH", name: "Ethereum", chain: "BASE", balance: 0.8, icon: "ETH" },
  { symbol: "USDT", name: "Tether", chain: "ETH", balance: 1000, icon: "USDT" },
  { symbol: "USDT", name: "Tether", chain: "SOL", balance: 500, icon: "USDT" },
  { symbol: "USDT", name: "Tether", chain: "BNB", balance: 750, icon: "USDT" },
  { symbol: "USDC", name: "USD Coin", chain: "ETH", balance: 800, icon: "USDC" },
  { symbol: "USDC", name: "USD Coin", chain: "ARB", balance: 600, icon: "USDC" },
  { symbol: "USDC", name: "USD Coin", chain: "SOL", balance: 400, icon: "USDC" },
  { symbol: "SOL", name: "Solana", chain: "SOL", balance: 15, icon: "SOL" },
  { symbol: "BEP", name: "BEP", chain: "BNB", balance: 5, icon: "BEP" },
]

const CRYPTO_ICONS: Record<TokenSymbol, any> = {
  BTC: BTCIcon,
  ETH: ETHIcon,
  USDT: USDTIcon,
  USDC: USDTIcon,
  SOL: SOLIcon,
  BEP: BEPIcon,
}

const CHAIN_NAMES: Record<Chain, string> = {
  ETH: "Ethereum",
  BTC: "Bitcoin",
  SOL: "Solana",
  BNB: "BNB Chain",
  ARB: "Arbitrum",
  BASE: "Base",
}

const TOKEN_PRICES: Record<TokenSymbol, number> = {
  BTC: 45000,
  ETH: 2500,
  USDT: 1,
  USDC: 1,
  SOL: 100,
  BEP: 300,
}

export default function Exchange() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [amount, setAmount] = useState("0")
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [showFromModal, setShowFromModal] = useState(false)
  const [showToModal, setShowToModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(0.5)

  const filteredTokens = useMemo(() => {
    const filtered = AVAILABLE_TOKENS.filter((token) => {
      const matchesSearch =
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        CHAIN_NAMES[token.chain].toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })

    return filtered
  }, [searchQuery])

  const convertedAmount = useMemo(() => {
    const numAmount = Number.parseFloat(amount) || 0
    return (numAmount * 0.98).toFixed(6)
  }, [amount])

  const fromUsdValue = useMemo(() => {
    if (!fromToken) return "0.00"
    const numAmount = Number.parseFloat(amount) || 0
    const usdValue = numAmount * TOKEN_PRICES[fromToken.symbol]
    return usdValue.toFixed(2)
  }, [amount, fromToken])

  const toUsdValue = useMemo(() => {
    if (!toToken) return "0.00"
    const numConverted = Number.parseFloat(convertedAmount) || 0
    const usdValue = numConverted * TOKEN_PRICES[toToken.symbol]
    return usdValue.toFixed(2)
  }, [convertedAmount, toToken])

  const handleSelectFromToken = useCallback(
    (token: Token) => {
      setFromToken(token)
      setShowFromModal(false)
      setSearchQuery("")
      if (!toToken) {
        setTimeout(() => setShowToModal(true), 300)
      }
    },
    [toToken],
  )

  const handleSelectToToken = useCallback((token: Token) => {
    setToToken(token)
    setShowToModal(false)
    setSearchQuery("")
  }, [])

  const handleMax = useCallback(() => {
    if (fromToken) {
      setAmount(fromToken.balance.toString())
    }
  }, [fromToken])

  const handlePreviewSwap = useCallback(() => {
    if (!fromToken || !toToken) {
      return
    }
    const numAmount = Number.parseFloat(amount)
    if (numAmount <= 0) {
      return
    }
    if (numAmount > fromToken.balance) {
      return
    }
    setShowPreviewModal(true)
  }, [amount, fromToken, toToken])

  const handleConfirmSwap = useCallback(() => {
    setShowPreviewModal(false)
    setTimeout(() => {
      setShowSuccessModal(true)
    }, 300)
  }, [])

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false)
    setAmount("0")
    router.push("/home")
  }, [router])

  const renderTokenIcon = (token: Token, size = 40) => {
    const IconComponent = CRYPTO_ICONS[token.symbol]

    const chainColor = {
      ETH: "#627EEA",
      BTC: "#F7931A",
      SOL: "#14F195",
      BNB: "#F3BA2F",
      ARB: "#28A0F0",
      BASE: "#0052FF",
    }[token.chain]

    return (
      <View style={{ position: "relative", width: size, height: size }}>
        <View style={{ width: size, height: size }}>
          <IconComponent width={size} height={size} />
        </View>
        <View style={[styles.chainBadge, { backgroundColor: chainColor, width: size * 0.45, height: size * 0.45 }]}>
          <Text style={[styles.chainBadgeText, { fontSize: size * 0.25 }]}>{token.chain[0]}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Swap</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* From Token Card */}
        <View style={[styles.tokenCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>From</Text>
            {fromToken && (
              <Text style={[styles.cardBalance, { color: colors.textSecondary }]}>
                Balance: {fromToken.balance} {fromToken.symbol}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.tokenSelector} onPress={() => setShowFromModal(true)} activeOpacity={0.7}>
            {fromToken ? (
              <View style={styles.selectedToken}>
                {renderTokenIcon(fromToken)}
                <View style={styles.tokenInfo}>
                  <Text style={[styles.tokenName, { color: colors.text }]}>{fromToken.symbol}</Text>
                  <Text style={[styles.tokenChain, { color: colors.textSecondary }]}>
                    {CHAIN_NAMES[fromToken.chain]}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.notSelectedContainer}>
                <View style={styles.placeholderIcon} />
                <View style={styles.tokenInfo}>
                  <Text style={[styles.notSelectedText, { color: colors.textSecondary }]}>From</Text>
                  <Text style={[styles.notSelectedSubtext, { color: colors.textSecondary }]}>Not Selected</Text>
                </View>
              </View>
            )}
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M5 7.5L10 12.5L15 7.5"
                stroke={colors.textSecondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View style={styles.amountContainer}>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={styles.maxButton} onPress={handleMax} activeOpacity={0.7}>
              <Text style={styles.maxButtonText}>Max</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.usdValue, { color: colors.textSecondary }]}>≈ ${fromUsdValue}</Text>
        </View>

        {/* Swap Button */}
        <View style={styles.swapButtonContainer}>
          <TouchableOpacity
            style={[styles.swapButton, { backgroundColor: colors.card }]}
            onPress={() => {
              const temp = fromToken
              setFromToken(toToken)
              setToToken(temp)
            }}
            activeOpacity={0.7}
          >
            <SwapIcon />
          </TouchableOpacity>
        </View>

        {/* To Token Card */}
        <View style={[styles.tokenCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>To</Text>
            {toToken && (
              <Text style={[styles.cardBalance, { color: colors.textSecondary }]}>
                Balance: {toToken.balance} {toToken.symbol}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.tokenSelector} onPress={() => setShowToModal(true)} activeOpacity={0.7}>
            {toToken ? (
              <View style={styles.selectedToken}>
                {renderTokenIcon(toToken)}
                <View style={styles.tokenInfo}>
                  <Text style={[styles.tokenName, { color: colors.text }]}>{toToken.symbol}</Text>
                  <Text style={[styles.tokenChain, { color: colors.textSecondary }]}>{CHAIN_NAMES[toToken.chain]}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.notSelectedContainer}>
                <View style={styles.placeholderIcon} />
                <View style={styles.tokenInfo}>
                  <Text style={[styles.notSelectedText, { color: colors.textSecondary }]}>To</Text>
                  <Text style={[styles.notSelectedSubtext, { color: colors.textSecondary }]}>Not Selected</Text>
                </View>
              </View>
            )}
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M5 7.5L10 12.5L15 7.5"
                stroke={colors.textSecondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountDisplay, { color: colors.text }]}>{convertedAmount}</Text>
          </View>
          <Text style={[styles.usdValue, { color: colors.textSecondary }]}>≈ ${toUsdValue}</Text>
        </View>

        {/* Exchange Details */}
        {fromToken && toToken && (
          <View style={[styles.exchangeDetails, { backgroundColor: colors.card }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Rate</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                1 {fromToken.symbol} ≈ 0.98 {toToken.symbol}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fee</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>0.3%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Slippage</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{slippageTolerance}%</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Swap Button */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handlePreviewSwap}
          disabled={!fromToken || !toToken || Number.parseFloat(amount) <= 0}
          activeOpacity={0.8}
          style={{ opacity: fromToken && toToken && Number.parseFloat(amount) > 0 ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.swapActionButton}
          >
            <Text style={styles.swapActionButtonText}>SWAP</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Token Selection Modal */}
      <Modal visible={showFromModal || showToModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {showFromModal ? "Select source token" : "Select destination token"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowFromModal(false)
                  setShowToModal(false)
                  setSearchQuery("")
                }}
                activeOpacity={0.7}
              >
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 6L6 18M6 6L18 18"
                    stroke={colors.text}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx={11}
                  cy={11}
                  r={8}
                  stroke={colors.textSecondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M21 21L16.65 16.65"
                  stroke={colors.textSecondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search token and chain"
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Token List */}
            <ScrollView style={styles.tokenList} showsVerticalScrollIndicator={false}>
              {filteredTokens.length === 0 && (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: colors.textSecondary }}>No tokens found</Text>
                </View>
              )}
              {filteredTokens.map((token, index) => (
                <TouchableOpacity
                  key={`${token.symbol}-${token.chain}-${index}`}
                  style={[styles.tokenItem, { borderBottomColor: colors.border }]}
                  onPress={() => (showFromModal ? handleSelectFromToken(token) : handleSelectToToken(token))}
                  activeOpacity={0.7}
                >
                  {renderTokenIcon(token, 44)}
                  <View style={styles.tokenItemInfo}>
                    <Text style={[styles.tokenItemName, { color: colors.text }]}>{token.symbol}</Text>
                    <Text style={[styles.tokenItemChain, { color: colors.textSecondary }]}>
                      {CHAIN_NAMES[token.chain]}
                    </Text>
                  </View>
                  <View style={styles.tokenItemBalance}>
                    <Text style={[styles.tokenItemBalanceAmount, { color: colors.text }]}>{token.balance}</Text>
                    <Text style={[styles.tokenItemBalanceLabel, { color: colors.textSecondary }]}>{token.symbol}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={showPreviewModal} transparent animationType="slide">
        <View style={styles.previewModalOverlay}>
          <View style={[styles.previewModalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.previewModalTitle, { color: colors.text }]}>Confirm Swap</Text>

            <View style={styles.previewSwapInfo}>
              <View style={styles.previewTokenSection}>
                {fromToken && (
                  <>
                    {renderTokenIcon(fromToken, 48)}
                    <Text style={[styles.previewTokenAmount, { color: colors.text }]}>
                      {amount} {fromToken.symbol}
                    </Text>
                    <Text style={[styles.previewTokenChain, { color: colors.textSecondary }]}>
                      {CHAIN_NAMES[fromToken.chain]}
                    </Text>
                  </>
                )}
              </View>

              <View style={styles.previewArrowContainer}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 5V19M12 19L19 12M12 19L5 12"
                    stroke={colors.textSecondary}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>

              <View style={styles.previewTokenSection}>
                {toToken && (
                  <>
                    {renderTokenIcon(toToken, 48)}
                    <Text style={[styles.previewTokenAmount, { color: colors.text }]}>
                      {convertedAmount} {toToken.symbol}
                    </Text>
                    <Text style={[styles.previewTokenChain, { color: colors.textSecondary }]}>
                      {CHAIN_NAMES[toToken.chain]}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <View style={[styles.previewDetailsCard, { backgroundColor: colors.background }]}>
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Rate</Text>
                <Text style={[styles.previewValue, { color: colors.text }]}>
                  1 {fromToken?.symbol} ≈ 0.98 {toToken?.symbol}
                </Text>
              </View>
              <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Network Fee</Text>
                <Text style={[styles.previewValue, { color: colors.text }]}>0.3%</Text>
              </View>
              <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Slippage Tolerance</Text>
                <Text style={[styles.previewValue, { color: colors.text }]}>{slippageTolerance}%</Text>
              </View>
            </View>

            <View style={styles.previewButtons}>
              <TouchableOpacity
                style={[styles.previewCancelButton, { backgroundColor: colors.background }]}
                onPress={() => setShowPreviewModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmSwap} activeOpacity={0.8} style={styles.previewConfirmButton}>
                <LinearGradient
                  colors={["#84C718", "#09791A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.successModalOverlay}>
          <View style={[styles.successModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconOuter}>
                <View style={[styles.successIconInner, { backgroundColor: colors.primary }]}>
                  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                    <Path
                      d="M10 20L17 27L30 13"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Swap Successful!</Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Your swap has been completed successfully.
            </Text>
            <View style={styles.successDetails}>
              <View style={styles.successRow}>
                <Text style={[styles.successLabel, { color: colors.textSecondary }]}>From</Text>
                <Text style={[styles.successValue, { color: colors.text }]}>
                  {amount} {fromToken?.symbol}
                </Text>
              </View>
              <View style={styles.successRow}>
                <Text style={[styles.successLabel, { color: colors.textSecondary }]}>To</Text>
                <Text style={[styles.successValue, { color: colors.text }]}>
                  {convertedAmount} {toToken?.symbol}
                </Text>
              </View>
              <View style={styles.successRow}>
                <Text style={[styles.successLabel, { color: colors.textSecondary }]}>Fee</Text>
                <Text style={[styles.successValue, { color: colors.text }]}>0.3%</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleCloseSuccessModal} activeOpacity={0.8} style={{ width: "100%" }}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.successButton}
              >
                <Text style={styles.successButtonText}>DONE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  bridgeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(132, 199, 24, 0.1)",
  },
  bridgeButtonText: {
    color: "#84C718",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tokenCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  cardBalance: {
    fontSize: 12,
  },
  tokenSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedToken: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tokenInfo: {
    gap: 2,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "600",
  },
  tokenChain: {
    fontSize: 12,
  },
  notSelectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  notSelectedText: {
    fontSize: 16,
    fontWeight: "600",
  },
  notSelectedSubtext: {
    fontSize: 12,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: "700",
    flex: 1,
  },
  amountDisplay: {
    fontSize: 32,
    fontWeight: "700",
  },
  maxButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(132, 199, 24, 0.15)",
    borderRadius: 8,
  },
  maxButtonText: {
    color: "#84C718",
    fontSize: 14,
    fontWeight: "600",
  },
  usdValue: {
    fontSize: 14,
  },
  swapButtonContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  exchangeDetails: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
  },
  swapActionButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  swapActionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tokenList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tokenItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  tokenItemInfo: {
    flex: 1,
    gap: 4,
  },
  tokenItemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  tokenItemChain: {
    fontSize: 13,
  },
  tokenItemBalance: {
    alignItems: "flex-end",
    gap: 2,
  },
  tokenItemBalanceAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  tokenItemBalanceLabel: {
    fontSize: 12,
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  previewModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    height: "85%",
  },
  previewModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 32,
    textAlign: "center",
  },
  previewSwapInfo: {
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  previewTokenSection: {
    alignItems: "center",
    gap: 8,
  },
  previewTokenAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  previewTokenChain: {
    fontSize: 13,
  },
  previewArrowContainer: {
    paddingVertical: 8,
  },
  previewDetailsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  previewDivider: {
    height: 1,
    marginVertical: 12,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  previewButtons: {
    flexDirection: "row",
    gap: 12,
  },
  previewCancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  previewConfirmButton: {
    flex: 1,
    height: 56,
  },
  confirmButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  chainBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  chainBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  successModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
  },
  successIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  successDetails: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  successRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  successValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  successButton: {
    borderRadius: 12,
    height: 56,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
