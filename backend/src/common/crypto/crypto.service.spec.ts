import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  const key = 'a'.repeat(64);
  const config = {
    get: (_key: string, fallback: string) => key || fallback,
  } as unknown as ConfigService;
  const crypto = new CryptoService(config);

  it('round-trips an encrypted value', () => {
    const secret = 'my-exchange-api-secret-123';
    const encrypted = crypto.encrypt(secret);
    expect(encrypted).not.toContain(secret);
    expect(crypto.decrypt(encrypted)).toBe(secret);
  });

  it('produces a distinct ciphertext each time (random IV)', () => {
    const a = crypto.encrypt('same-value');
    const b = crypto.encrypt('same-value');
    expect(a).not.toEqual(b);
    expect(crypto.decrypt(a)).toBe(crypto.decrypt(b));
  });

  it('masks a secret for display', () => {
    expect(crypto.mask('abcd1234wxyz')).toBe('abcd…wxyz');
    expect(crypto.mask('short')).toBe('••••');
  });
});
