const WebSocket = require("ws")
const crypto = require("crypto")
const authHandlers = require("./handlers/auth")
const kycHandlers = require("./handlers/kyc")
const passwordHandlers = require("./handlers/password")

// Create WebSocket server on port 3000
const wss = new WebSocket.Server({ port: 3000 })

// Store wallet accounts in memory (in production, use a database)
const walletAccounts = new Map()

console.log("[Backend] WebSocket server started on ws://192.168.100.11:3000")

wss.on("connection", (ws) => {
  console.log("[Backend] New client connected")

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message)
      console.log("[Backend] Received message:", data.type)

      let result

      switch (data.type) {
        case "signup":
          handleSignUp(ws, data.data, data.id)
          break
        case "login":
          handleLogin(ws, data.data, data.id)
          break
        case "biometric_login":
          handleBiometricLogin(ws, data.data, data.id)
          break
        case "register_biometric":
          handleRegisterBiometric(ws, data.data, data.id)
          break
        case "remove_biometric":
          handleRemoveBiometric(ws, data.data, data.id)
          break

        case "submit_kyc":
          handleSubmitKYC(ws, data.data, data.id)
          break
        case "get_kyc_status":
          handleGetKYCStatus(ws, data.data, data.id)
          break
        case "update_kyc_status":
          handleUpdateKYCStatus(ws, data.data, data.id)
          break

        case "get_user_profile":
          handleGetUserProfile(ws, data.data, data.id)
          break
        case "update_profile_image":
          handleUpdateProfileImage(ws, data.data, data.id)
          break

        case "sync_wallet":
          handleSyncWallet(ws, data.data)
          break
        case "get_wallet":
          handleGetWallet(ws, data.data)
          break
        case "update_wallet":
          handleUpdateWallet(ws, data.data)
          break
        case "delete_wallet":
          handleDeleteWallet(ws, data.data)
          break

        case "request_pin_reset":
          result = await passwordHandlers.handleRequestPINReset(data.data)
          ws.send(
            JSON.stringify({
              id: data.id,
              type: "response",
              success: result.success,
              message: result.message,
              data: result.data,
            }),
          )
          break

        case "request_password_reset":
          // Legacy - kept for backward compatibility
          result = await passwordHandlers.handleRequestPasswordReset(data.data)
          ws.send(
            JSON.stringify({
              id: data.id,
              type: "response",
              success: result.success,
              message: result.message,
              data: result.data,
            }),
          )
          break

        case "verify_otp":
          result = await passwordHandlers.handleVerifyOTP(data.data)
          ws.send(
            JSON.stringify({
              id: data.id,
              type: "response",
              success: result.success,
              message: result.message,
              data: result.data,
            }),
          )
          break

        case "resend_otp":
          result = await passwordHandlers.handleResendOTP(data.data)
          ws.send(
            JSON.stringify({
              id: data.id,
              type: "response",
              success: result.success,
              message: result.message,
              data: result.data,
            }),
          )
          break

        case "update_pin":
          result = await passwordHandlers.handleUpdatePIN(data.data)
          ws.send(
            JSON.stringify({
              id: data.id,
              type: "response",
              success: result.success,
              message: result.message,
              data: result.data,
            }),
          )
          break

        case "update_password":
          // Legacy - kept for backward compatibility
          result = await passwordHandlers.handleUpdatePassword(data.data)
          ws.send(
            JSON.stringify({
              id: data.id,
              type: "response",
              success: result.success,
              message: result.message,
              data: result.data,
            }),
          )
          break

        case "change_pin":
          result = await passwordHandlers.handleChangePIN(data.data)
          ws.send(
            JSON.stringify({
              id: data.id,
              type: "response",
              success: result.success,
              message: result.message,
              data: result.data,
            }),
          )
          break

        case "change_password":
          // Legacy - kept for backward compatibility
          result = await passwordHandlers.handleChangePassword(data.data)
          ws.send(
            JSON.stringify({
              id: data.id,
              type: "response",
              success: result.success,
              message: result.message,
              data: result.data,
            }),
          )
          break

        case "reset_password_with_otp":
          result = await passwordHandlers.handleResetPasswordWithOTP(data.data)
          ws.send(
            JSON.stringify({
              id: data.id,
              type: "response",
              success: result.success,
              message: result.message,
              data: result.data,
            }),
          )
          break

        default:
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unknown message type",
            }),
          )
      }
    } catch (error) {
      console.error("[Backend] Error processing message:", error)
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        }),
      )
    }
  })

  ws.on("close", () => {
    console.log("[Backend] Client disconnected")
  })

  ws.on("error", (error) => {
    console.error("[Backend] WebSocket error:", error)
  })

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "connected",
      message: "Connected to wallet backend",
    }),
  )
})

async function handleSignUp(ws, data, messageId) {
  try {
    const result = await authHandlers.handleSignUp(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleSignUp:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor",
        data: null,
      }),
    )
  }
}

async function handleLogin(ws, data, messageId) {
  try {
    const result = await authHandlers.handleLogin(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleLogin:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor",
        data: null,
      }),
    )
  }
}

