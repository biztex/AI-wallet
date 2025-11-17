"use client"

import { useCallback, useEffect, useState } from "react"

export interface TokenData {
  symbol: string
  name: string
  balance: string
  fiatValue: number
  percentage: number
  priceUsd: number
  change24h: number
  color: string
  icon?: string
}

export interface ChartData {
  name: string
  value: number
  color: string
  percentage: number
}

export interface PortfolioData {
  totalBalance: number
  tokens: TokenData[]
  chartData: ChartData[]
  isLoading: boolean
  error: string | null
}

// Token color mapping
const TOKEN_COLORS: Record<string, string> = {
  ETH: "#627EEA",
  BTC: "#F7931A",
  USDT: "#26A17B",
  USDC: "#2775CA",
  SOL: "#14F195",
  MATIC: "#8247E5",
  BNB: "#F3BA2F",
  Others: "#95A5A6",
}

// Mock token data - in production, this would fetch from blockchain/API
const MOCK_TOKENS: Omit<TokenData, "percentage">[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "0.5",
    fiatValue: 1000,
    priceUsd: 2000,
    change24h: 2.5,
    color: TOKEN_COLORS.ETH,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: "0.02",
    fiatValue: 800,
    priceUsd: 40000,
    change24h: -1.2,
    color: TOKEN_COLORS.BTC,
  },
  {
    symbol: "USDT",
    name: "Tether",
    balance: "300",
    fiatValue: 300,
    priceUsd: 1,
    change24h: 0.1,
    color: TOKEN_COLORS.USDT,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "100",
    fiatValue: 100,
    priceUsd: 1,
    change24h: 0,
    color: TOKEN_COLORS.USDC,
  },
  {
    symbol: "SOL",
    name: "Solana",
    balance: "5",
    fiatValue: 50,
    priceUsd: 10,
    change24h: 5.3,
    color: TOKEN_COLORS.SOL,
  },
]

export function usePortfolioData(): PortfolioData & { refresh: () => Promise<void> } {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [totalBalance, setTotalBalance] = useState(0)

  const calculatePortfolio = useCallback((tokenList: Omit<TokenData, "percentage">[]) => {
    // Calculate total balance
    const total = tokenList.reduce((sum, token) => sum + token.fiatValue, 0)

    // Calculate percentages and filter small tokens
    const tokensWithPercentage = tokenList.map((token) => ({
      ...token,
      percentage: (token.fiatValue / total) * 100,
    }))

    // Sort by fiat value (highest first)
    tokensWithPercentage.sort((a, b) => b.fiatValue - a.fiatValue)

    // Group tokens with <5% as "Others"
    const significantTokens = tokensWithPercentage.filter((token) => token.percentage >= 5)
    const smallTokens = tokensWithPercentage.filter((token) => token.percentage < 5)

    const finalTokens = [...significantTokens]
    const finalChartData: ChartData[] = significantTokens.map((token) => ({
      name: token.symbol,
      value: token.fiatValue,
      color: token.color,
      percentage: token.percentage,
    }))

    // Add "Others" if there are small tokens
    if (smallTokens.length > 0) {
      const othersValue = smallTokens.reduce((sum, token) => sum + token.fiatValue, 0)
      const othersPercentage = (othersValue / total) * 100

      finalTokens.push({
        symbol: "Others",
        name: "Other Tokens",
        balance: `${smallTokens.length} tokens`,
        fiatValue: othersValue,
        percentage: othersPercentage,
        priceUsd: 0,
        change24h: 0,
        color: TOKEN_COLORS.Others,
      })

      finalChartData.push({
        name: "Others",
        value: othersValue,
        color: TOKEN_COLORS.Others,
        percentage: othersPercentage,
      })
    }

    return {
      total,
      tokens: finalTokens,
      chartData: finalChartData,
    }
  }, [])

  const loadPortfolioData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In production, fetch real data from:
      // 1. WalletManager for addresses
      // 2. Blockchain APIs for balances
      // 3. Price APIs (CoinGecko, CoinMarketCap) for prices

      const { total, tokens: calculatedTokens, chartData: calculatedChartData } = calculatePortfolio(MOCK_TOKENS)

      setTotalBalance(total)
      setTokens(calculatedTokens)
      setChartData(calculatedChartData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio data")
    } finally {
      setIsLoading(false)
    }
  }, [calculatePortfolio])

  const refresh = useCallback(async () => {
    await loadPortfolioData()
  }, [loadPortfolioData])

  useEffect(() => {
    loadPortfolioData()
  }, [loadPortfolioData])

  return {
    totalBalance,
    tokens,
    chartData,
    isLoading,
    error,
    refresh,
  }
}
