const fs = require("fs").promises
const path = require("path")
const { hashPassword, verifyPassword, generateUserId, generateBiometricId } = require("../utils/crypto")
const { createToken } = require("../utils/jwt")

const DB_PATH = path.join(__dirname, "../database.json")

/**
 * Load database
 */
async function loadDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("[Backend] Error loading database:", error)
    return { users: [], kyc: [] }
  }
}

/**
 * Save database
 */
async function saveDatabase(db) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8")
  } catch (error) {
    console.error("[Backend] Error saving database:", error)
  }
}

/**
 * Handle user signup - No longer requires PIN, auto-generates userId
 */
async function handleSignUp(data) {
  const { email, phone } = data

  const db = await loadDatabase()

  const userId = generateUserId()

  const newUser = {
    userId,
    email: email || null,
    phone: phone || null,
    createdAt: new Date().toISOString(),
    biometric: null,
  }

  db.users.push(newUser)

  // Create KYC entry with "not_started" status
  const kycEntry = {
    userId,
    status: "not_started",
    idType: null,
    region: null,
    photoUri: null,
    rejectionReason: null,
    submittedAt: null,
    updatedAt: new Date().toISOString(),
  }

  db.kyc.push(kycEntry)

  await saveDatabase(db)

  // Create JWT token
  const token = createToken({
    userId,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  })

  return {
    success: true,
    message: "User created successfully",
    userId,
    token,
  }
}

/**
 * Handle user login - Now uses biometric or token-based auth only
 */
async function handleLogin(data) {
  const { userId, token } = data

  if (!userId) {
    return {
      success: false,
      message: "User ID is required",
    }
  }

  const db = await loadDatabase()

  // Find user
  const user = db.users.find((u) => u.userId === userId)
  if (!user) {
    return {
      success: false,
      message: "User not found",
    }
  }

  // Create JWT token
  const newToken = createToken({
    userId: user.userId,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  })

  return {
    success: true,
    message: "Login successful",
    userId: user.userId,
    token: newToken,
  }
}

/**
 * Handle biometric login
 */
async function handleBiometricLogin(data) {
  const { biometricId, biometricType } = data

  if (!biometricId || !biometricType) {
    return {
      success: false,
      message: "Biometric data is required",
    }
  }

  const db = await loadDatabase()

  // Find user with matching biometric
  const user = db.users.find(
    (u) => u.biometric && u.biometric.biometricId === biometricId && u.biometric.type === biometricType,
  )

  if (!user) {
    return {
      success: false,
      message: "Biometric not registered",
    }
  }

  // Create JWT token
  const token = createToken({
    userId: user.userId,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  })

  return {
    success: true,
    message: "Biometric login successful",
    userId: user.userId,
    token,
  }
}

/**
 * Handle biometric registration
 */
async function handleRegisterBiometric(data) {
  const { userId, biometricType } = data

  if (!userId || !biometricType) {
    return {
      success: false,
      message: "User ID and biometric type are required",
    }
  }

  const db = await loadDatabase()

  // Find user
  const userIndex = db.users.findIndex((u) => u.userId === userId)
  if (userIndex === -1) {
    return {
      success: false,
      message: "User not found",
    }
  }

  // Generate biometric ID
  const biometricId = generateBiometricId()

  // Update user with biometric data
  db.users[userIndex].biometric = {
    biometricId,
    type: biometricType,
    registeredAt: new Date().toISOString(),
  }

  await saveDatabase(db)

  return {
    success: true,
    message: "Biometric registered successfully",
    biometricId,
  }
}

/**
 * Handle biometric removal
 */
async function handleRemoveBiometric(data) {
  const { userId } = data

  if (!userId) {
    return {
      success: false,
      message: "User ID is required",
    }
  }

  const db = await loadDatabase()

  // Find user
  const userIndex = db.users.findIndex((u) => u.userId === userId)
  if (userIndex === -1) {
    return {
      success: false,
      message: "User not found",
    }
  }

  // Remove biometric data
  db.users[userIndex].biometric = null

  await saveDatabase(db)

  return {
    success: true,
    message: "Biometric removed successfully",
  }
}

module.exports = {
  handleSignUp,
  handleLogin,
  handleBiometricLogin,
  handleRegisterBiometric,
  handleRemoveBiometric,
}