async function handleBiometricLogin(ws, data, messageId) {
  try {
    const result = await authHandlers.handleBiometricLogin(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleBiometricLogin:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor",
        data: null,
      }),
    )
  }
}

async function handleRegisterBiometric(ws, data, messageId) {
  try {
    const result = await authHandlers.handleRegisterBiometric(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleRegisterBiometric:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor",
        data: null,
      }),
    )
  }
}

async function handleRemoveBiometric(ws, data, messageId) {
  try {
    const result = await authHandlers.handleRemoveBiometric(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleRemoveBiometric:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor",
        data: null,
      }),
    )
  }
}

async function handleSubmitKYC(ws, data, messageId) {
  try {
    const result = await kycHandlers.handleSubmitKYC(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleSubmitKYC:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor al procesar KYC",
        data: null,
      }),
    )
  }
}

async function handleGetKYCStatus(ws, data, messageId) {
  try {
    const result = await kycHandlers.handleGetKYCStatus(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleGetKYCStatus:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor al obtener estado KYC",
        data: null,
      }),
    )
  }
}

async function handleUpdateKYCStatus(ws, data, messageId) {
  try {
    const result = await kycHandlers.handleUpdateKYCStatus(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleUpdateKYCStatus:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor al actualizar estado KYC",
        data: null,
      }),
    )
  }
}

async function handleGetUserProfile(ws, data, messageId) {
  try {
    const result = await kycHandlers.handleGetUserProfile(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result.data,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleGetUserProfile:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor al obtener perfil",
        data: null,
      }),
    )
  }
}

async function handleUpdateProfileImage(ws, data, messageId) {
  try {
    const result = await kycHandlers.handleUpdateProfileImage(data)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: result.success,
        message: result.message,
        data: result,
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleUpdateProfileImage:", error)
    ws.send(
      JSON.stringify({
        id: messageId,
        type: "response",
        success: false,
        message: "Error interno del servidor al actualizar imagen",
        data: null,
      }),
    )
  }
}

function handleSyncWallet(ws, data) {
  try {
    const { evmAddress, solanaAddress, encryptedSeed, timestamp } = data

    if (!evmAddress || !solanaAddress) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Missing required fields",
        }),
      )
      return
    }

    const walletId = crypto
      .createHash("sha256")
      .update(evmAddress + solanaAddress)
      .digest("hex")

    walletAccounts.set(walletId, {
      id: walletId,
      evmAddress,
      solanaAddress,
      encryptedSeed,
      createdAt: timestamp,
      lastSynced: Date.now(),
    })

    console.log(`[Backend] Wallet synced: ${walletId}`)

    ws.send(
      JSON.stringify({
        type: "wallet_synced",
        data: {
          walletId,
          evmAddress,
          solanaAddress,
          lastSynced: Date.now(),
        },
      }),
    )
  } catch (error) {
    console.error("[Backend] Error in handleSyncWallet:", error)
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Error interno del servidor al sincronizar wallet",
      }),
    )
  }
}

function handleGetWallet(ws, data) {
  try {
    const { evmAddress, solanaAddress } = data

    const walletId = crypto
      .createHash("sha256")
      .update(evmAddress + solanaAddress)
      .digest("hex")

    const wallet = walletAccounts.get(walletId)

    if (wallet) {
      ws.send(
        JSON.stringify({
          type: "wallet_data",
          data: wallet,
        }),
      )
    } else {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Wallet not found",
        }),
      )
    }
  } catch (error) {
    console.error("[Backend] Error in handleGetWallet:", error)
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Error interno del servidor al obtener wallet",
      }),
    )
  }
}

function handleUpdateWallet(ws, data) {
  try {
    const { evmAddress, solanaAddress, encryptedSeed } = data

    const walletId = crypto
      .createHash("sha256")
      .update(evmAddress + solanaAddress)
      .digest("hex")

    const wallet = walletAccounts.get(walletId)

    if (wallet) {
      wallet.encryptedSeed = encryptedSeed || wallet.encryptedSeed
      wallet.lastSynced = Date.now()
      walletAccounts.set(walletId, wallet)

      ws.send(
        JSON.stringify({
          type: "wallet_updated",
          data: wallet,
        }),
      )
    } else {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Wallet not found",
        }),
      )
    }
  } catch (error) {
    console.error("[Backend] Error in handleUpdateWallet:", error)
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Error interno del servidor al actualizar wallet",
      }),
    )
  }
}

function handleDeleteWallet(ws, data) {
  try {
    const { evmAddress, solanaAddress } = data

    const walletId = crypto
      .createHash("sha256")
      .update(evmAddress + solanaAddress)
      .digest("hex")

    if (walletAccounts.delete(walletId)) {
      ws.send(
        JSON.stringify({
          type: "wallet_deleted",
          data: { walletId },
        }),
      )
    } else {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Wallet not found",
        }),
      )
    }
  } catch (error) {
    console.error("[Backend] Error in handleDeleteWallet:", error)
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Error interno del servidor al eliminar wallet",
      }),
    )
  }
}

process.on("SIGINT", () => {
  console.log("[Backend] Shutting down server...")
  wss.close(() => {
    console.log("[Backend] Server closed")
    process.exit(0)
  })
})
