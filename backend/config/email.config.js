// DEPRECATED: Email functionality has been removed
// OTP is now sent via alternative methods (SMS/push notification/etc)
// This file is kept for reference but is no longer used

// Configuración de email
// Para usar Gmail, necesitas:
// 1. Habilitar 2FA en tu cuenta de Google
// 2. Generar una "App Password" específica para esta aplicación
// 3. Usar esa App Password como EMAIL_PASS

module.exports = {
  // Cambia estos valores por tus credenciales reales
  EMAIL_USER: 'grepbizi@gmail.com', // Tu email de Gmail
  EMAIL_PASS: 'Asdqwerf1', // Tu contraseña de Gmail (pero necesitas App Password)
  
  // O usa variables de entorno si las tienes configuradas
  getEmailUser: () => process.env.EMAIL_USER || 'grepbizi@gmail.com',
  getEmailPass: () => process.env.EMAIL_PASS || 'Asdqwerf1'
}
