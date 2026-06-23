import CryptoJS from 'crypto-js';

// We use a shared static key for simplicity since true E2EE with key exchange is out of scope.
// In a real production app, this key should be derived from user passwords or a secure key exchange mechanism.
const SECRET_KEY = import.meta.env.VITE_CHAT_SECRET_KEY || 'campx_secure_chat_fallback_key_2026';

export const encryptMessage = (text) => {
  if (!text) return '';
  try {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return text;
  }
};

export const decryptMessage = (ciphertext) => {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption fails (e.g. legacy plain text messages), it returns empty string
    return originalText || ciphertext;
  } catch (error) {
    // If it's plain text or decryption throws, just return the text
    return ciphertext;
  }
};
