const crypto = require("crypto")

const JWT_SECRET = "c64b923a0269f347af2630501634c854a49a30218dddea3c606942dcbe3c151f"

/**
 * Create a JWT token
 * @param {object} payload - Token payload
 * @returns {string} JWT token
 */
function createToken(payload) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url")

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".")

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url")

    if (signature !== expectedSignature) {
      return null
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString())

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

module.exports = {
  createToken,
  verifyToken,
}
