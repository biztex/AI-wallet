"use client"
import { BackButton } from "@/components/Icons/back-button"
import type React from "react"

import { BTCIcon } from "@/components/Icons/crypto/bitcoin"
import { ETHIcon } from "@/components/Icons/crypto/etherium"
import { USDTIcon } from "@/components/Icons/crypto/tether"
import { BuyNewIcon } from "@/components/Icons/home/new/buy"
import { ReceiveNewIcon } from "@/components/Icons/home/new/receive"
import { SellNewIcon } from "@/components/Icons/home/new/sell"
import { SendNewIcon } from "@/components/Icons/home/new/send"
import { SwapNewIcon } from "@/components/Icons/home/new/swap"
import { SellIcon } from "@/components/Icons/home/sell-icon"
import { SendIcon } from "@/components/Icons/home/send-icon"
import { SwapIcon } from "@/components/Icons/home/swap-icon"
import { PieChart } from "@/components/Icons/pie-chart"
import { KYCOverlay } from "@/components/ScreenComponent/kyc-overlay"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { usePortfolioData } from "@/hooks/use-portfolio-data"
import { KYCStorage } from "@/utils/kyc-storage"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Dimensions,
  Modal,
  PanResponder,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Path, Svg } from "react-native-svg"

const { width } = Dimensions.get("window")

type Token = {
  name: string
  symbol: string
  balance: number
  fiatValue: number
  change24h: number
  color: string
}

const getCryptoIcon = (symbol: string) => {
  switch (symbol.toUpperCase()) {
    case "BTC":
    case "BITCOIN":
      return BTCIcon
    case "ETH":
    case "ETHEREUM":
      return ETHIcon
    case "USDT":
    case "TETHER":
      return USDTIcon
    default:
      return null
  }
}

const SecurityIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24">
    <Path
      fill="#FFFFFF"
      d="M12 12h7c-.53 4.11-3.28 7.78-7 8.92zH5V6.3l7-3.11M12 1L3 5v6c0 5.55 3.84 10.73 9 12c5.16-1.27 9-6.45 9-12V5z"
    />
  </Svg>
)

const WelcomeIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24">
    <Path
      fill="#FFFFFF"
      d="M1.5 4v1.5c0 4.15 2.21 7.78 5.5 9.8V20h15v-2c0-2.66-5.33-4-8-4h-.25C9 14 5 10 5 5.5V4m9 0a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4"
    />
  </Svg>
)

const FastTransactionIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24">
    <Path
      fill="none"
      stroke="#FFFFFF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.58 8.607L2 8.454C3.849 3.704 9.158 1 14.333 2.344c5.513 1.433 8.788 6.918 7.314 12.25c-1.219 4.411-5.304 7.337-9.8 7.406"
    />
    <Path
      fill="none"
      stroke="#FFFFFF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      strokeDasharray="0.5 3"
      d="M12 22C6.5 22 2 17 2 11"
    />
    <Path
      fill="none"
      stroke="#FFFFFF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.604 9.722c-.352-.37-1.213-1.237-2.575-.62c-1.361.615-1.577 2.596.482 2.807c.93.095 1.537-.11 2.093.47c.556.582.659 2.198-.761 2.634s-2.341-.284-2.588-.509m1.653-6.484v.79m0 6.337v.873"
    />
  </Svg>
)

