import { NextRequest } from 'next/server';
import crypto from 'crypto';

export function getAdminPin(): string {
  return (process.env.ADMIN_PIN || '241353').trim();
}

/**
 * Constant-time PIN comparison to protect against timing attacks.
 */
export function verifyAdminPin(providedPin: string | null | undefined): boolean {
  if (!providedPin) return false;
  const cleanInput = String(providedPin).trim();
  const correctPin = getAdminPin();
  const bufA = Buffer.from(cleanInput);
  const bufB = Buffer.from(correctPin);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify whether an incoming API request contains a valid admin authentication header.
 */
export function isAuthorizedAdmin(req: NextRequest | Request): boolean {
  const pinHeader = req.headers.get('x-admin-pin') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return verifyAdminPin(pinHeader);
}
