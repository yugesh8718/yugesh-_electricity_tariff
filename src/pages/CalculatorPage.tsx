/**
 * CalculatorPage.tsx
 *
 * Consumption input form. Stores ConsumptionInput in sessionStorage and navigates
 * to /comparison on submit.
 */
import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_PLANS, DEMO_PROFILES } from '../data/samplePlans.ts';
import type { ConsumptionInput, TariffPlan } from '../types';
import PlanEditor from '../components/PlanEditor';

// ─── helpers ────────────────────────────────────────────────────────────────

function safeNum(v: string): number {
  const n = parseFloat(v);
  return isFinite(n) && n >= 0 ? n : 0;
}

function makeBlankPlan(id: string): TariffPlan {
  return {
    id,
    name: 'Custom Plan',
    fixedCharge: 100,
    offPeakRate: 5,
    shoulderRate: 6,
    peakRate: 8,
    taxDutyPercent: 0,
    surcharge: 0,
    description: '',
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const navigate = useNavigate();
  const uid = useId();

  // ── Form state ─────────────────────────────────────────────────────────
  const [consumerType, setConsumerType] = useState<ConsumptionInput['consumerType']>('household');
  const [billingPeriod, setBillingPeriod] = useState<ConsumptionInput['billingPeriod']>('monthly');
  const [providerName, setProviderName] = useState('');
  const [tariffCode, setTariffCode] = useState('');
  const [offPeakStr, setOffPeakStr] = useState('');
  const [shoulderStr, setShoulderStr] = useState('');
  const [peakStr, setPeakStr] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Custom plans state ─────────────────────────────────────────────────
  const [customPlans, setCustomPlans] = useState<TariffPlan[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [draftPlan, setDraftPlan] = useState<TariffPlan>(() =>
    makeBlankPlan(`custom-${Date.now()}`)
  );

  // ── Derived values ──────────────────────────────────────────────────────
  const offPeak = safeNum(offPeakStr);
  const shoulder = safeNum(shoulderStr);
  const peak = safeNum(peakStr);
  const total = offPeak + shoulder + peak;
  const offPeakPct = total > 0 ? (offPeak / total) * 100 : 0;
  const shoulderPct = total > 0 ? (shoulder / total) * 100 : 0;
  const peakPct = total > 0 ? (peak / total) * 100 : 0;

  const allPlans = [...SAMPLE_PLANS, ...customPlans];

  // ── Load demo profile ───────────────────────────────────────────────────
  function loadProfile(consumption: ConsumptionInput) {
    setConsumerType(consumption.consumerType);
    setBillingPeriod(consumption.billingPeriod);
    setOffPeakStr(String(consumption.offPeak));
    setShoulderStr(String(consumption.shoulder));
    setPeakStr(String(consumption.peak));
    setErrors({});
  }

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (offPeakStr === '' || !isFinite(safeNum(offPeakStr)))
      errs.offPeak = 'Enter a non-negative number';
    if (shoulderStr === '' || !isFinite(safeNum(shoulderStr)))
      errs.shoulder = 'Enter a non-negative number';
    if (peakStr === '' || !isFinite(safeNum(peakStr)))
      errs.peak = 'Enter a non-negative number';
    if (allPlans.length < 1) errs.plans = 'At least one plan is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const consumption: ConsumptionInput = {
      offPeak,
      shoulder,
      peak,
      total,
      consumerType,
      billingPeriod,
      providerName: providerName.trim() || undefined,
      tariffCode: tariffCode.trim() || undefined,
    };

    sessionStorage.setItem('ww-consumption', JSON.stringify(consumption));
    sessionStorage.setItem('ww-plans', JSON.stringify(allPlans));
    navigate('/comparison');
  }

  // ── Custom plan handlers ────────────────────────────────────────────────
  function saveDraftPlan() {
    setCustomPlans((prev) => [...prev, draftPlan]);
    setShowEditor(false);
    setDraftPlan(makeBlankPlan(`custom-${Date.now()}`));
  }

  function deleteCustomPlan(id: string) {
    setCustomPlans((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="page calculator-page">
      <div className="page-header">
        <div>
          <h1>Bill Calculator</h1>
          <p>Enter your consumption details to compare tariff plans.</p>
        </div>
      </div>

      {/* ── Demo quick-start ─────────────────────────────────────────── */}
      <div className="notice" style={{ marginBottom: '1.5rem' }}>
        <strong>Quick start:</strong>{' '}
        {DEMO_PROFILES.map((p) => (
          <button
            key={p.label}
            type="button"
            className="btn btn-secondary"
            style={{ marginLeft: '0.5rem' }}
            onClick={() => loadProfile(p.consumption)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Consumer details ─────────────────────────────────────── */}
        <fieldset className="panel" style={{ marginBottom: '1.5rem' }}>
          <legend><strong>Consumer details</strong></legend>

          <div className="form-group">
            <span className="form-label">Consumer type</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {(['household', 'small-business'] as const).map((t) => (
                <label key={t} style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="consumerType"
                    value={t}
                    checked={consumerType === t}
                    onChange={() => setConsumerType(t)}
                    style={{ marginRight: '0.4rem' }}
                  />
                  {t === 'household' ? 'Household' : 'Small Business'}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <span className="form-label">Billing period</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {(['monthly', 'bimonthly'] as const).map((bp) => (
                <label key={bp} style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="billingPeriod"
                    value={bp}
                    checked={billingPeriod === bp}
                    onChange={() => setBillingPeriod(bp)}
                    style={{ marginRight: '0.4rem' }}
                  />
                  {bp === 'monthly' ? 'Monthly' : 'Bimonthly (2 months)'}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor={`${uid}-provider`}>Provider name (optional)</label>
            <input
              id={`${uid}-provider`}
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="e.g. TNEB, BESCOM"
            />
          </div>

          <div className="form-group">
            <label htmlFor={`${uid}-tariff`}>Tariff schedule code (optional)</label>
            <input
              id={`${uid}-tariff`}
              type="text"
              value={tariffCode}
              onChange={(e) => setTariffCode(e.target.value)}
              placeholder="e.g. LT-1A"
            />
          </div>
        </fieldset>

        {/* ── Consumption inputs ───────────────────────────────────── */}
        <fieldset className="panel" style={{ marginBottom: '1.5rem' }}>
          <legend><strong>Consumption (kWh per billing period)</strong></legend>

          <div className="form-group">
            <label htmlFor={`${uid}-offpeak`}>Off-peak kWh</label>
            <input
              id={`${uid}-offpeak`}
              type="number"
              min="0"
              step="1"
              value={offPeakStr}
              onChange={(e) => setOffPeakStr(e.target.value)}
              aria-describedby={errors.offPeak ? `${uid}-offpeak-err` : undefined}
              className={errors.offPeak ? 'field-error-input' : ''}
            />
            {errors.offPeak && (
              <span id={`${uid}-offpeak-err`} className="field-error" role="alert">
                {errors.offPeak}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={`${uid}-shoulder`}>Shoulder / normal kWh</label>
            <input
              id={`${uid}-shoulder`}
              type="number"
              min="0"
              step="1"
              value={shoulderStr}
              onChange={(e) => setShoulderStr(e.target.value)}
              aria-describedby={errors.shoulder ? `${uid}-shoulder-err` : undefined}
              className={errors.shoulder ? 'field-error-input' : ''}
            />
            {errors.shoulder && (
              <span id={`${uid}-shoulder-err`} className="field-error" role="alert">
                {errors.shoulder}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={`${uid}-peak`}>Peak kWh</label>
            <input
              id={`${uid}-peak`}
              type="number"
              min="0"
              step="1"
              value={peakStr}
              onChange={(e) => setPeakStr(e.target.value)}
              aria-describedby={errors.peak ? `${uid}-peak-err` : undefined}
              className={errors.peak ? 'field-error-input' : ''}
            />
            {errors.peak && (
              <span id={`${uid}-peak-err`} className="field-error" role="alert">
                {errors.peak}
              </span>
            )}
          </div>

          {/* ── Derived read-only fields ─────────────────────────── */}
          {total > 0 && (
            <div
              className="notice"
              role="status"
              aria-live="polite"
              style={{ marginTop: '1rem' }}
            >
              <strong>Total:</strong> {total.toFixed(1)} kWh &nbsp;|&nbsp;
              <strong>Off-peak:</strong> {offPeakPct.toFixed(1)}% &nbsp;|&nbsp;
              <strong>Shoulder:</strong> {shoulderPct.toFixed(1)}% &nbsp;|&nbsp;
              <strong>Peak:</strong> {peakPct.toFixed(1)}%
            </div>
          )}
        </fieldset>

        {/* ── Plans ────────────────────────────────────────────────── */}
        <fieldset className="panel" style={{ marginBottom: '1.5rem' }}>
          <legend><strong>Tariff plans</strong></legend>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {allPlans.map((plan) => (
              <div
                key={plan.id}
                className="panel comparison-card"
                style={{ flex: '1 1 200px', padding: '0.75rem 1rem' }}
              >
                <strong>{plan.name}</strong>
                {plan.description && (
                  <p className="field-hint" style={{ margin: '4px 0 0' }}>
                    {plan.description}
                  </p>
                )}
                {customPlans.some((cp) => cp.id === plan.id) && (
                  <button
                    type="button"
                    className="btn"
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '2px 8px' }}
                    onClick={() => deleteCustomPlan(plan.id)}
                    aria-label={`Delete custom plan ${plan.name}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.plans && (
            <p className="field-error" role="alert">
              {errors.plans}
            </p>
          )}

          {!showEditor ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowEditor(true)}
            >
              + Add custom plan
            </button>
          ) : (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>New custom plan</h3>
              <PlanEditor plan={draftPlan} onChange={setDraftPlan} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="btn btn-primary" onClick={saveDraftPlan}>
                  Save plan
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditor(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </fieldset>

        <button type="submit" className="btn btn-primary">
          Compare plans →
        </button>
      </form>
    </div>
  );
}