function SwipeableTokenCard({
  token,
  colors,
  getCryptoIcon,
  formatCurrency,
  formatPercentage,
  onPress,
  onSend,
  onSwap,
  onSell,
}: {
  token: any
  colors: any
  getCryptoIcon: any
  formatCurrency: any
  formatPercentage: any
  onPress: () => void
  onSend: () => void
  onSwap: () => void
  onSell: () => void
}) {
  const [showActions, setShowActions] = useState(false)
  const panResponder = useCallback(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 30) {
          setShowActions(true)
        } else if (gestureState.dx < -30) {
          setShowActions(false)
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          setShowActions(true)
        } else if (gestureState.dx < -30) {
          setShowActions(false)
        }
      },
    })
  }, [])

  const pan = panResponder()

  const CryptoIconComponent = getCryptoIcon(token.symbol)

  return (
    <View style={styles.swipeableContainer}>
      {showActions && (
        <View style={styles.swipeActionsBackground}>
          <TouchableOpacity
            style={[styles.swipeActionButton, { backgroundColor: "#00BCD4" }]}
            onPress={() => {
              setShowActions(false)
              onSend()
            }}
          >
            <SendIcon />
            <Text style={styles.swipeActionText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeActionButton, { backgroundColor: "#00BCD4" }]}
            onPress={() => {
              setShowActions(false)
              onSwap()
            }}
          >
            <SwapIcon />
            <Text style={styles.swipeActionText}>Swap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeActionButton, { backgroundColor: "#00BCD4" }]}
            onPress={() => {
              setShowActions(false)
              onSell()
            }}
          >
            <SellIcon />
            <Text style={styles.swipeActionText}>Sell</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Token card */}
      <TouchableOpacity
        {...pan.panHandlers}
        style={[styles.tokenCard, { backgroundColor: showActions ? "rgba(0,188,212,0.1)" : colors.card }]}
        activeOpacity={0.7}
        onPress={() => {
          if (!showActions) {
            onPress()
          } else {
            setShowActions(false)
          }
        }}
      >
        <View style={styles.tokenLeft}>
          <View style={[styles.tokenIcon, { backgroundColor: token.color + "15" }]}>
            {CryptoIconComponent ? (
              <CryptoIconComponent />
            ) : (
              <Text style={[styles.tokenSymbol, { color: token.color }]}>{token.symbol.charAt(0)}</Text>
            )}
          </View>
          <View style={styles.tokenInfo}>
            <Text style={[styles.tokenName, { color: colors.text }]}>{token.name}</Text>
            <Text style={[styles.tokenBalance, { color: colors.textSecondary }]}>
              {Number.parseFloat(token.balance).toFixed(4)} {token.symbol}
            </Text>
          </View>
        </View>
        <View style={styles.tokenRight}>
          <Text style={[styles.tokenValue, { color: colors.text }]}>{formatCurrency(token.fiatValue)}</Text>
          {token.symbol !== "Others" && (
            <View style={styles.changeContainer}>
              <Text style={[styles.tokenChange, { color: token.change24h >= 0 ? "#4CAF50" : "#F44336" }]}>
                {formatPercentage(token.change24h)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}

function CarouselCard({
  title,
  subtitle,
  balance,
  colors,
  icon,
}: {
  title: string
  subtitle: string
  balance: string
  colors: any
  icon: React.ReactNode
}) {
  return (
    <View style={[styles.carouselCard]}>
      <LinearGradient
        colors={["#0EA5E9", "#06B6D4", `${colors.background}`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.carouselGradient}
      >
        <View style={styles.carouselContent}>
          <View>
            <Text style={[styles.carouselTitle, { color: "#FFFFFF" }]}>{title}</Text>
            <Text style={[styles.carouselSubtitle, { color: "rgba(255, 255, 255, 0.90)" }]}>{subtitle}</Text>
          </View>
          <View style={styles.carouselIconContainer}>{icon}</View>
        </View>

        <View style={styles.carouselDecorativeBlob} />
      </LinearGradient>
    </View>
  )
}

function AutoplayCarousel({
  carouselData,
  colors,
  formatCurrency,
}: {
  carouselData: any[]
  colors: any
  formatCurrency: (value: number) => string
}) {
  const scrollViewRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselData.length
      setCurrentIndex(nextIndex)

      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      })
    }, 6000)

    return () => clearInterval(interval)
  }, [currentIndex, carouselData.length])

  return (
    <View style={styles.autoplayCarouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        pagingEnabled
        scrollEnabled={false}
        decelerationRate="fast"
      >
        {carouselData.map((item) => (
          <CarouselCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            balance={item.balance}
            colors={colors}
            icon={item.icon}
          />
        ))}
      </ScrollView>
    </View>
  )
}

