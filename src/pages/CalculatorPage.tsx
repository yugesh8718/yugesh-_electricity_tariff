/**
 * CalculatorPage.tsx
 *
 * State-wise electricity tariff calculator.
 * Allows users to:
 *   1. Select Indian state, electricity board, consumer category, and tariff schedule.
 *   2. Enter total consumption and adjust off-peak / normal / peak percentages.
 *   3. Add custom plans via PlanEditor.
 *   4. Submit to navigate to /comparison.
 *
 * SessionStorage keys written on submit:
 *   'ww-consumption'  — ConsumptionInput (offPeak, shoulder, peak, total, …)
 *   'ww-plans'        — TariffPlan[]
 *   'ww-state-ctx'    — { stateId, boardId, categoryId, scheduleId }
 *
 * ⚠️  ALL tariff data shown is DEMO DATA — not verified official rates.
 */
import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  INDIA_BOARDS,
  getBoardsByState,
  getCategoriesByBoard,
  getSchedulesByCategory,
  scheduleToTariffPlan,
} from '../data/indiaBoards';
import { INDIA_REGIONS } from '../data/indiaRegions.js';
import { SAMPLE_PLANS, DEMO_PROFILES } from '../data/samplePlans.ts';
import type { ConsumptionInput, TariffPlan } from '../types';
import PlanEditor from '../components/PlanEditor';
import { useNotification } from '../contexts/NotificationContext';
import { useLang } from '../lib/lang.jsx';

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

// Sort INDIA_BOARDS by state name for the dropdown
const SORTED_STATES = INDIA_BOARDS.map((sb) => {
  const region = INDIA_REGIONS.find((r: { id: string; name: string }) => r.id === sb.stateId);
  return {
    stateId: sb.stateId,
    stateName: region?.name ?? sb.stateId.toUpperCase(),
  };
}).sort((a, b) => a.stateName.localeCompare(b.stateName));

