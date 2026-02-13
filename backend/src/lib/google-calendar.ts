import crypto from 'crypto';
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const STATE_TTL_MS = 10 * 60 * 1000;

const base64UrlEncode = (input: Buffer | string) => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const base64UrlDecode = (input: string) => {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(padLength), 'base64');
};

const getEncryptionKey = () => {
  const rawKey = process.env.ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error('ENCRYPTION_KEY não configurada');
  }

  const base64Key = Buffer.from(rawKey, 'base64');
  if (base64Key.length === 32) return base64Key;

  const utf8Key = Buffer.from(rawKey, 'utf8');
  if (utf8Key.length === 32) return utf8Key;

  const hexKey = Buffer.from(rawKey, 'hex');
  if (hexKey.length === 32) return hexKey;

  throw new Error('ENCRYPTION_KEY deve ter 32 bytes (base64, hex ou texto)');
};

export const encryptToken = (plainText: string) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
};

export const decryptToken = (encryptedToken: string) => {
  const key = getEncryptionKey();
  const buffer = Buffer.from(encryptedToken, 'base64');
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};

export const getOAuth2Client = (): OAuth2Client => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('Credenciais do Google não configuradas');
  }
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
};

export const getCalendarClient = (oauth2Client: OAuth2Client) => {
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

export const createOAuthState = (userId: string) => {
  const payload = {
    userId,
    nonce: crypto.randomBytes(16).toString('hex'),
    ts: Date.now(),
  };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', getEncryptionKey())
    .update(payloadEncoded)
    .digest('base64');
  const signatureEncoded = base64UrlEncode(signature);
  return `${payloadEncoded}.${signatureEncoded}`;
};

export const verifyOAuthState = (state: string) => {
  const [payloadEncoded, signatureEncoded] = state.split('.');
  if (!payloadEncoded || !signatureEncoded) {
    throw new Error('State inválido');
  }

  const expectedSignature = crypto
    .createHmac('sha256', getEncryptionKey())
    .update(payloadEncoded)
    .digest('base64');

  if (base64UrlEncode(expectedSignature) !== signatureEncoded) {
    throw new Error('State inválido');
  }

  const payloadBuffer = base64UrlDecode(payloadEncoded);
  const payload = JSON.parse(payloadBuffer.toString('utf8')) as { userId: string; ts: number };
  if (Date.now() - payload.ts > STATE_TTL_MS) {
    throw new Error('State expirado');
  }

  return payload.userId;
};
