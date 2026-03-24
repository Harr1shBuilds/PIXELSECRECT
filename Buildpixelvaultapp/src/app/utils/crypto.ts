import * as CryptoJS from 'crypto-js';

export function encryptText(text: string, password: string): string {
  if (!password) return text;
  return CryptoJS.AES.encrypt(text, password).toString();
}

export function decryptText(encryptedText: string, password: string): string {
  if (!password) return encryptedText;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Invalid password');
    }
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt. Invalid password or corrupted data.');
  }
}