// ─── Component ──────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const navigate = useNavigate();
  const uid = useId();
  const { addNotification } = useNotification();
  const { t } = useLang();

  // ── State / board / category / schedule selection ──────────────────────
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  // ── Consumption pattern (percentage-based) ─────────────────────────────
  const [totalConsumption, setTotalConsumption] = useState('200');
  const [offPeakPct, setOffPeakPct] = useState('10');
  const [shoulderPct, setShoulderPct] = useState('40');
  const [peakPct, setPeakPct] = useState('50');

  // ── Existing consumer details state ───────────────────────────────────
  const [consumerType, setConsumerType] = useState<ConsumptionInput['consumerType']>('household');
  const [billingPeriod, setBillingPeriod] = useState<ConsumptionInput['billingPeriod']>('monthly');
  const [providerName, setProviderName] = useState('');
  const [tariffCode, setTariffCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Custom plans state ─────────────────────────────────────────────────
  const [customPlans, setCustomPlans] = useState<TariffPlan[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [draftPlan, setDraftPlan] = useState<TariffPlan>(() =>
    makeBlankPlan(`custom-${Date.now()}`)
  );

  // ── Derived kWh values ─────────────────────────────────────────────────
  const total = safeNum(totalConsumption);
  const offPeakKwh = total * (safeNum(offPeakPct) / 100);
  const shoulderKwh = total * (safeNum(shoulderPct) / 100);
  const peakKwh = total * (safeNum(peakPct) / 100);

  const pctSum = safeNum(offPeakPct) + safeNum(shoulderPct) + safeNum(peakPct);

  // ── Derived dropdown lists ─────────────────────────────────────────────
  const boards = selectedStateId ? getBoardsByState(selectedStateId) : [];
  const categories = selectedStateId && selectedBoardId
    ? getCategoriesByBoard(selectedStateId, selectedBoardId)
    : [];
  const schedules = selectedStateId && selectedBoardId && selectedCategoryId
    ? getSchedulesByCategory(selectedStateId, selectedBoardId, selectedCategoryId)
    : [];

  // ── All plans (sample + custom + optional selected schedule) ──────────
  const selectedSchedule = schedules.find((s) => s.scheduleId === selectedScheduleId) ?? null;
  const selectedBoard = boards.find((b) => b.boardId === selectedBoardId) ?? null;
  const schedulePlan = selectedSchedule && selectedBoard
    ? scheduleToTariffPlan(selectedSchedule, selectedBoard.boardName)
    : null;

  const allPlans: TariffPlan[] = [
    ...SAMPLE_PLANS,
    ...customPlans,
    ...(schedulePlan ? [schedulePlan] : []),
  ];

  // ── State change handler ────────────────────────────────────────────────
  function handleStateChange(stateId: string) {
    setSelectedStateId(stateId);
    setSelectedBoardId('');
    setSelectedCategoryId('');
    setSelectedScheduleId('');
    if (stateId) {
      const stateName =
        SORTED_STATES.find((s) => s.stateId === stateId)?.stateName ?? stateId;
      addNotification('info', t('notifStateChanged').replace('{state}', stateName));
    }
    setErrors({});
  }

  // ── Board change handler ────────────────────────────────────────────────
  function handleBoardChange(boardId: string) {
    setSelectedBoardId(boardId);
    setSelectedCategoryId('');
    setSelectedScheduleId('');
    if (boardId) {
      const boardName = boards.find((b) => b.boardId === boardId)?.boardName ?? boardId;
      addNotification('info', t('notifBoardChanged').replace('{board}', boardName));
    }
    setErrors({});
  }

  // ── Schedule change handler ─────────────────────────────────────────────
  function handleScheduleChange(scheduleId: string) {
    setSelectedScheduleId(scheduleId);
    const sched = schedules.find((s) => s.scheduleId === scheduleId);
    if (sched?.verificationStatus === 'demo') {
      addNotification('warning', t('notifDemoRates'));
    }
  }

  // ── Percentage notification triggers ────────────────────────────────────
  function triggerPctNotifications(off: string, shoulder: string, peak: string) {
    const offN = safeNum(off);
    const peakN = safeNum(peak);
    const shoulderN = safeNum(shoulder);
    if (offN >= 90) addNotification('success', t('notifOffPeakHigh'));
    if (peakN >= 50) addNotification('warning', t('notifPeakHigh'));
    if (shoulderN >= 70) addNotification('info', t('notifNormalHigh'));
  }

  // ── Off-peak percentage change ──────────────────────────────────────────
  function handleOffPeakPctChange(val: string) {
    setOffPeakPct(val);
    if (safeNum(val) >= 90) addNotification('success', t('notifOffPeakHigh'));
  }

  // ── Peak percentage change ──────────────────────────────────────────────
  function handlePeakPctChange(val: string) {
    setPeakPct(val);
    if (safeNum(val) >= 50) addNotification('warning', t('notifPeakHigh'));
  }

  // ── Shoulder percentage change ──────────────────────────────────────────
  function handleShoulderPctChange(val: string) {
    setShoulderPct(val);
    if (safeNum(val) >= 70) addNotification('info', t('notifNormalHigh'));
  }

  // ── Quick preset selection ──────────────────────────────────────────────
  function applyPreset(off: string, shoulder: string, peak: string) {
    setOffPeakPct(off);
    setShoulderPct(shoulder);
    setPeakPct(peak);
    triggerPctNotifications(off, shoulder, peak);
  }

  // ── Load demo profile ───────────────────────────────────────────────────
  function loadProfile(consumption: ConsumptionInput) {
    setConsumerType(consumption.consumerType);
    setBillingPeriod(consumption.billingPeriod);
    const tot = consumption.offPeak + consumption.shoulder + consumption.peak;
    setTotalConsumption(String(tot));
    if (tot > 0) {
      setOffPeakPct(String(((consumption.offPeak / tot) * 100).toFixed(1)));
      setShoulderPct(String(((consumption.shoulder / tot) * 100).toFixed(1)));
      setPeakPct(String(((consumption.peak / tot) * 100).toFixed(1)));
    }
    setErrors({});
  }

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (totalConsumption === '' || safeNum(totalConsumption) <= 0) {
      errs.totalConsumption = 'Enter a positive consumption value';
    }

    const sum = safeNum(offPeakPct) + safeNum(shoulderPct) + safeNum(peakPct);
    if (Math.abs(sum - 100) > 0.01) {
      errs.pct = `Percentages must total 100% (current total: ${sum.toFixed(1)}%)`;
      addNotification(
        'error',
        t('notifPercentError').replace('{pct}', sum.toFixed(1)),
      );
    }

    if (allPlans.length < 1) errs.plans = 'At least one plan is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const consumption: ConsumptionInput = {
      offPeak: offPeakKwh,
      shoulder: shoulderKwh,
      peak: peakKwh,
      total,
      consumerType,
      billingPeriod,
      providerName: providerName.trim() || undefined,
      tariffCode: tariffCode.trim() || undefined,
    };

    sessionStorage.setItem('ww-consumption', JSON.stringify(consumption));
    sessionStorage.setItem('ww-plans', JSON.stringify(allPlans));
    sessionStorage.setItem(
      'ww-state-ctx',
      JSON.stringify({
        stateId: selectedStateId,
        boardId: selectedBoardId,
        categoryId: selectedCategoryId,
        scheduleId: selectedScheduleId,
      }),
    );

    const firstName = allPlans[0]?.name ?? '';
    addNotification('success', t('notifBillDone').replace('{plan}', firstName));

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
          <h1>{t('calcTitle')}</h1>
          <p>{t('calcSubtitle')}</p>
        </div>
      </div>

      {/* ── Demo quick-start ────────────────────────────────────────────── */}
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

        {/* ── Section 1: State & Board ─────────────────────────────────── */}
        <fieldset className="panel" style={{ marginBottom: '1.5rem' }}>
          <legend><strong>State &amp; Electricity Board</strong></legend>

          {/* State dropdown */}
          <div className="form-group">
            <label htmlFor={`${uid}-state`}>{t('selectState')}</label>
            <select
              id={`${uid}-state`}
              value={selectedStateId}
              onChange={(e) => handleStateChange(e.target.value)}
            >
              <option value="">— Select State / UT —</option>
              {SORTED_STATES.map((s) => (
                <option key={s.stateId} value={s.stateId}>
                  {s.stateName}
                </option>
              ))}
            </select>
          </div>

          {/* Board dropdown */}
          <div className="form-group">
            <label htmlFor={`${uid}-board`}>{t('selectDiscom')}</label>
            <select
              id={`${uid}-board`}
              value={selectedBoardId}
              onChange={(e) => handleBoardChange(e.target.value)}
              disabled={!selectedStateId}
            >
              <option value="">— Select Board / DISCOM —</option>
              {boards.map((b) => (
                <option key={b.boardId} value={b.boardId}>
                  {b.shortName} — {b.boardName}
                </option>
              ))}
            </select>
          </div>

          {/* Category dropdown */}
          <div className="form-group">
            <label htmlFor={`${uid}-category`}>{t('selectCategory')}</label>
            <select
              id={`${uid}-category`}
              value={selectedCategoryId}
              onChange={(e) => { setSelectedCategoryId(e.target.value); setSelectedScheduleId(''); }}
              disabled={!selectedBoardId}
            >
              <option value="">— Select Consumer Category —</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule dropdown */}
          <div className="form-group">
            <label htmlFor={`${uid}-schedule`}>{t('selectSchedule')}</label>
            <select
              id={`${uid}-schedule`}
              value={selectedScheduleId}
              onChange={(e) => handleScheduleChange(e.target.value)}
              disabled={!selectedCategoryId}
            >
              <option value="">— Select Tariff Schedule —</option>
              {schedules.map((s) => (
                <option key={s.scheduleId} value={s.scheduleId}>
                  {s.scheduleName}
                </option>
              ))}
            </select>
          </div>

          {/* Demo warning when schedule selected */}
          {selectedSchedule && (
            <div className="notice" role="status" aria-live="polite">
              ⚠️ {t('demoWarning')}
            </div>
          )}
        </fieldset>

        {/* ── Consumer details ─────────────────────────────────────────── */}
        <fieldset className="panel" style={{ marginBottom: '1.5rem' }}>
          <legend><strong>Consumer details</strong></legend>

          <div className="form-group">
            <span className="form-label">Consumer type</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {(['household', 'small-business'] as const).map((ct) => (
                <label key={ct} style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="consumerType"
                    value={ct}
                    checked={consumerType === ct}
                    onChange={() => setConsumerType(ct)}
                    style={{ marginRight: '0.4rem' }}
                  />
                  {ct === 'household' ? 'Household' : 'Small Business'}
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
              placeholder="e.g. TANGEDCO, BESCOM"
            />
          </div>

          <div className="form-group">
            <label htmlFor={`${uid}-tariff`}>Tariff schedule code (optional)</label>
            <input
              id={`${uid}-tariff`}
              type="text"
              value={tariffCode}
              onChange={(e) => setTariffCode(e.target.value)}
              placeholder="e.g. LT-I, LT-2"
            />
          </div>
        </fieldset>

        {/* ── Section 2: Consumption Pattern ──────────────────────────────── */}
        <fieldset className="panel" style={{ marginBottom: '1.5rem' }}>
          <legend><strong>Consumption Pattern</strong></legend>

          {/* Total consumption */}
          <div className="form-group">
            <label htmlFor={`${uid}-total`}>{t('consumption')}</label>
            <input
              id={`${uid}-total`}
              type="number"
              min="1"
              step="1"
              value={totalConsumption}
              onChange={(e) => setTotalConsumption(e.target.value)}
              aria-describedby={errors.totalConsumption ? `${uid}-total-err` : undefined}
              className={errors.totalConsumption ? 'field-error-input' : ''}
            />
            {errors.totalConsumption && (
              <span id={`${uid}-total-err`} className="field-error" role="alert">
                {errors.totalConsumption}
              </span>
            )}
          </div>

          {/* Percentage inputs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {/* Off-peak % */}
            <div className="form-group" style={{ flex: '1 1 120px' }}>
              <label htmlFor={`${uid}-offpeak-pct`}>Off-peak %</label>
              <input
                id={`${uid}-offpeak-pct`}
                type="number"
                min="0"
                max="100"
                step="1"
                value={offPeakPct}
                onChange={(e) => handleOffPeakPctChange(e.target.value)}
              />
              <span className="field-hint" style={{ color: 'var(--color-off-peak, #4caf50)' }}>
                {offPeakKwh.toFixed(1)} kWh
              </span>
            </div>

            {/* Normal / shoulder % */}
            <div className="form-group" style={{ flex: '1 1 120px' }}>
              <label htmlFor={`${uid}-shoulder-pct`}>Normal %</label>
              <input
                id={`${uid}-shoulder-pct`}
                type="number"
                min="0"
                max="100"
                step="1"
                value={shoulderPct}
                onChange={(e) => handleShoulderPctChange(e.target.value)}
              />
              <span className="field-hint" style={{ color: 'var(--color-shoulder, #ff9800)' }}>
                {shoulderKwh.toFixed(1)} kWh
              </span>
            </div>

            {/* Peak % */}
            <div className="form-group" style={{ flex: '1 1 120px' }}>
              <label htmlFor={`${uid}-peak-pct`}>Peak %</label>
              <input
                id={`${uid}-peak-pct`}
                type="number"
                min="0"
                max="100"
                step="1"
                value={peakPct}
                onChange={(e) => handlePeakPctChange(e.target.value)}
              />
              <span className="field-hint" style={{ color: 'var(--color-peak, #f44336)' }}>
                {peakKwh.toFixed(1)} kWh
              </span>
            </div>
          </div>

          {/* Percentage total indicator */}
          <div
            className={`notice ${Math.abs(pctSum - 100) > 0.01 ? 'notice-error' : ''}`}
            role="status"
            aria-live="polite"
            style={{ marginBottom: '0.75rem' }}
          >
            <strong>Total:</strong> {pctSum.toFixed(1)}%{' '}
            {Math.abs(pctSum - 100) > 0.01 && (
              <span className="field-error"> — must equal 100%</span>
            )}
          </div>

          {/* Percentage validation error */}
          {errors.pct && (
            <p className="field-error" role="alert">
              {errors.pct}
            </p>
          )}

          {/* Pattern bar — visual breakdown */}
          <div
            className="pattern-bar"
            aria-label="Consumption pattern visual breakdown"
            style={{ display: 'flex', height: '16px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}
          >
            <div
              style={{
                flex: safeNum(offPeakPct),
                background: 'var(--color-off-peak, #4caf50)',
                minWidth: safeNum(offPeakPct) > 0 ? '2px' : '0',
              }}
              title={`Off-peak: ${offPeakPct}%`}
            />
            <div
              style={{
                flex: safeNum(shoulderPct),
                background: 'var(--color-shoulder, #ff9800)',
                minWidth: safeNum(shoulderPct) > 0 ? '2px' : '0',
              }}
              title={`Normal: ${shoulderPct}%`}
            />
            <div
              style={{
                flex: safeNum(peakPct),
                background: 'var(--color-peak, #f44336)',
                minWidth: safeNum(peakPct) > 0 ? '2px' : '0',
              }}
              title={`Peak: ${peakPct}%`}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-off-peak, #4caf50)' }}>■ Off-peak {offPeakPct}%</span>
            <span style={{ color: 'var(--color-shoulder, #ff9800)' }}>■ Normal {shoulderPct}%</span>
            <span style={{ color: 'var(--color-peak, #f44336)' }}>■ Peak {peakPct}%</span>
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ alignSelf: 'center', fontSize: '0.875rem' }}>Presets:</span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => applyPreset('90', '0', '10')}
            >
              Low Usage (90/0/10)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => applyPreset('30', '40', '30')}
            >
              Normal (30/40/30)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => applyPreset('10', '40', '50')}
            >
              Peak Heavy (10/40/50)
            </button>
          </div>
        </fieldset>

        {/* ── Section 3: Custom Plans ──────────────────────────────────────── */}
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
