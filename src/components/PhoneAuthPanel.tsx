/**
 * PhoneAuthPanel.tsx
 *
 * Phone number + OTP authentication panel for WattWise.
 *
 * Flow:
 *   1. User enters +91 mobile number → validated to Indian format
 *   2. reCAPTCHA verifier is created and attached to an invisible DOM div
 *   3. Firebase sends OTP via SMS using signInWithPhoneNumber()
 *   4. User enters 6-digit OTP → verified with confirmationResult.confirm()
 *   5. On success → auth state updates via onAuthStateChanged in AuthContext
 *
 * ROOT CAUSE OF "operation-not-allowed":
 *   This error means Phone Authentication is NOT enabled in Firebase Console.
 *   No code change can fix it — you must enable it manually (see README).
 *
 * reCAPTCHA notes:
 *   - One verifier instance at a time — cleared on retry, error, and unmount
 *   - Container div must be in the DOM before RecaptchaVerifier is created
 *   - Uses invisible reCAPTCHA (no user interaction needed)
 *
 * This component does NOT grant admin access.
 * Firebase SDK v9+ modular API is used throughout.
 */
import { useState, useRef, useEffect, useId } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth, isConfigured } from '../firebase/config';

// ─── Phone number helpers ────────────────────────────────────────────────────

/**
 * Validate an Indian mobile number (10 digits, starts with 6–9).
 * Returns null when valid, or a bilingual error string when invalid.
 *
 * @param number - Raw string from the input (may contain spaces/dashes)
 */
export function validateIndianMobile(number: string): string | null {
  const digits = number.replace(/\D/g, '');
  if (digits.length !== 10) {
    return 'தொலைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும். (Phone number must be 10 digits.)';
  }
  if (!/^[6-9]/.test(digits)) {
    return 'சரியான இந்திய மொபைல் எண் உள்ளிடவும். (Enter a valid Indian mobile number starting with 6-9.)';
  }
  return null;
}

/**
 * Convert a 10-digit Indian number to E.164 format (+91XXXXXXXXXX).
 * Strips any non-digit characters first.
 */
export function toE164India(digits: string): string {
  return `+91${digits.replace(/\D/g, '')}`;
}

/**
 * Map Firebase Auth error codes to bilingual Tamil + English user messages.
 * The original error is always logged to the console for developers.
 * Exported so tests can verify message content without rendering the component.
 */
