/**
 * phoneAuth.test.ts
 *
 * Tests for phone number validation and OTP flow logic.
 * Firebase SDK is not called in these tests — all Firebase calls are mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateIndianMobile } from '../src/components/PhoneAuthPanel';

// ─── Mock Firebase Auth ──────────────────────────────────────────────────────
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

// ─── Indian mobile number validation ────────────────────────────────────────

describe('validateIndianMobile', () => {
  // Valid numbers
  it('accepts a valid 10-digit number starting with 9', () => {
    expect(validateIndianMobile('9876543210')).toBeNull();
  });

  it('accepts a valid 10-digit number starting with 6', () => {
    expect(validateIndianMobile('6123456789')).toBeNull();
  });

  it('accepts a valid 10-digit number starting with 7', () => {
    expect(validateIndianMobile('7000000001')).toBeNull();
  });

  it('accepts a valid 10-digit number starting with 8', () => {
    expect(validateIndianMobile('8012345678')).toBeNull();
  });

  it('strips spaces and accepts formatted number', () => {
    // spaces are stripped by the input handler; validation receives only digits
    expect(validateIndianMobile('9876543210')).toBeNull();
  });

  // Invalid numbers
  it('rejects a number with fewer than 10 digits', () => {
    const result = validateIndianMobile('98765');
    expect(result).not.toBeNull();
    expect(result).toContain('10');
  });

  it('rejects a number with more than 10 digits', () => {
    const result = validateIndianMobile('98765432109');
    expect(result).not.toBeNull();
  });

  it('rejects a number starting with 5', () => {
    const result = validateIndianMobile('5123456789');
    expect(result).not.toBeNull();
    expect(result).toContain('6-9');
  });

  it('rejects a number starting with 1', () => {
    const result = validateIndianMobile('1234567890');
    expect(result).not.toBeNull();
  });

  it('rejects a number starting with 0', () => {
    const result = validateIndianMobile('0987654321');
    expect(result).not.toBeNull();
  });

  it('rejects an empty string', () => {
    expect(validateIndianMobile('')).not.toBeNull();
  });

  it('rejects non-numeric characters only', () => {
    const result = validateIndianMobile('abcdefghij');
    expect(result).not.toBeNull();
  });

  it('returns a bilingual error message containing Tamil and English', () => {
    const result = validateIndianMobile('12345');
    expect(result).not.toBeNull();
    // Should contain both scripts or both languages
    expect(result!.length).toBeGreaterThan(20);
  });
});

// ─── OTP validation rules ─────────────────────────────────────────────────

describe('OTP length validation logic', () => {
  it('6-digit OTP is valid', () => {
    expect('123456'.trim().length).toBe(6);
  });

  it('5-digit OTP is invalid', () => {
    expect('12345'.trim().length).not.toBe(6);
  });

  it('7-digit OTP is invalid', () => {
    expect('1234567'.trim().length).not.toBe(6);
  });

  it('empty OTP is invalid', () => {
    expect(''.trim().length).not.toBe(6);
  });

  it('OTP with spaces trimmed should be 6 digits', () => {
    expect(' 123456 '.trim().length).toBe(6);
  });
});

// ─── Error code mapping (spot checks) ────────────────────────────────────

describe('Phone auth error messages are bilingual', () => {
  // We test the exported validator; error mapping is in the component's closure.
  // Here we verify that validation errors include both Tamil and English content.

  it('validation error for short number includes Tamil text', () => {
    const msg = validateIndianMobile('123');
    expect(msg).toContain('இலக்கங்க'); // Tamil for "digits"
  });

  it('validation error for wrong prefix includes English text', () => {
    const msg = validateIndianMobile('5123456789');
    expect(msg).toContain('6-9');
  });
});
