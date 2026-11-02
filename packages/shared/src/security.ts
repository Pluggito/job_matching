import { createHmac, createHash, randomInt, timingSafeEqual, createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * Generates a cryptographically random 6-digit numeric PIN for physical delivery verification.
 * Example output: "592810"
 */
export function generateHandoffPin(): string {
  const pinNum = randomInt(100000, 1000000); // 100000 to 999999 inclusive
  return pinNum.toString();
}

/**
 * Hashes a delivery PIN using HMAC-SHA256 with a server secret to prevent brute-force attacks.
 */
export function hashHandoffCode(pin: string, secret: string): string {
  if (!secret) {
    throw new Error("Server secret is required for HMAC handoff code hashing.");
  }
  const cleanPin = pin.trim();
  return createHmac("sha256", secret).update(cleanPin).digest("hex");
}

/**
 * Verifies an entered PIN against the stored HMAC using constant-time byte comparison
 * to eliminate timing attack vulnerabilities.
 */
export function verifyHandoffCode(pin: string, secret: string, storedHmac: string): boolean {
  if (!pin || !secret || !storedHmac) {
    return false;
  }
  try {
    const computedHmac = hashHandoffCode(pin, secret);
    const computedBuffer = Buffer.from(computedHmac, "hex");
    const storedBuffer = Buffer.from(storedHmac, "hex");

    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return timingSafeEqual(computedBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Parses a 32-byte encryption key from Hex, Base64, or raw string buffer.
 */
function parseKeyBuffer(keyInput: string | Buffer): Buffer {
  if (Buffer.isBuffer(keyInput)) {
    if (keyInput.length !== 32) {
      throw new Error(`Encryption key buffer must be exactly 32 bytes (got ${keyInput.length}).`);
    }
    return keyInput;
  }
  if (typeof keyInput === "string") {
    // Try hex (64 chars)
    if (/^[0-9a-fA-F]{64}$/.test(keyInput)) {
      return Buffer.from(keyInput, "hex");
    }
    // Try base64 (44 chars)
    const b64 = Buffer.from(keyInput, "base64");
    if (b64.length === 32) {
      return b64;
    }
    // If utf-8 string of 32 chars
    const utf8 = Buffer.from(keyInput, "utf8");
    if (utf8.length === 32) {
      return utf8;
    }
  }
  throw new Error("Encryption key must resolve to exactly 32 bytes for AES-256-GCM.");
}

export interface EncryptedFieldResult {
  encrypted: string; // Base64 ciphertext
  iv: string;        // Base64 12-byte IV
  tag: string;       // Base64 16-byte auth tag
  keyVersion: number;
}

/**
 * Encrypts a sensitive field (such as a bank account number) using AES-256-GCM with per-record IV and key version.
 */
export function encryptField(
  plaintext: string,
  secretKey: string | Buffer,
  keyVersion = 1
): EncryptedFieldResult {
  const keyBuffer = parseKeyBuffer(secretKey);
  const ivBuffer = randomBytes(12); // Standard 12-byte IV for GCM

  const cipher = createCipheriv("aes-256-gcm", keyBuffer, ivBuffer);
  const encryptedBuffer = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tagBuffer = cipher.getAuthTag();

  return {
    encrypted: encryptedBuffer.toString("base64"),
    iv: ivBuffer.toString("base64"),
    tag: tagBuffer.toString("base64"),
    keyVersion,
  };
}

/**
 * Decrypts a sensitive field previously encrypted with AES-256-GCM.
 */
export function decryptField(
  encryptedBase64: string,
  ivBase64: string,
  tagBase64: string,
  secretKey: string | Buffer
): string {
  const keyBuffer = parseKeyBuffer(secretKey);
  const ivBuffer = Buffer.from(ivBase64, "base64");
  const tagBuffer = Buffer.from(tagBase64, "base64");
  const encryptedBuffer = Buffer.from(encryptedBase64, "base64");

  const decipher = createDecipheriv("aes-256-gcm", keyBuffer, ivBuffer);
  decipher.setAuthTag(tagBuffer);

  const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  return decryptedBuffer.toString("utf8");
}

/**
 * Verifies Paystack webhook signature using HMAC-SHA512 with timingSafeEqual.
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  secretKey: string
): boolean {
  if (!signature || !secretKey || !rawBody) {
    return false;
  }
  try {
    const computedHash = createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const hashBuffer = Buffer.from(computedHash);
    const signatureBuffer = Buffer.from(signature);

    if (hashBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return timingSafeEqual(hashBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

/**
 * Computes Monnify webhook transaction hash:
 * SHA512(clientSecret + "|" + paymentReference + "|" + amountPaid + "|" + paidOn + "|" + transactionReference)
 */
export function computeMonnifyTransactionHash(params: {
  clientSecret: string;
  paymentReference: string;
  amountPaid: string | number;
  paidOn: string;
  transactionReference: string;
}): string {
  const { clientSecret, paymentReference, amountPaid, paidOn, transactionReference } = params;
  const rawString = `${clientSecret}|${paymentReference}|${amountPaid}|${paidOn}|${transactionReference}`;
  return createHash("sha512").update(rawString).digest("hex");
}

/**
 * Verifies Monnify webhook request using either:
 * 1. The `monnify-signature` header (HMAC-SHA512 of the raw request body with secretKey)
 * 2. Or the `transactionHash` property inside the eventData object
 */
export function verifyMonnifyWebhookSignature(params: {
  rawBody?: string;
  signatureHeader?: string | null;
  transactionHash?: string | null;
  computedHash?: string;
  secretKey: string;
}): boolean {
  const { rawBody, signatureHeader, transactionHash, computedHash, secretKey } = params;

  if (signatureHeader && rawBody && secretKey) {
    try {
      const expected = createHmac("sha512", secretKey).update(rawBody).digest("hex");
      const a = Buffer.from(expected);
      const b = Buffer.from(signatureHeader);
      if (a.length === b.length && timingSafeEqual(a, b)) {
        return true;
      }
    } catch {
      // continue to hash check
    }
  }

  if (transactionHash && computedHash) {
    try {
      const a = Buffer.from(transactionHash.toLowerCase());
      const b = Buffer.from(computedHash.toLowerCase());
      if (a.length === b.length && timingSafeEqual(a, b)) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}
