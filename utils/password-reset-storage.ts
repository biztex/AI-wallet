import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PASSWORD_RESET_USER_ID: '@pucket_password_reset_user_id',
  PASSWORD_RESET_TOKEN: '@pucket_password_reset_token',
  PASSWORD_RESET_OTP: '@pucket_password_reset_otp'
};

export class PasswordResetStorage {
  // Guardar userId usado para reset de PIN
  static async setResetUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD_RESET_USER_ID, userId);
      console.log(`[PasswordResetStorage] Reset userId saved: ${userId}`);
    } catch (error) {
      console.error('[PasswordResetStorage] Error saving reset userId:', error);
    }
  }

  // Obtener userId usado para reset de PIN
  static async getResetUserId(): Promise<string | null> {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD_RESET_USER_ID);
      console.log(`[PasswordResetStorage] Retrieved reset userId: ${userId}`);
      return userId;
    } catch (error) {
      console.error('[PasswordResetStorage] Error getting reset userId:', error);
      return null;
    }
  }

  // Guardar token de reset
  static async setResetToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD_RESET_TOKEN, token);
      console.log(`[PasswordResetStorage] Reset token saved`);
    } catch (error) {
      console.error('[PasswordResetStorage] Error saving reset token:', error);
    }
  }

  // Obtener token de reset
  static async getResetToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD_RESET_TOKEN);
      return token;
    } catch (error) {
      console.error('[PasswordResetStorage] Error getting reset token:', error);
      return null;
    }
  }

  // Guardar OTP
  static async setOTP(otp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PASSWORD_RESET_OTP, otp);
      console.log(`[PasswordResetStorage] OTP saved`);
    } catch (error) {
      console.error('[PasswordResetStorage] Error saving OTP:', error);
    }
  }

  // Obtener OTP
  static async getOTP(): Promise<string | null> {
    try {
      const otp = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORD_RESET_OTP);
      return otp;
    } catch (error) {
      console.error('[PasswordResetStorage] Error getting OTP:', error);
      return null;
    }
  }

  // Limpiar todos los datos de reset
  static async clearResetData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PASSWORD_RESET_USER_ID,
        STORAGE_KEYS.PASSWORD_RESET_TOKEN,
        STORAGE_KEYS.PASSWORD_RESET_OTP
      ]);
      console.log('[PasswordResetStorage] Reset data cleared');
    } catch (error) {
      console.error('[PasswordResetStorage] Error clearing reset data:', error);
    }
  }

  // Verificar si hay un reset en progreso
  static async hasActiveReset(): Promise<boolean> {
    try {
      const userId = await this.getResetUserId();
      const token = await this.getResetToken();
      return !!(userId && token);
    } catch (error) {
      console.error('[PasswordResetStorage] Error checking active reset:', error);
      return false;
    }
  }
}
