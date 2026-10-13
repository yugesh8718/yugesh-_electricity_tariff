/**
 * lang.js
 *
 * Minimal Tamil / English language support.
 * No external i18n library — kept simple for the academic project.
 *
 * Usage:
 *   import { useLang, LangProvider } from '../lib/lang.js';
 *   const { t, lang, toggle } = useLang();
 *   <p>{t('demoWarning')}</p>
 */
import { createContext, useContext, useState } from 'react';

// ── Translations ─────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    // Navigation
    home:            'Home',
    billCalculator:  'Bill Calculator',
    compareTariffs:  'Compare Tariffs',
    admin:           'Admin',

    // Calculator
    calcTitle:       'Bill Calculator',
    calcSubtitle:    'Select your state, DISCOM, consumer category, and tariff schedule to estimate your bill.',
    selectState:     'Select State or Union Territory',
    selectDiscom:    'Select DISCOM',
    selectCategory:  'Select Consumer Category',
    selectSchedule:  'Select Tariff Schedule',
    consumption:     'Electricity consumption (kWh / units)',
    connectedLoad:   'Connected load (kW)',
    calculate:       'Calculate Estimated Bill',
    calculateDemo:   '⚠ Calculate Demo Estimate',
    calculating:     'Calculating…',
    demoOnly:        'Select Demo schedule to calculate',

    // Warnings
    demoWarning:
      '⚠️ DEMO DATA — Sample rates only. This is NOT an official tariff calculation. ' +
      'Do not use for actual billing.',
    unverifiedWarning:
      'Official tariff data not yet verified for this schedule. Select the (Demo) schedule to try the calculator.',
    estimateDisclaimer:
      'This is an estimate only. Your actual bill may differ based on meter readings, surcharges, and revisions.',

    // Auth
    signIn:          'Sign in to save your comparison',
    continueGoogle:  'Continue with Google',
    sendOtp:         'Send OTP',
    verifyOtp:       'Verify OTP',
    resendOtp:       'Resend OTP',
    signOut:         'Sign out',
    saveCloud:       'Save to cloud',
    loadSaved:       'Load saved',
    demoMode:        'Demo mode — no account required',
    firebaseNotSet:
      'The calculator works in demo mode without Firebase. To enable Google sign-in and cloud saving, ' +
      'fill in your VITE_FIREBASE_* values in the .env file and restart the dev server.',

    // Results
    resultsTitle:    'Bill Estimate Results',
    stateUT:         'State / UT',
    discom:          'DISCOM',
    category:        'Consumer category',
    scheduleCode:    'Schedule code',
    billingPeriod:   'Billing period',
    monthly:         'Monthly',
    bimonthly:       'Bi-monthly (every 2 months)',
    energyCharge:    'Energy charges',
    fixedCharge:     'Fixed charges',
    otherCharge:     'Other charges',
    taxes:           'Taxes & Duties',
    subsidy:         'Subsidy',
    totalPayable:    'Estimated total payable',
  },

  ta: {
    // Navigation
    home:            'முகப்பு',
    billCalculator:  'கட்டண கணக்கீடு',
    compareTariffs:  'கட்டணங்களை ஒப்பிடு',
    admin:           'நிர்வாகி',

    // Calculator
    calcTitle:       'மின்சாரக் கட்டண கணக்கீடு',
    calcSubtitle:    'உங்கள் மாநிலம், DISCOM, வர்க்கம், மற்றும் கட்டண அட்டவணையை தேர்ந்தெடுக்கவும்.',
    selectState:     'மாநிலம் அல்லது யூனியன் பிரதேசம் தேர்ந்தெடுக்கவும்',
    selectDiscom:    'DISCOM தேர்ந்தெடுக்கவும்',
    selectCategory:  'நுகர்வோர் வகையை தேர்ந்தெடுக்கவும்',
    selectSchedule:  'கட்டண அட்டவணையை தேர்ந்தெடுக்கவும்',
    consumption:     'மின்சார பயன்பாடு (kWh / யூனிட்)',
    connectedLoad:   'இணைக்கப்பட்ட சுமை (kW)',
    calculate:       'மதிப்பீட்டு கட்டணத்தை கணக்கிடு',
    calculateDemo:   '⚠ டெமோ மதிப்பீட்டை கணக்கிடு',
    calculating:     'கணக்கிடுகிறது…',
    demoOnly:        'கணக்கிட டெமோ அட்டவணையை தேர்ந்தெடுக்கவும்',

    // Warnings
    demoWarning:
      '⚠️ டெமோ தரவு — மாதிரி விகிதங்கள் மட்டுமே. இது அதிகாரப்பூர்வ கட்டண கணக்கீடு அல்ல. ' +
      'உண்மையான கட்டணத்திற்கு பயன்படுத்தாதீர்கள்.',
    unverifiedWarning:
      'இந்த அட்டவணையின் அதிகாரப்பூர்வ கட்டண தரவு இன்னும் சரிபார்க்கப்படவில்லை. கணக்கிட (Demo) அட்டவணையை தேர்ந்தெடுக்கவும்.',
    estimateDisclaimer:
      'இது ஒரு மதிப்பீடு மட்டுமே. உண்மையான கட்டணம் மீட்டர் ரீடிங், கட்டணங்கள் மற்றும் மாற்றங்களின் அடிப்படையில் மாறலாம்.',

    // Auth
    signIn:          'உங்கள் ஒப்பீட்டை சேமிக்க உள்நுழையவும்',
    continueGoogle:  'Google மூலம் தொடரவும்',
    sendOtp:         'OTP அனுப்பு',
    verifyOtp:       'OTP சரிபார்',
    resendOtp:       'OTP மீண்டும் அனுப்பு',
    signOut:         'வெளியேறு',
    saveCloud:       'Cloud-ல் சேமி',
    loadSaved:       'சேமித்தது ஏற்று',
    demoMode:        'டெமோ முறை — கணக்கு தேவையில்லை',
    firebaseNotSet:
      'Firebase இல்லாமல் கணக்கீடு வேலை செய்கிறது. Google உள்நுழைவு மற்றும் Cloud சேமிப்பை இயக்க ' +
      '.env கோப்பில் VITE_FIREBASE_* மதிப்புகளை நிரப்பவும்.',

    // Results
    resultsTitle:    'கட்டண மதிப்பீட்டு முடிவுகள்',
    stateUT:         'மாநிலம் / யூடி',
    discom:          'DISCOM',
    category:        'நுகர்வோர் வகை',
    scheduleCode:    'அட்டவணை குறியீடு',
    billingPeriod:   'கட்டண காலம்',
    monthly:         'மாதாந்திர',
    bimonthly:       'இரு மாதம் ஒருமுறை',
    energyCharge:    'ஆற்றல் கட்டணம்',
    fixedCharge:     'நிலையான கட்டணம்',
    otherCharge:     'பிற கட்டணங்கள்',
    taxes:           'வரிகள் மற்றும் கடமைகள்',
    subsidy:         'மானியம்',
    totalPayable:    'மதிப்பீட்டு மொத்தம்',
  },
};

// ── Context ───────────────────────────────────────────────────────────────────

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('tc-lang') || 'en'
  );

  function toggle() {
    setLang((current) => {
      const next = current === 'en' ? 'ta' : 'en';
      localStorage.setItem('tc-lang', next);
      return next;
    });
  }

  function t(key) {
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  }

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