export function mapPhoneAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  // Always log the raw error for developers
  if (import.meta.env.DEV) {
    console.error('[PhoneAuth] Firebase error:', code, error);
  }
  switch (code) {
    case 'auth/operation-not-allowed':
      return (
        'Firebase Console-ல் Phone Authentication இயக்கப்படவில்லை. ' +
        'Authentication → Sign-in method → Phone → Enable → Save செய்யவும். ' +
        '(Phone Authentication is not enabled — go to Firebase Console → ' +
        'Authentication → Sign-in method → Phone → Enable → Save.)'
      );
    case 'auth/invalid-phone-number':
      return 'தவறான தொலைபேசி எண். சரியான +91 எண்ணை உள்ளிடவும். (Invalid phone number — enter a valid +91 number.)';
    case 'auth/missing-phone-number':
      return 'தொலைபேசி எண் உள்ளிட வேண்டும். (Phone number is required.)';
    case 'auth/too-many-requests':
      return 'அதிக SMS முயற்சிகள். சிறிது நேரம் காத்திருந்து மீண்டும் முயற்சிக்கவும். (Too many attempts — please wait before retrying.)';
    case 'auth/invalid-verification-code':
      return 'தவறான OTP குறியீடு. மீண்டும் சரிபார்க்கவும். (Incorrect OTP — please check and try again.)';
    case 'auth/code-expired':
      return 'OTP காலாவதியாகியது. புதிய OTP கோரவும். (OTP has expired — please request a new one.)';
    case 'auth/missing-verification-code':
      return '6 இலக்க OTP குறியீட்டை உள்ளிடவும். (Please enter the 6-digit OTP.)';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA சரிபார்ப்பு தோல்வியடைந்தது. பக்கத்தை புதுப்பித்து மீண்டும் முயற்சிக்கவும். (reCAPTCHA failed — please refresh and try again.)';
    case 'auth/missing-app-credential':
      return 'reCAPTCHA அமைப்பில் பிழை உள்ளது. பக்கத்தை புதுப்பித்து மீண்டும் முயற்சிக்கவும். (App credential missing — please refresh and try again.)';
    case 'auth/unauthorized-domain':
      return 'இந்த domain Firebase-ல் அனுமதிக்கப்படவில்லை. Firebase Console → Authentication → Authorized domains-ல் சேர்க்கவும். (This domain is not authorised — add it in Firebase Console → Authentication → Authorized domains.)';
    case 'auth/network-request-failed':
      return 'நெட்வொர்க் பிழை. இணைய இணைப்பை சரிபார்க்கவும். (Network error — check your internet connection.)';
    case 'auth/quota-exceeded':
      return 'SMS வரம்பு மீறப்பட்டது. நாளை மீண்டும் முயற்சிக்கவும். (SMS quota exceeded — try again tomorrow.)';
    case 'auth/billing-not-enabled':
      return 'Firebase project-ல் Billing இயக்கப்படவில்லை. Firebase Console → Project Settings → Billing-ல் Blaze plan இணைக்கவும். (Billing not enabled — link a Blaze billing account in Firebase Console.)';
    default:
      return (
        (error as { message?: string })?.message ??
        'பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும். (An error occurred — please try again.)'
      );
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

interface PhoneAuthPanelProps {
  /** Called after successful OTP verification */
  onSuccess?: () => void;
}

type Step = 'phone' | 'otp' | 'success';

export default function PhoneAuthPanel({ onSuccess }: PhoneAuthPanelProps) {
  const uid = useId();

  const [step, setStep]               = useState<Step>('phone');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [otp, setOtp]                 = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const confirmationRef    = useRef<ConfirmationResult | null>(null);
  const recaptchaRef       = useRef<RecaptchaVerifier | null>(null);
  const recaptchaDivRef    = useRef<HTMLDivElement | null>(null);

  // ── Cleanup reCAPTCHA on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearVerifier();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resend cooldown countdown ─────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // ─── reCAPTCHA helpers ────────────────────────────────────────────────────

  function clearVerifier() {
    try {
      recaptchaRef.current?.clear();
    } catch (_) {
      // Silently ignore — verifier may already be cleared
    }
    recaptchaRef.current = null;
  }

  /**
   * Create a fresh invisible RecaptchaVerifier attached to the DOM div.
   * The div must be mounted before this is called (it always is, because
   * this is only called from handleSendOtp which runs after the phone-input
   * step has rendered the div).
   */
  function createVerifier(): RecaptchaVerifier {
    if (!auth) throw new Error('Firebase auth is not initialised');
    if (!recaptchaDivRef.current) throw new Error('reCAPTCHA container is not mounted');

    clearVerifier(); // ensure no stale instance

    const verifier = new RecaptchaVerifier(auth, recaptchaDivRef.current, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved automatically — no user action needed
      },
      'error-callback': () => {
        setError(
          'reCAPTCHA தோல்வியடைந்தது. பக்கத்தை புதுப்பிக்கவும். (reCAPTCHA failed — please refresh.)'
        );
        clearVerifier();
      },
    });
    recaptchaRef.current = verifier;
    return verifier;
  }

  // ── Send OTP ─────────────────────────────────────────────────────────────

  async function handleSendOtp() {
    setError(null);

    const validationError = validateIndianMobile(phoneDigits);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!auth) {
      setError(
        'Firebase இணைக்கப்படவில்லை. .env கோப்பில் VITE_FIREBASE_* மதிப்புகளை சேர்க்கவும். ' +
        '(Firebase not configured — add VITE_FIREBASE_* values to .env.)'
      );
      return;
    }

    setLoading(true);
    try {
      const verifier  = createVerifier();
      const e164      = toE164India(phoneDigits);
      const result    = await signInWithPhoneNumber(auth, e164, verifier);
      confirmationRef.current = result;
      setStep('otp');
      setResendTimer(30);
    } catch (err) {
      setError(mapPhoneAuthError(err));
      clearVerifier();
    } finally {
      setLoading(false);
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────

  async function handleVerifyOtp() {
    setError(null);

    if (otp.trim().length !== 6) {
      setError('6 இலக்க OTP குறியீட்டை உள்ளிடவும். (Enter the 6-digit OTP.)');
      return;
    }
    if (!confirmationRef.current) {
      setError('OTP அமர்வு காலாவதியாகியது. மீண்டும் தொடங்கவும். (Session expired — please restart.)');
      return;
    }

    setLoading(true);
    try {
      await confirmationRef.current.confirm(otp.trim());
      setStep('success');
      onSuccess?.();
    } catch (err) {
      setError(mapPhoneAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────

  function handleResend() {
    if (resendTimer > 0) return;
    confirmationRef.current = null;
    setOtp('');
    setError(null);
    setStep('phone');
    // React will re-render the phone step; send after a tick so the
    // reCAPTCHA div ref is refreshed in the DOM.
    setTimeout(() => void handleSendOtp(), 50);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  // ── Firebase not configured ───────────────────────────────────────────────
  if (!isConfigured) {
    return (
      <div className="phone-auth-panel panel" role="note">
        <p className="field-hint">
          📵 Firebase இணைக்கப்படவில்லை — Phone OTP கிடைக்கவில்லை.<br />
          (Firebase not configured — Phone OTP is unavailable.)
        </p>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div
        className="phone-auth-panel panel phone-auth-success"
        role="status"
        aria-live="polite"
        aria-label="Sign-in successful"
      >
        <span className="phone-auth-success-icon" aria-hidden="true">✅</span>
        <div>
          <p className="phone-auth-success-title">
            உள்நுழைவு வெற்றிகரமாக முடிந்தது! (Signed in successfully!)
          </p>
          <p className="field-hint">+91 {phoneDigits}</p>
        </div>
      </div>
    );
  }

  // ── OTP entry ─────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="phone-auth-panel panel">
        <p className="phone-auth-subtitle">
          📩 +91 {phoneDigits} க்கு OTP அனுப்பப்பட்டது.{' '}
          (OTP sent to +91 {phoneDigits}.)
        </p>

        <div className="form-group">
          <label htmlFor={`${uid}-otp`}>
            6-இலக்க OTP குறியீடு (6-digit OTP code)
          </label>
          <input
            id={`${uid}-otp`}
            type="tel"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="phone-auth-otp-input"
            autoComplete="one-time-code"
            disabled={loading}
            autoFocus
            aria-describedby={`${uid}-otp-status`}
          />
        </div>

        {/* aria-live region for OTP errors */}
        <p
          id={`${uid}-otp-status`}
          className={error ? 'field-error' : ''}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {error ?? ''}
        </p>

        <div className="phone-auth-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleVerifyOtp()}
            disabled={loading || otp.length !== 6}
            aria-busy={loading}
          >
            {loading
              ? 'சரிபார்க்கிறது… (Verifying…)'
              : 'OTP சரிபார்க்க (Verify OTP)'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResend}
            disabled={resendTimer > 0 || loading}
            aria-label={
              resendTimer > 0
                ? `Resend OTP available in ${resendTimer} seconds`
                : 'Resend OTP'
            }
          >
            {resendTimer > 0
              ? `மீண்டும் அனுப்பு (${resendTimer}s)`
              : 'OTP மீண்டும் அனுப்பு (Resend OTP)'}
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => {
              clearVerifier();
              confirmationRef.current = null;
              setStep('phone');
              setOtp('');
              setError(null);
            }}
            disabled={loading}
          >
            எண்ணை மாற்று (Change Number)
          </button>
        </div>
      </div>
    );
  }

  // ── Phone input (default step) ────────────────────────────────────────────
  return (
    <div className="phone-auth-panel panel">
      <p className="phone-auth-title">
        📱 Phone Number மூலம் உள்நுழையவும் (Sign in with Phone Number)
      </p>

      <div className="form-group">
        <label htmlFor={`${uid}-phone`}>
          இந்திய மொபைல் எண் (Indian Mobile Number)
        </label>
        <div className="phone-auth-input-row">
          <span className="phone-auth-prefix" aria-hidden="true">🇮🇳 +91</span>
          <input
            id={`${uid}-phone`}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phoneDigits}
            onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
            placeholder="98765 43210"
            className="phone-auth-number-input"
            autoComplete="tel-national"
            disabled={loading}
            aria-label="Indian mobile number (10 digits, without country code)"
            aria-describedby={`${uid}-phone-hint ${uid}-phone-status`}
          />
        </div>
        <p id={`${uid}-phone-hint`} className="field-hint">
          6-9 தொடங்கும் 10 இலக்க மொபைல் எண் (10-digit mobile starting with 6–9)
        </p>
      </div>

      {/* aria-live region for send-OTP errors */}
      <p
        id={`${uid}-phone-status`}
        className={error ? 'field-error' : ''}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {error ?? ''}
      </p>

      {/*
        Invisible reCAPTCHA mount point.
        Must be in the DOM before RecaptchaVerifier is created.
        ref is used instead of id to avoid stale-ID issues in React strict mode.
      */}
      <div ref={recaptchaDivRef} aria-hidden="true" />

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => void handleSendOtp()}
        disabled={loading || phoneDigits.length < 10}
        style={{ width: '100%', marginTop: '0.5rem' }}
        aria-busy={loading}
      >
        {loading
          ? 'OTP அனுப்புகிறது… (Sending OTP…)'
          : 'OTP அனுப்பு (Send OTP)'}
      </button>
    </div>
  );
}
