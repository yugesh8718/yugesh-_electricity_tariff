/**
 * PhoneAuthPanel.tsx
 *
 * Phone number + OTP authentication panel for WattWise.
 *
 * Flow:
 *   1. User enters +91 mobile number → validates Indian format
 *   2. Firebase sends OTP via SMS (RecaptchaVerifier required)
 *   3. User enters 6-digit OTP → verified with Firebase
 *   4. On success → onSuccess() callback (closes panel / redirects)
 *
 * Notes:
 *   - RecaptchaVerifier is created on "Send OTP" click and cleaned up on unmount
 *   - All error messages shown in Tamil + English
 *   - Does NOT grant admin access — only regular user auth
 *   - Works only when Firebase Phone Auth is enabled in Firebase Console
 */
import { useState, useRef, useEffect, useId } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth, isConfigured } from '../firebase/config';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Validate Indian mobile: 10 digits, starts with 6-9 */
export function validateIndianMobile(number: string): string | null {
  const digits = number.replace(/\D/g, '');
  if (digits.length !== 10) return 'தொலைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும். (Phone number must be 10 digits.)';
  if (!/^[6-9]/.test(digits)) return 'சரியான இந்திய மொபைல் எண் உள்ளிடவும். (Enter a valid Indian mobile number starting with 6-9.)';
  return null;
}

/** Map Firebase auth error codes to Tamil + English messages */
function phoneAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'தவறான தொலைபேசி எண். சரியான +91 எண்ணை உள்ளிடவும். (Invalid phone number — enter a valid +91 number.)';
    case 'auth/too-many-requests':
      return 'அதிக SMS முயற்சிகள். சிறிது நேரம் காத்திருந்து மீண்டும் முயற்சிக்கவும். (Too many attempts — please wait before retrying.)';
    case 'auth/invalid-verification-code':
      return 'தவறான OTP குறியீடு. மீண்டும் சரிபார்க்கவும். (Incorrect OTP — please check and try again.)';
    case 'auth/code-expired':
      return 'OTP காலாவதியாகியது. புதிய OTP கோரவும். (OTP has expired — please request a new one.)';
    case 'auth/missing-verification-code':
      return '6 இலக்க OTP குறியீட்டை உள்ளிடவும். (Please enter the 6-digit OTP.)';
    case 'auth/operation-not-allowed':
      return 'Firebase Console-ல் Phone Authentication இயக்கப்படவில்லை. (Phone Authentication is not enabled in Firebase Console.)';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA சரிபார்ப்பு தோல்வியடைந்தது. பக்கத்தை புதுப்பித்து மீண்டும் முயற்சிக்கவும். (reCAPTCHA failed — please refresh and try again.)';
    case 'auth/network-request-failed':
      return 'நெட்வொர்க் பிழை. இணைய இணைப்பை சரிபார்க்கவும். (Network error — check your internet connection.)';
    case 'auth/quota-exceeded':
      return 'SMS வரம்பு மீறப்பட்டது. நாளை மீண்டும் முயற்சிக்கவும். (SMS quota exceeded — try again tomorrow.)';
    default:
      return (error as { message?: string })?.message ?? 'பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும். (An error occurred — please try again.)';
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

interface PhoneAuthPanelProps {
  onSuccess?: () => void;
}

type Step = 'phone' | 'otp' | 'success';

export default function PhoneAuthPanel({ onSuccess }: PhoneAuthPanelProps) {
  const uid = useId();

  const [step, setStep] = useState<Step>('phone');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerId = `recaptcha-${uid.replace(/:/g, '')}`;

  // ── Cleanup reCAPTCHA on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      try { recaptchaRef.current?.clear(); } catch (_) { /* ignore */ }
    };
  }, []);

  // ── Resend countdown timer ────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // ── Send OTP ─────────────────────────────────────────────────────────────
  async function handleSendOtp() {
    setError(null);
    const phoneError = validateIndianMobile(phoneDigits);
    if (phoneError) { setError(phoneError); return; }
    if (!auth) {
      setError('Firebase இணைக்கப்படவில்லை. .env கோப்பில் VITE_FIREBASE_* மதிப்புகளை சேர்க்கவும். (Firebase not configured — add VITE_FIREBASE_* to .env.)');
      return;
    }

    setLoading(true);
    try {
      // Clear previous verifier
      try { recaptchaRef.current?.clear(); } catch (_) { /* ignore */ }
      recaptchaRef.current = null;

      const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
        callback: () => { /* reCAPTCHA solved automatically */ },
        'error-callback': () => {
          setError('reCAPTCHA தோல்வியடைந்தது. பக்கத்தை புதுப்பிக்கவும். (reCAPTCHA failed — please refresh.)');
        },
      });
      recaptchaRef.current = verifier;

      const fullNumber = `+91${phoneDigits.replace(/\D/g, '')}`;
      const result = await signInWithPhoneNumber(auth, fullNumber, verifier);
      confirmationRef.current = result;
      setStep('otp');
      setResendTimer(30); // 30-second cooldown before resend
    } catch (err) {
      setError(phoneAuthError(err));
      try { recaptchaRef.current?.clear(); } catch (_) { /* ignore */ }
      recaptchaRef.current = null;
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
      setError('OTP அமர்வு காலாவதியாகியது. மீண்டும் முயற்சிக்கவும். (Session expired — please restart.)');
      return;
    }
    setLoading(true);
    try {
      await confirmationRef.current.confirm(otp.trim());
      setStep('success');
      onSuccess?.();
    } catch (err) {
      setError(phoneAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  async function handleResend() {
    if (resendTimer > 0) return;
    setOtp('');
    setError(null);
    setStep('phone');
    // Small delay so user sees the form reset before re-sending
    setTimeout(() => void handleSendOtp(), 100);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

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
      <div className="phone-auth-panel panel phone-auth-success" role="status" aria-live="polite">
        <span className="phone-auth-success-icon">✅</span>
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
          📩 +91 {phoneDigits} க்கு OTP அனுப்பப்பட்டது. (OTP sent to +91 {phoneDigits}.)
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
          />
        </div>

        {error && (
          <p className="field-error" role="alert">{error}</p>
        )}

        <div className="phone-auth-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleVerifyOtp()}
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'சரிபார்க்கிறது… (Verifying…)' : 'OTP சரிபார்க்க (Verify OTP)'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void handleResend()}
            disabled={resendTimer > 0 || loading}
          >
            {resendTimer > 0
              ? `மீண்டும் அனுப்பு (${resendTimer}s)`
              : 'OTP மீண்டும் அனுப்பு (Resend OTP)'}
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
            disabled={loading}
          >
            எண்ணை மாற்று (Change Number)
          </button>
        </div>
      </div>
    );
  }

  // ── Phone input ───────────────────────────────────────────────────────────
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
          <span className="phone-auth-prefix">🇮🇳 +91</span>
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
          />
        </div>
        <p className="field-hint">
          6-9 தொடங்கும் 10 இலக்க மொபைல் எண் (10-digit mobile number starting with 6–9)
        </p>
      </div>

      {error && (
        <p className="field-error" role="alert">{error}</p>
      )}

      {/* Invisible reCAPTCHA container */}
      <div id={recaptchaContainerId} />

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => void handleSendOtp()}
        disabled={loading || phoneDigits.length < 10}
        style={{ width: '100%' }}
      >
        {loading ? 'OTP அனுப்புகிறது… (Sending OTP…)' : 'OTP அனுப்பு (Send OTP)'}
      </button>
    </div>
  );
}
