const fs = require("fs").promises
const path = require("path")
const crypto = require("crypto")
const { hashPassword, verifyPassword } = require("../utils/crypto")
// Email functionality removed - OTP now sent via alternative method (SMS/push notification/etc)

const DB_PATH = path.join(__dirname, "../database.json")

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map()

// OTP expiration time (5 minutes)
const OTP_EXPIRATION = 5 * 60 * 1000

async function readDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("[DEV] Error reading database:", error)
    return { users: [], kycData: [] }
  }
}

async function writeDatabase(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("[DEV] Error writing database:", error)
    throw error
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex")
}

async function handleRequestPINReset(data) {
  try {
    const { userId } = data

    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      }
    }

    const db = await readDatabase()
    const user = db.users.find((u) => u.userId === userId)

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: "If an account exists, a reset code has been sent",
      }
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = Date.now() + OTP_EXPIRATION

    // Store OTP
    otpStore.set(userId, {
      otp,
      expiresAt,
      attempts: 0,
    })

    console.log(`[DEV] PIN reset OTP for userId ${userId}: ${otp}`)

    // TODO: Send OTP via SMS/push notification/alternative method
    // For now, OTP is logged to console for development

    return {
      success: true,
      message: "Reset code has been sent",
      data: {
        otp, // Only for development - remove in production
      },
    }
  } catch (error) {
    console.error("[DEV] Request PIN reset error:", error)
    return {
      success: false,
      message: "Failed to process PIN reset request",
    }
  }
}

async function handleVerifyOTP(data) {
  try {
    const { userId, otp } = data

    if (!userId || !otp) {
      return {
        success: false,
        message: "User ID and OTP are required",
      }
    }

    const otpData = otpStore.get(userId)

    if (!otpData) {
      return {
        success: false,
        message: "No OTP found for this user",
      }
    }

    // Check if OTP expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(userId)
      return {
        success: false,
        message: "OTP has expired. Please request a new one",
      }
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      otpStore.delete(userId)
      return {
        success: false,
        message: "Too many failed attempts. Please request a new OTP",
      }
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts++
      return {
        success: false,
        message: "Invalid OTP code",
      }
    }

    // Generate reset token
    const resetToken = generateResetToken()

    // Store reset token
    otpStore.set(`reset_${userId}`, {
      resetToken,
      expiresAt: Date.now() + OTP_EXPIRATION,
    })

    // Clear OTP
    otpStore.delete(userId)

    return {
      success: true,
      message: "OTP verified successfully",
      data: {
        resetToken,
      },
    }
  } catch (error) {
    console.error("[DEV] Verify OTP error:", error)
    return {
      success: false,
      message: "Failed to verify OTP",
    }
  }
}

async function handleResendOTP(data) {
  try {
    const { userId } = data

    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      }
    }

    // Clear existing OTP
    otpStore.delete(userId)

    // Generate new OTP
    return await handleRequestPINReset({ userId })
  } catch (error) {
    console.error("[DEV] Resend OTP error:", error)
    return {
      success: false,
      message: "Failed to resend OTP",
    }
  }
}

async function handleUpdatePIN(data) {
  try {
    const { userId, resetToken, newPin, confirmPin } = data

    // Validar campos requeridos
    if (!newPin || !confirmPin) {
      return {
        success: false,
        message: "New PIN and confirm PIN are required",
      }
    }

    if (newPin !== confirmPin) {
      return {
        success: false,
        message: "New PIN and confirm PIN do not match",
      }
    }

    const db = await readDatabase()
    let user

    if (resetToken) {
      // Reset de PIN via OTP (con token)
      if (!userId) {
        return {
          success: false,
          message: "User ID is required for PIN reset",
        }
      }

      // Verify reset token
      const resetData = otpStore.get(`reset_${userId}`)

      if (!resetData || resetData.resetToken !== resetToken) {
        return {
          success: false,
          message: "Invalid or expired reset token",
        }
      }

      if (Date.now() > resetData.expiresAt) {
        otpStore.delete(`reset_${userId}`)
        return {
          success: false,
          message: "Reset token has expired",
        }
      }

      user = db.users.find((u) => u.userId === userId)
      if (!user) {
        return {
          success: false,
          message: "User not found",
        }
      }

      // Clear reset token
      otpStore.delete(`reset_${userId}`)
    } else {
      // Cambio de PIN normal (usuario logueado) - actualiza PIN de KYC
      if (!userId) {
        return {
          success: false,
          message: "User ID is required",
        }
      }

      user = db.users.find((u) => u.userId === userId)
      if (!user) {
        return {
          success: false,
          message: "User not found",
        }
      }
    }

    // Hash new PIN
    const newPinHash = hashPassword(newPin)

    // Update PIN (stored as passwordHash)
    user.passwordHash = newPinHash
    user.updatedAt = new Date().toISOString()

    await writeDatabase(db)

    return {
      success: true,
      message: "PIN updated successfully",
    }
  } catch (error) {
    console.error("[DEV] Update PIN error:", error)
    return {
      success: false,
      message: "Failed to update PIN",
    }
  }
}