export default function PortfolioScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const { totalBalance, tokens, chartData, isLoading, error, refresh } = usePortfolioData()
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [kycStatus, setKycStatus] = useState<string>("not_started")
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [showTokenDetail, setShowTokenDetail] = useState(false)
  const [showChart, setShowChart] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  useEffect(() => {
    const loadBalanceVisibility = async () => {
      try {
        const savedVisibility = await AsyncStorage.getItem("balanceVisible")
        if (savedVisibility !== null) {
          setBalanceVisible(JSON.parse(savedVisibility))
        }
      } catch (error) {
        console.error("Error loading balance visibility:", error)
      }
    }
    loadBalanceVisibility()
  }, [])

  useEffect(() => {
    const checkKYCStatus = async () => {
      const status = await KYCStorage.getStatus()
      setKycStatus(status)
    }
    checkKYCStatus()
  }, [])

  const toggleBalanceVisibility = useCallback(async () => {
    setBalanceVisible((prev) => {
      const newValue = !prev
      AsyncStorage.setItem("balanceVisible", JSON.stringify(newValue)).catch((error) => {
        console.error("Error saving balance visibility:", error)
      })
      return newValue
    })
  }, [])

  const handleTokenPress = useCallback((token: Token) => {
    if (token.symbol !== "Others") {
      setSelectedToken(token)
      setShowTokenDetail(true)
    }
  }, [])

  const handleCloseTokenDetail = useCallback(() => {
    setShowTokenDetail(false)
    setSelectedToken(null)
  }, [])

  const checkKYCAndNavigate = useCallback(
    async (route: string) => {
      const status = await KYCStorage.getStatus()
      if (status === "approved") {
        router.push(route as any)
      } else {
        setShowKYCModal(true)
      }
    },
    [router],
  )

  const handleSend = useCallback(
    (preselectedCrypto?: string) => {
      if (preselectedCrypto) {
        router.push(`/send?crypto=${preselectedCrypto}` as any)
      } else {
        router.push("/send")
      }
    },
    [router],
  )

  const handleReceive = useCallback(
    (preselectedCrypto?: string) => {
      if (preselectedCrypto) {
        router.push(`/receive?crypto=${preselectedCrypto}` as any)
      } else {
        router.push("/receive")
      }
    },
    [router],
  )

  const handleSwap = useCallback(
    (preselectedCrypto?: string) => {
      if (preselectedCrypto) {
        router.push(`/bridge?crypto=${preselectedCrypto}` as any)
      } else {
        router.push("/bridge")
      }
    },
    [router],
  )

  const handleBuy = useCallback(
    (preselectedCrypto?: string) => {
      const route = preselectedCrypto ? `/buy-bitcoin?crypto=${preselectedCrypto}` : "/buy-bitcoin"
      checkKYCAndNavigate(route)
    },
    [checkKYCAndNavigate],
  )

  const handleSell = useCallback(
    (preselectedCrypto?: string) => {
      const route = preselectedCrypto ? `/sell-bitcoin?crypto=${preselectedCrypto}` : "/sell-bitcoin"
      checkKYCAndNavigate(route)
    },
    [checkKYCAndNavigate],
  )

  const handleBills = useCallback(() => {
    checkKYCAndNavigate("/pay-bill")
  }, [checkKYCAndNavigate])

  const handleCloseKYCModal = useCallback(() => {
    setShowKYCModal(false)
  }, [])

  const handleStartKYC = useCallback(() => {
    setShowKYCModal(false)
    router.push("/lets-get-started")
  }, [router])

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(2)}%`
  }

  const carouselData = [
    {
      id: "1",
      title: "Welcome Bonus",
      subtitle: "Get up to $50 USD",
      balance: "Register your account",
      icon: <WelcomeIcon />,
    },
    {
      id: "2",
      title: "Fast Transactions",
      subtitle: "Send crypto in seconds",
      balance: "No fees",
      icon: <FastTransactionIcon />,
    },
    {
      id: "3",
      title: "Guaranteed Security",
      subtitle: "Your money protected 24/7",
      balance: "Blockchain technology",
      icon: <SecurityIcon />,
    },
  ]

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={["#84C718", "#09791A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceSection}
        >
          <View style={styles.errorContainer}>
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke={colors.textSecondary}
                strokeWidth={2}
              />
              <Path d="M12 8V12" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
              <Path d="M12 16H12.01" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load portfolio</Text>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={refresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    )
  }

  if (tokens.length === 0 && !isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
            <Path
              d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 6.9988C3.09294 7.3025 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
              stroke={colors.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M3.27 6.96L12 12.01L20.73 6.96"
              stroke={colors.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 22.08V12"
              stroke={colors.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No tokens yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Your portfolio is empty. Start by receiving some tokens.
          </Text>
          <TouchableOpacity
            style={[styles.receiveButton, { backgroundColor: colors.primary }]}
            onPress={() => handleReceive()}
          >
            <Text style={styles.receiveButtonText}>Receive Tokens</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <View style={styles.headerContainer}>
          <BackButton />
        </View>

        <LinearGradient
          colors={["#84C718", "#09791A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>{balanceVisible ? formatCurrency(totalBalance) : "••••••"}</Text>
            <TouchableOpacity onPress={toggleBalanceVisibility} style={styles.eyeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                {balanceVisible ? (
                  <>
                    <Path
                      d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5Z"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ) : (
                  <>
                    <Path
                      d="M3 3L21 21"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M10.584 10.587C10.2087 10.9624 9.99778 11.4708 9.99756 12.0013C9.99734 12.5319 10.2078 13.0404 10.5828 13.4161C10.9578 13.7918 11.4661 14.0027 11.9966 14.003C12.5272 14.0032 13.0357 13.7927 13.4114 13.4177"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M17.357 17.349C15.726 18.449 13.942 19 12 19C7 19 2.73 15.89 1 11.5C2.13 8.67 4.08 6.34 6.632 4.659M9.363 5.365C10.2204 5.11972 11.1082 4.99684 12 5C17 5 21.27 8.11 23 12.5C22.393 14.052 21.49 15.46 20.364 16.636"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </Svg>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={() => handleBuy()}>
            <View style={styles.actionIconContainer}>
              <BuyNewIcon />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Buy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => handleSell()}
          >
            <View style={styles.actionIconContainer}>
              <SellNewIcon />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Sell</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => handleReceive()}
          >
            <View style={styles.actionIconContainer}>
              <ReceiveNewIcon />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => handleSwap()}
          >
            <View style={styles.actionIconContainer}>
              <SwapNewIcon />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Swap</Text>
          </TouchableOpacity>
        </View>

        <AutoplayCarousel carouselData={carouselData} colors={colors} formatCurrency={formatCurrency} />

        <View style={styles.chartToggleContainer}>
          <TouchableOpacity
            style={[styles.chartToggleButton, { backgroundColor: colors.card }]}
            onPress={() => setShowChart(!showChart)}
          >
            <Text style={[styles.chartToggleText, { color: colors.text }]}>Asset Allocation</Text>
            <Svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              style={{ transform: [{ rotate: showChart ? "180deg" : "0deg" }] }}
            >
              <Path
                d="M6 9L12 15L18 9"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {showChart && (
          <View style={[styles.chartSection, { backgroundColor: colors.card }]}>
            <View style={styles.chartContainer}>
              <PieChart data={chartData} size={200} strokeWidth={40} />
            </View>
            <View style={styles.legendContainer}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendText, { color: colors.text }]}>
                    {item.name} {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.tokenListSection}>
          <View style={styles.tokenListHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Assets</Text>
            <Text style={[styles.tokenCount, { color: colors.textSecondary }]}>
              {tokens.filter((t) => t.symbol !== "Others").length} tokens
            </Text>
          </View>
          {tokens.map((token, index) => (
            <SwipeableTokenCard
              key={index}
              token={token}
              colors={colors}
              getCryptoIcon={getCryptoIcon}
              formatCurrency={formatCurrency}
              formatPercentage={formatPercentage}
              onPress={() => handleTokenPress({ ...token, balance: Number.parseFloat(token.balance) })}
              onSend={() => handleSend(token.symbol)}
              onSwap={() => handleSwap(token.symbol)}
              onSell={() => handleSell(token.symbol)}
            />
          ))}
        </View>
      </ScrollView>

      <Modal visible={showTokenDetail} transparent animationType="slide" onRequestClose={handleCloseTokenDetail}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {selectedToken && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={handleCloseTokenDetail} style={styles.modalCloseButton}>
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

                <View style={styles.modalTokenInfo}>
                  <View style={[styles.modalTokenIcon, { backgroundColor: selectedToken.color + "20" }]}>
                    {(() => {
                      const CryptoIconComponent = getCryptoIcon(selectedToken.symbol)
                      return CryptoIconComponent ? (
                        <CryptoIconComponent />
                      ) : (
                        <Text style={[styles.modalTokenSymbol, { color: selectedToken.color }]}>
                          {selectedToken.symbol.charAt(0)}
                        </Text>
                      )
                    })()}
                  </View>
                  <Text style={[styles.modalTokenName, { color: colors.text }]}>{selectedToken.name}</Text>
                  <Text style={[styles.modalTokenBalance, { color: colors.textSecondary }]}>
                    {selectedToken.balance.toFixed(4)} {selectedToken.symbol}
                  </Text>
                  <Text style={[styles.modalTokenValue, { color: colors.text }]}>
                    {formatCurrency(selectedToken.fiatValue)}
                  </Text>
                  <View style={styles.modalChangeContainer}>
                    <Text
                      style={[styles.modalTokenChange, { color: selectedToken.change24h >= 0 ? "#4CAF50" : "#F44336" }]}
                    >
                      {formatPercentage(selectedToken.change24h)} (24h)
                    </Text>
                  </View>
                </View>

                <View style={styles.modalPrimaryActions}>
                  <TouchableOpacity
                    style={[styles.modalPrimaryButton, { backgroundColor: colors.card }]}
                    onPress={() => {
                      handleCloseTokenDetail()
                      handleSend(selectedToken.symbol)
                    }}
                  >
                    <SendNewIcon />
                    <Text style={[styles.modalPrimaryActionText, { color: colors.text }]}>Send</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalPrimaryButton, { backgroundColor: colors.card }]}
                    onPress={() => {
                      handleCloseTokenDetail()
                      handleSwap(selectedToken.symbol)
                    }}
                  >
                    <SwapNewIcon />
                    <Text style={[styles.modalPrimaryActionText, { color: colors.text }]}>Swap</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalPrimaryButton, { backgroundColor: colors.card }]}
                    onPress={() => {
                      handleCloseTokenDetail()
                      handleSell(selectedToken.symbol)
                    }}
                  >
                    <SellNewIcon />
                    <Text style={[styles.modalPrimaryActionText, { color: colors.text }]}>Sell</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalSecondaryActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.card }]}
                    onPress={() => {
                      handleCloseTokenDetail()
                      handleReceive(selectedToken.symbol)
                    }}
                  >
                    <ReceiveNewIcon />
                    <Text style={[styles.modalActionText, { color: colors.text }]}>Receive</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.card }]}
                    onPress={() => {
                      handleCloseTokenDetail()
                      handleBuy(selectedToken.symbol)
                    }}
                  >
                    <BuyNewIcon />
                    <Text style={[styles.modalActionText, { color: colors.text }]}>Buy</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* KYC Modal */}
      <Modal visible={showKYCModal} transparent animationType="fade" onRequestClose={handleCloseKYCModal}>
        <KYCOverlay onStartKYC={handleStartKYC} />
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 10,
    position: "relative",
  },
  swipeActionsBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "transparent",
    zIndex: 1,
  },
  swipeActionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    paddingHorizontal: 8,
  },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    alignItems: "center",
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eyeButton: {
    padding: 8,
  },
  balanceSection: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  balanceLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    opacity: 0.85,
    marginBottom: 8,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "700",
    letterSpacing: -1,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  actionDescription: {
    fontSize: 9,
    textAlign: "center",
    lineHeight: 11,
  },
  chartToggleContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  chartToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartToggleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    fontWeight: "500",
  },
  tokenListSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tokenListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tokenCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  tokenCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tokenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  tokenSymbol: {
    fontSize: 20,
    fontWeight: "700",
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  tokenBalance: {
    fontSize: 13,
    fontWeight: "500",
  },
  tokenRight: {
    alignItems: "flex-end",
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  tokenChange: {
    fontSize: 12,
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
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    minHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTokenInfo: {
    alignItems: "center",
    marginBottom: 32,
  },
  modalTokenIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTokenSymbol: {
    fontSize: 36,
    fontWeight: "700",
  },
  modalTokenName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  modalTokenBalance: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  modalTokenValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalChangeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  modalTokenChange: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalPrimaryActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalPrimaryButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalPrimaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
    letterSpacing: 0.2,
  },
  modalSecondaryActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  modalActionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
    letterSpacing: 0.2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  receiveButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  receiveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  autoplayCarouselContainer: {
    marginBottom: 24,
  },
  carouselCard: {
    width: width - 40,
    height: 120,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  carouselGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  carouselContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  carouselIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  carouselSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  carouselDecorativeBlob: {
    position: "absolute",
    right: -60,
    bottom: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
})
