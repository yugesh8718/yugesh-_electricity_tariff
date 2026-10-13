/**
 * PlansPage.tsx
 *
 * Tariff plan library. Shows SAMPLE_PLANS + custom plans.
 * Custom plans can be added via PlanEditor and stored in sessionStorage
 * (or Firestore when logged in).
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_PLANS } from '../data/samplePlans.ts';
import PlanCard from '../components/PlanCard';
import PlanEditor from '../components/PlanEditor';
import { useAuth } from '../contexts/AuthContext';
import { saveCustomPlan, getCustomPlans, deleteCustomPlan as deleteCustomPlanFirestore } from '../lib/firestore';
import type { TariffPlan } from '../types';

const STORAGE_KEY = 'ww-custom-plans';

function makeBlankPlan(id: string): TariffPlan {
  return {
    id,
    name: 'My Custom Plan',
    fixedCharge: 100,
    offPeakRate: 5.0,
    shoulderRate: 6.0,
    peakRate: 8.0,
    taxDutyPercent: 0,
    surcharge: 0,
    description: '',
  };
}

export default function PlansPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customPlans, setCustomPlans] = useState<TariffPlan[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [draftPlan, setDraftPlan] = useState<TariffPlan>(() =>
    makeBlankPlan(`custom-${Date.now()}`)
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load custom plans from Firestore (if logged in) or sessionStorage
  useEffect(() => {
    if (user) {
      getCustomPlans(user.uid)
        .then(setCustomPlans)
        .catch(() => {
          // Fall back to sessionStorage
          const raw = sessionStorage.getItem(STORAGE_KEY);
          if (raw) setCustomPlans(JSON.parse(raw) as TariffPlan[]);
        });
    } else {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setCustomPlans(JSON.parse(raw) as TariffPlan[]);
    }
  }, [user]);

  async function handleSavePlan() {
    setSaveError(null);
    try {
      if (user) {
        const savedId = await saveCustomPlan(user.uid, draftPlan);
        setCustomPlans((prev) => [...prev, { ...draftPlan, id: savedId }]);
      } else {
        const updated = [...customPlans, draftPlan];
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setCustomPlans(updated);
      }
      setShowEditor(false);
      setDraftPlan(makeBlankPlan(`custom-${Date.now()}`));
    } catch (err) {
      setSaveError((err as Error).message ?? 'Failed to save plan');
    }
  }

  async function handleDelete(plan: TariffPlan) {
    try {
      if (user && plan.id) {
        await deleteCustomPlanFirestore(user.uid, plan.id);
      }
      const updated = customPlans.filter((p) => p.id !== plan.id);
      setCustomPlans(updated);
      if (!user) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {
      // silently ignore delete error in demo mode
    }
  }

  function startComparison() {
    const allPlans = [...SAMPLE_PLANS, ...customPlans];
    sessionStorage.setItem('ww-plans', JSON.stringify(allPlans));
    navigate('/calculator');
  }

  return (
    <div className="page plans-page">
      <div className="page-header">
        <div>
          <h1>Tariff Plan Library</h1>
          <p>Browse sample plans or add your own custom tariff.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-primary" onClick={startComparison}>
            Compare plans →
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setShowEditor(true);
              setDraftPlan(makeBlankPlan(`custom-${Date.now()}`));
            }}
          >
            + Add custom plan
          </button>
        </div>
      </div>

      {/* ── Sample plans ─────────────────────────────────────────────────── */}
      <section aria-labelledby="sample-plans-heading">
        <h2 id="sample-plans-heading" style={{ marginBottom: '0.75rem' }}>
          Sample plans
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {SAMPLE_PLANS.map((plan) => (
            <div key={plan.id} style={{ flex: '1 1 300px' }}>
              <PlanCard plan={plan} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Custom plans ─────────────────────────────────────────────────── */}
      {customPlans.length > 0 && (
        <section aria-labelledby="custom-plans-heading" style={{ marginTop: '2rem' }}>
          <h2 id="custom-plans-heading" style={{ marginBottom: '0.75rem' }}>
            Custom plans
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {customPlans.map((plan) => (
              <div key={plan.id} style={{ flex: '1 1 300px' }}>
                <PlanCard plan={plan} />
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                  onClick={() => void handleDelete(plan)}
                  aria-label={`Delete custom plan ${plan.name}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Plan editor ──────────────────────────────────────────────────── */}
      {showEditor && (
        <section
          className="panel"
          aria-labelledby="editor-heading"
          style={{ marginTop: '2rem' }}
        >
          <h2 id="editor-heading" style={{ marginBottom: '0.75rem' }}>
            New custom plan
          </h2>
          <PlanEditor plan={draftPlan} onChange={setDraftPlan} />
          {saveError && (
            <p className="field-error" role="alert" style={{ marginTop: '0.5rem' }}>
              {saveError}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleSavePlan()}
            >
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
        </section>
      )}

      {!user && (
        <p className="field-hint" style={{ marginTop: '1rem' }}>
          Sign in to save custom plans to the cloud.
        </p>
      )}
    </div>
  );
}
