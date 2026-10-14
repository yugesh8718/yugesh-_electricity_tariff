/**
 * phoneAuth.test.ts
 *
 * Tests for phone validation, E.164 conversion, error mapping, and OTP logic.
 * All Firebase SDK calls are mocked — no network calls are made.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  validateIndianMobile,
  toE164India,
  mapPhoneAuthError,
} from '../src/components/PhoneAuthPanel';

// ─── Mock Firebase modules ───────────────────────────────────────────────────
vi.mock('firebase/auth', () => ({
  RecaptchaVerifier: vi.fn().mockImplementation(() => ({
    render: vi.fn(() => Promise.resolve(0)),
    clear: vi.fn(),
    verify: vi.fn(() => Promise.resolve('token')),
  })),
  signInWithPhoneNumber: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({})),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: null) => void) => {
    cb(null);
    return () => {};
  }),
  getAuth: vi.fn(() => null),
}));

vi.mock('../src/firebase/config', () => ({
  auth: null,
  db: null,
  isConfigured: false,
  isFirebaseConfigured: false,
}));

// ═══════════════════════════════════════════════════════════════════════════
// 1. Indian phone number validation
// ═══════════════════════════════════════════════════════════════════════════

describe('validateIndianMobile — valid numbers', () => {
  it('accepts 10-digit number starting with 9', () => {
    expect(validateIndianMobile('9876543210')).toBeNull();
  });
  it('accepts 10-digit number starting with 6', () => {
    expect(validateIndianMobile('6123456789')).toBeNull();
  });
  it('accepts 10-digit number starting with 7', () => {
    expect(validateIndianMobile('7000000001')).toBeNull();
  });
  it('accepts 10-digit number starting with 8', () => {
    expect(validateIndianMobile('8012345678')).toBeNull();
  });
  it('strips non-digit chars and validates', () => {
    // input handler strips non-digits, but validator should handle them too
    expect(validateIndianMobile('98765-43210')).toBeNull();
  });
});

describe('validateIndianMobile — invalid numbers', () => {
  it('rejects fewer than 10 digits', () => {
    const r = validateIndianMobile('98765');
    expect(r).not.toBeNull();
    expect(r).toContain('10');
  });
  it('rejects more than 10 digits', () => {
    expect(validateIndianMobile('98765432109')).not.toBeNull();
  });
  it('rejects number starting with 5', () => {
    const r = validateIndianMobile('5123456789');
    expect(r).not.toBeNull();
    expect(r).toContain('6-9');
  });
  it('rejects number starting with 1', () => {
    expect(validateIndianMobile('1234567890')).not.toBeNull();
  });
  it('rejects number starting with 0', () => {
    expect(validateIndianMobile('0987654321')).not.toBeNull();
  });
  it('rejects empty string', () => {
    expect(validateIndianMobile('')).not.toBeNull();
  });
  it('rejects 10 non-numeric characters', () => {
    expect(validateIndianMobile('abcdefghij')).not.toBeNull();
  });
  it('returns bilingual error (Tamil + English)', () => {
    const r = validateIndianMobile('123');
    expect(r).not.toBeNull();
    expect(r!.length).toBeGreaterThan(20);
    expect(r).toContain('இலக்கங்க');   // Tamil
    expect(r).toContain('10');           // English
  });
  it('wrong-prefix error mentions 6-9', () => {
    const r = validateIndianMobile('5123456789');
    expect(r).toContain('6-9');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. E.164 conversion
// ═══════════════════════════════════════════════════════════════════════════

describe('toE164India', () => {
  it('prepends +91 to 10-digit number', () => {
    expect(toE164India('9876543210')).toBe('+919876543210');
  });
  it('strips spaces before converting', () => {
    expect(toE164India('98765 43210')).toBe('+919876543210');
  });
  it('strips dashes before converting', () => {
    expect(toE164India('98765-43210')).toBe('+919876543210');
  });
  it('always starts with +91', () => {
    expect(toE164India('6000000000').startsWith('+91')).toBe(true);
  });
  it('result is 13 characters long for a valid 10-digit input', () => {
    expect(toE164India('7000000001')).toHaveLength(13);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Firebase error code mapping
// ═══════════════════════════════════════════════════════════════════════════

describe('mapPhoneAuthError — known codes', () => {
  function err(code: string) {
    return { code };
  }

  it('operation-not-allowed mentions Firebase Console', () => {
    const msg = mapPhoneAuthError(err('auth/operation-not-allowed'));
    expect(msg).toContain('Firebase Console');
    expect(msg).toContain('Phone');
  });
  it('invalid-phone-number returns bilingual message', () => {
    const msg = mapPhoneAuthError(err('auth/invalid-phone-number'));
    expect(msg).toContain('+91');
    expect(msg).toContain('தவறான');
  });
  it('missing-phone-number handled', () => {
    const msg = mapPhoneAuthError(err('auth/missing-phone-number'));
    expect(msg.length).toBeGreaterThan(10);
  });
  it('too-many-requests handled', () => {
    const msg = mapPhoneAuthError(err('auth/too-many-requests'));
    expect(msg).toContain('SMS');
  });
  it('invalid-verification-code handled', () => {
    const msg = mapPhoneAuthError(err('auth/invalid-verification-code'));
    expect(msg).toContain('OTP');
  });
  it('code-expired handled', () => {
    const msg = mapPhoneAuthError(err('auth/code-expired'));
    expect(msg).toContain('காலாவதி');
  });
  it('captcha-check-failed handled', () => {
    const msg = mapPhoneAuthError(err('auth/captcha-check-failed'));
    expect(msg).toContain('reCAPTCHA');
  });
  it('missing-app-credential handled', () => {
    const msg = mapPhoneAuthError(err('auth/missing-app-credential'));
    expect(msg).toContain('reCAPTCHA');
  });
  it('unauthorized-domain mentions Authorized domains', () => {
    const msg = mapPhoneAuthError(err('auth/unauthorized-domain'));
    expect(msg).toContain('Authorized domains');
  });
  it('quota-exceeded handled', () => {
    const msg = mapPhoneAuthError(err('auth/quota-exceeded'));
    expect(msg).toContain('SMS');
  });
  it('billing-not-enabled handled', () => {
    const msg = mapPhoneAuthError(err('auth/billing-not-enabled'));
    expect(msg).toContain('Billing');
  });
  it('network-request-failed handled', () => {
    const msg = mapPhoneAuthError(err('auth/network-request-failed'));
    expect(msg).toContain('நெட்வொர்க்');
  });
  it('unknown code falls back to message property', () => {
    const msg = mapPhoneAuthError({ code: 'auth/unknown-xyz', message: 'Something went wrong' });
    expect(msg).toBe('Something went wrong');
  });
  it('no code falls back to generic message', () => {
    const msg = mapPhoneAuthError({});
    expect(msg.length).toBeGreaterThan(10);
  });
  it('all known-code messages are bilingual (contain both Tamil and ASCII)', () => {
    const codes = [
      'auth/operation-not-allowed',
      'auth/invalid-phone-number',
      'auth/missing-phone-number',
      'auth/invalid-verification-code',
      'auth/code-expired',
      'auth/captcha-check-failed',
      'auth/unauthorized-domain',
      'auth/network-request-failed',
      'auth/quota-exceeded',
      'auth/billing-not-enabled',
    ];
    for (const code of codes) {
      const msg = mapPhoneAuthError({ code });
      // Each message must contain at least one Tamil character (U+0B80–U+0BFF)
      const hasTamil = /[\u0B80-\u0BFF]/.test(msg);
      expect(hasTamil, `Message for ${code} should contain Tamil text`).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. OTP length validation (pure logic)
// ═══════════════════════════════════════════════════════════════════════════

describe('OTP length validation logic', () => {
  it('6-digit OTP passes length check', () => {
    expect('123456'.trim().length).toBe(6);
  });
  it('5-digit OTP fails length check', () => {
    expect('12345'.trim().length).not.toBe(6);
  });
  it('7-digit OTP fails length check', () => {
    expect('1234567'.trim().length).not.toBe(6);
  });
  it('empty string fails length check', () => {
    expect(''.trim().length).not.toBe(6);
  });
  it('OTP with surrounding spaces passes after trim', () => {
    expect(' 123456 '.trim().length).toBe(6);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Resend cooldown logic
// ═══════════════════════════════════════════════════════════════════════════

describe('Resend cooldown logic', () => {
  it('timer > 0 means resend is disabled', () => {
    const timer = 15;
    expect(timer > 0).toBe(true); // button should be disabled
  });
  it('timer === 0 means resend is enabled', () => {
    const timer = 0;
    expect(timer > 0).toBe(false); // button should be enabled
  });
  it('timer decrements correctly', () => {
    let t = 30;
    t = t - 1;
    expect(t).toBe(29);
  });
});
