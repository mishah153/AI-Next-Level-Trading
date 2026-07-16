import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

/**
 * AES-256-GCM encryption for sensitive data at rest (exchange API keys).
 * Format: iv:authTag:ciphertext (all hex).
 */
@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const hex = config.get<string>('ENCRYPTION_KEY', '');
    // Accept a 64-char hex key, otherwise derive a 32-byte key deterministically.
    this.key =
      hex.length === 64
        ? Buffer.from(hex, 'hex')
        : scryptSync(hex, 'ainextlevel-salt', 32);
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(payload: string): string {
    const [ivHex, tagHex, dataHex] = payload.split(':');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  }

  /** Masks a secret for display, e.g. "abcd…wxyz". */
  mask(value: string): string {
    if (value.length <= 8) return '••••';
    return `${value.slice(0, 4)}…${value.slice(-4)}`;
  }
}
