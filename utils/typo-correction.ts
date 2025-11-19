/**
 * Typo correction utility using Levenshtein distance for voice transcription
 */

// Common blockchain-related terms that might be misheard
const BLOCKCHAIN_TERMS = [
  // Actions
  "swap", "send", "receive", "sell", "buy",
  // Tokens
  "bitcoin", "btc", "ethereum", "eth", "usdt", "usdc", "solana", "sol", "bep",
  // Chains
  "ethereum", "bsc", "binance", "polygon", "arbitrum", "base", "solana",
  // Common words
  "amount", "address", "wallet", "token", "chain", "network",
]

// Common token symbols
const TOKEN_SYMBOLS = ["BTC", "ETH", "USDT", "USDC", "SOL", "BEP"]

// Chain names and their variations
const CHAIN_NAMES = [
  "ethereum", "eth",
  "bsc", "binance", "bnb chain", "binance smart chain",
  "polygon", "matic",
  "arbitrum", "arb",
  "base",
  "solana", "sol",
  "bitcoin", "btc",
]

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        )
      }
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
function similarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 1
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return 1 - distance / maxLen
}

/**
 * Find the best matching term from a list of candidates
 */
function findBestMatch(
  input: string,
  candidates: string[],
  threshold: number = 0.6
): string | null {
  const inputLower = input.toLowerCase().trim()
  
  // Exact match first
  for (const candidate of candidates) {
    if (candidate.toLowerCase() === inputLower) {
      return candidate
    }
  }

  // Find best similarity match
  let bestMatch: string | null = null
  let bestScore = 0

  for (const candidate of candidates) {
    const score = similarity(inputLower, candidate.toLowerCase())
    if (score > bestScore && score >= threshold) {
      bestScore = score
      bestMatch = candidate
    }
  }

  return bestMatch
}

/**
 * Correct typos in transcribed text by matching against known blockchain terms
 */
export function correctTypo(text: string): string {
  if (!text || text.trim().length === 0) return text

  const words = text.split(/\s+/)
  const correctedWords: string[] = []

  for (const word of words) {
    // Remove punctuation for matching
    const cleanWord = word.replace(/[.,!?;:]/g, "")
    
    // Check against blockchain terms
    const blockchainMatch = findBestMatch(cleanWord, BLOCKCHAIN_TERMS, 0.65)
    if (blockchainMatch) {
      // Preserve original capitalization if it's uppercase (likely a token symbol)
      if (word === word.toUpperCase() && word.length <= 5) {
        const tokenMatch = findBestMatch(cleanWord, TOKEN_SYMBOLS, 0.6)
        if (tokenMatch) {
          correctedWords.push(tokenMatch)
          continue
        }
      }
      correctedWords.push(blockchainMatch)
      continue
    }

    // Check token symbols (case-insensitive)
    const tokenMatch = findBestMatch(cleanWord, TOKEN_SYMBOLS, 0.6)
    if (tokenMatch) {
      correctedWords.push(tokenMatch)
      continue
    }

    // Check chain names
    const chainMatch = findBestMatch(cleanWord, CHAIN_NAMES, 0.65)
    if (chainMatch) {
      correctedWords.push(chainMatch)
      continue
    }

    // If no match found, keep original word
    correctedWords.push(word)
  }

  return correctedWords.join(" ")
}

/**
 * Extract and correct potential blockchain addresses
 */
export function correctAddress(text: string): string {
  // Ethereum/BSC/Polygon addresses (0x followed by 40 hex chars)
  const ethAddressPattern = /0x[a-fA-F0-9]{40}/g
  // Solana addresses (base58, typically 32-44 chars)
  const solAddressPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g

  let corrected = text

  // Correct common misheard characters in addresses
  corrected = corrected.replace(/zero x/gi, "0x")
  corrected = corrected.replace(/oh x/gi, "0x")
  corrected = corrected.replace(/letter o/gi, "0")
  corrected = corrected.replace(/number zero/gi, "0")

  return corrected
}

/**
 * Main function to correct typos in voice transcription
 */
export function correctVoiceTranscription(text: string): string {
  if (!text) return text

  // First correct addresses
  let corrected = correctAddress(text)

  // Then correct general typos
  corrected = correctTypo(corrected)

  return corrected
}

