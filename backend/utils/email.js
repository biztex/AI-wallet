// DEPRECATED: Email functionality has been removed
// OTP is now sent via alternative methods (SMS/push notification/etc)
// This file is kept for reference but is no longer used

const nodemailer = require('nodemailer')
const { getEmailUser, getEmailPass } = require('../config/email.config')

// Configuración de email (usando Gmail como ejemplo)
const emailConfig = {
  service: 'gmail',
  auth: {
    user: getEmailUser(),
    pass: getEmailPass()
  }
}

// Crear transporter
const transporter = nodemailer.createTransport(emailConfig)

// Función para enviar OTP por email
async function sendOTPEmail(email, otp) {
  try {
    const mailOptions = {
      from: emailConfig.auth.user,
      to: email,
      subject: 'Pucket - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Password Reset Request</h2>
          <p>You requested to reset your password for your Pucket account.</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4CAF50; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from Pucket Wallet.</p>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`[DEV] OTP email sent to ${email}:`, result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[DEV] Error sending OTP email:', error)
    return { success: false, error: error.message }
  }
}

// Función para verificar la configuración de email
async function verifyEmailConfig() {
  try {
    await transporter.verify()
    console.log('[DEV] Email configuration verified successfully')
    return true
  } catch (error) {
    console.error('[DEV] Email configuration error:', error)
    return false
  }
}

module.exports = {
  sendOTPEmail,
  verifyEmailConfig
}
