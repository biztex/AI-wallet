"use client"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { useRouter } from "expo-router"
import { useCallback, useMemo } from "react"
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

type TransactionType = "send" | "receive" | "swap" | "buy" | "sell"

interface Transaction {
  id: string
  type: TransactionType
  name: string
  symbol: string
  amount: string
  price: string
  total: string
  date: string
  status: "completed" | "pending" | "failed"
  // For swap transactions
  toName?: string
  toSymbol?: string
  toAmount?: string
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "receive",
    name: "Bitcoin",
    symbol: "BTC",
    amount: "0.5 BTC",
    price: "$43,250.00",
    total: "+$21,625.00",
    date: "Today, 02:45 PM",
    status: "completed",
  },
  {
    id: "2",
    type: "send",
    name: "Ethereum",
    symbol: "ETH",
    amount: "2.3 ETH",
    price: "$2,245.50",
    total: "-$5,164.65",
    date: "Today, 11:20 AM",
    status: "completed",
  },
  {
    id: "3",
    type: "swap",
    name: "USDT",
    symbol: "USDT",
    amount: "1,000 USDT",
    toName: "USDC",
    toSymbol: "USDC",
    toAmount: "1,000 USDC",
    price: "$1.00",
    total: "$1,000.00",
    date: "Yesterday, 04:15 PM",
    status: "completed",
  },
  {
    id: "4",
    type: "buy",
    name: "Solana",
    symbol: "SOL",
    amount: "15 SOL",
    price: "$98.50",
    total: "+$1,477.50",
    date: "Yesterday, 09:30 AM",
    status: "completed",
  },
  {
    id: "5",
    type: "sell",
    name: "Cardano",
    symbol: "ADA",
    amount: "500 ADA",
    price: "$0.58",
    total: "-$290.00",
    date: "Dec 28, 03:22 PM",
    status: "completed",
  },
  {
    id: "6",
    type: "swap",
    name: "BNB",
    symbol: "BNB",
    amount: "3 BNB",
    toName: "Ethereum",
    toSymbol: "ETH",
    toAmount: "0.45 ETH",
    price: "$312.00",
    total: "$936.00",
    date: "Dec 27, 06:18 PM",
    status: "completed",
  },
  {
    id: "7",
    type: "receive",
    name: "Polygon",
    symbol: "MATIC",
    amount: "250 MATIC",
    price: "$0.85",
    total: "+$212.50",
    date: "Dec 26, 01:45 PM",
    status: "completed",
  },
  {
    id: "8",
    type: "send",
    name: "Bitcoin",
    symbol: "BTC",
    amount: "0.15 BTC",
    price: "$43,100.00",
    total: "-$6,465.00",
    date: "Dec 25, 10:30 AM",
    status: "pending",
  },
]

export default function TransactionsScreen() {
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const router = useRouter()

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "send":
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke={colors.error}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )
      case "receive":
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M17 7L7 17M7 17H17M7 17V7"
              stroke={colors.success}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )
      case "swap":
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M7 16V4M7 4L3 8M7 4L11 8"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M17 8V20M17 20L21 16M17 20L13 16"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )
      case "buy":
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke={colors.success}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M2 17L12 22L22 17"
              stroke={colors.success}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M2 12L12 17L22 12"
              stroke={colors.success}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )
      case "sell":
        return (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
              stroke={colors.error}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )
    }
  }

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case "send":
      case "sell":
        return colors.error
      case "receive":
      case "buy":
        return colors.success
      case "swap":
        return colors.primary
    }
  }

  const getTransactionTypeLabel = (type: TransactionType) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => (
      <TouchableOpacity style={[styles.transactionCard, { backgroundColor: colors.card }]} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: getTransactionTypeColor(item.type) + "20" }]}>
          {getTransactionIcon(item.type)}
        </View>

        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionLeft}>
              <Text style={[styles.transactionType, { color: getTransactionTypeColor(item.type) }]}>
                {getTransactionTypeLabel(item.type)}
              </Text>
              <Text style={[styles.cryptoName, { color: colors.text }]}>
                {item.name} <Text style={[styles.cryptoSymbol, { color: colors.textSecondary }]}>({item.symbol})</Text>
              </Text>
            </View>
            <View style={styles.transactionRight}>
              <Text
                style={[
                  styles.totalAmount,
                  {
                    color:
                      item.type === "send" || item.type === "sell"
                        ? colors.error
                        : item.type === "receive" || item.type === "buy"
                          ? colors.success
                          : colors.text,
                  },
                ]}
              >
                {item.total}
              </Text>
            </View>
          </View>

          {item.type === "swap" && item.toName && (
            <View style={styles.swapDetails}>
              <Text style={[styles.swapText, { color: colors.textSecondary }]}>
                {item.amount} → {item.toAmount}
              </Text>
            </View>
          )}

          <View style={styles.transactionFooter}>
            <Text style={[styles.transactionAmount, { color: colors.textSecondary }]}>
              {item.type === "swap" ? `${item.amount} → ${item.toAmount}` : item.amount}
            </Text>
            <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{item.date}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    item.status === "completed"
                      ? colors.success
                      : item.status === "pending"
                        ? colors.warning
                        : colors.error,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === "completed"
                      ? colors.success
                      : item.status === "pending"
                        ? colors.warning
                        : colors.error,
                },
              ]}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [colors],
  )

  const keyExtractor = useCallback((item: Transaction) => item.id, [])

  const renderEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 11L12 14L22 4"
            stroke={colors.textSecondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
            stroke={colors.textSecondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions yet</Text>
        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
          Your transaction history will appear here
        </Text>
      </View>
    ),
    [colors],
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.push("/account")} style={styles.backButton} activeOpacity={0.7}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Full History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Transactions List */}
      <FlatList
        data={MOCK_TRANSACTIONS}
        renderItem={renderTransaction}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
      />
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
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionType: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cryptoName: {
    fontSize: 15,
    fontWeight: "600",
  },
  cryptoSymbol: {
    fontSize: 13,
    fontWeight: "400",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  swapDetails: {
    marginBottom: 6,
  },
  swapText: {
    fontSize: 13,
    fontWeight: "500",
  },
  transactionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 12,
  },
  transactionDate: {
    fontSize: 11,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
})
