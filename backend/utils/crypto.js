const crypto = require("crypto")

/**
 * Hash a password using SHA-256
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex")
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} True if password matches
 */
function verifyPassword(password, hash) {
  const passwordHash = hashPassword(password)
  return passwordHash === hash
}

/**
 * Generate a random user ID
 * @returns {string} Random user ID
 */
function generateUserId() {
  return `user_${crypto.randomBytes(8).toString("hex")}`
}

/**
 * Generate a random biometric ID
 * @returns {string} Random biometric ID
 */
function generateBiometricId() {
  return `bio_${crypto.randomBytes(16).toString("hex")}`
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateUserId,
  generateBiometricId,
}
