import { randomBytes } from 'crypto';
import { createHmac, timingSafeEqual } from 'crypto';
import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2';

const ARGON2_PRESET = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

/**
 * Hash a password with argon2id. Salt is embedded in the resulting hash.
 */
export const hashPassword = (password: string): Promise<string> =>
  argon2Hash(password, ARGON2_PRESET);

/**
 * Verify a password against a stored hash. Supports both the current
 * argon2id format and the legacy salted HMAC-SHA256 format.
 * Returns true when the password matches; when `needsUpgrade` is set, it is
 * true for legacy hashes whose password was valid and should be re-hashed
 * with argon2 at the next save.
 */
export const verifyPassword = async (
  password: string,
  storedHash: string,
  legacySalt: string | null,
): Promise<{ valid: boolean; needsUpgrade: boolean }> => {
  if (storedHash.startsWith('$argon2')) {
    return {
      valid: await argon2Verify(storedHash, password),
      needsUpgrade: false,
    };
  }
  if (!legacySalt) return { valid: false, needsUpgrade: false };
  const valid = legacyVerify(password, storedHash, legacySalt);
  return { valid, needsUpgrade: valid };
};

export const generateSalt = () => randomBytes(16).toString('base64');

const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

/**
 * Legacy verification against pre-argon2 hashes (salted HMAC-SHA256).
 */
const legacyVerify = (
  password: string,
  storedHash: string,
  salt: string,
): boolean => {
  const hmac = createHmac('sha256', salt);
  hmac.update(password);
  return safeEqual(hmac.digest('base64'), storedHash);
};