async function handleChangePIN(data) {
  try {
    const { userId, oldPin, newPin } = data

    if (!userId || !oldPin || !newPin) {
      return {
        success: false,
        message: "User ID, old PIN and new PIN are required",
      }
    }

    const db = await readDatabase()
    const user = db.users.find((u) => u.userId === userId)

    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    // Verify old PIN
    if (!verifyPassword(oldPin, user.passwordHash)) {
      return {
        success: false,
        message: "Invalid old PIN",
      }
    }

    // Hash new PIN
    const newPinHash = hashPassword(newPin)

    // Update PIN
    user.passwordHash = newPinHash
    user.updatedAt = new Date().toISOString()

    await writeDatabase(db)

    return {
      success: true,
      message: "PIN changed successfully",
    }
  } catch (error) {
    console.error("[DEV] Change PIN error:", error)
    return {
      success: false,
      message: "Failed to change PIN",
    }
  }
}

async function handleResetPINWithOTP(data) {
  try {
    const { userId, resetToken, newPin } = data

    if (!userId || !resetToken || !newPin) {
      return {
        success: false,
        message: "All fields are required",
      }
    }

    // Verify reset token
    const resetData = otpStore.get(`reset_${userId}`)

    if (!resetData || resetData.resetToken !== resetToken) {
      return {
        success: false,
        message: "Invalid or expired reset token",
      }
    }

    if (Date.now() > resetData.expiresAt) {
      otpStore.delete(`reset_${userId}`)
      return {
        success: false,
        message: "Reset token has expired",
      }
    }

    const db = await readDatabase()
    const user = db.users.find((u) => u.userId === userId)

    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    // Hash new PIN
    const newPinHash = hashPassword(newPin)

    // Update PIN
    user.passwordHash = newPinHash
    user.updatedAt = new Date().toISOString()

    await writeDatabase(db)

    // Clear reset token
    otpStore.delete(`reset_${userId}`)

    return {
      success: true,
      message: "PIN reset successfully",
    }
  } catch (error) {
    console.error("[DEV] Reset PIN with OTP error:", error)
    return {
      success: false,
      message: "Failed to reset PIN",
    }
  }
}

// Legacy handlers for backward compatibility (deprecated)
async function handleRequestPasswordReset(data) {
  console.warn("[DEV] handleRequestPasswordReset is deprecated, use handleRequestPINReset")
  return handleRequestPINReset(data)
}

async function handleUpdatePassword(data) {
  console.warn("[DEV] handleUpdatePassword is deprecated, use handleUpdatePIN")
  return handleUpdatePIN(data)
}

async function handleChangePassword(data) {
  console.warn("[DEV] handleChangePassword is deprecated, use handleChangePIN")
  return handleChangePIN(data)
}

async function handleResetPasswordWithOTP(data) {
  console.warn("[DEV] handleResetPasswordWithOTP is deprecated, use handleResetPINWithOTP")
  return handleResetPINWithOTP(data)
}

module.exports = {
  handleRequestPINReset,
  handleVerifyOTP,
  handleResendOTP,
  handleUpdatePIN,
  handleChangePIN,
  handleResetPINWithOTP,
  // Legacy exports
  handleRequestPasswordReset,
  handleUpdatePassword,
  handleChangePassword,
  handleResetPasswordWithOTP,
}
