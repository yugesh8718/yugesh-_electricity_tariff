/**
 * SavedPage.tsx — Protected route
 *
 * Lists saved ComparisonResults for the logged-in user.
 * Click to reload a result into sessionStorage and navigate to /comparison.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getComparisons, deleteComparison } from '../lib/firestore';
import { formatCurrency } from '../utils/formatCurrency';
import type { ComparisonResult } from '../types';

export default function SavedPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login?redirect=/saved', { replace: true });
      return;
    }
    getComparisons(user.uid)
      .then(setComparisons)
      .finally(() => setFetching(false));
  }, [user, loading, navigate]);

  function viewComparison(c: ComparisonResult) {
    sessionStorage.setItem('ww-result', JSON.stringify(c));
    sessionStorage.setItem('ww-consumption', JSON.stringify(c.consumption));
    navigate('/comparison');
  }

  async function handleDelete(c: ComparisonResult) {
    if (!user || !c.id) return;
    setDeleteError(null);
    try {
      await deleteComparison(user.uid, c.id);
      setComparisons((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err) {
      setDeleteError((err as Error).message ?? 'Failed to delete');
    }
  }

  if (loading || fetching) {
    return (
      <div className="page">
        <p>Loading saved comparisons…</p>
      </div>
    );
  }

  return (
    <div className="page saved-page">
      <div className="page-header">
        <div>
          <h1>Saved Comparisons</h1>
          <p>Your cloud-saved tariff comparisons.</p>
        </div>
      </div>

      {deleteError && (
        <p className="field-error" role="alert" style={{ marginBottom: '1rem' }}>
          {deleteError}
        </p>
      )}

      {comparisons.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No saved comparisons yet.</p>
          <p className="field-hint" style={{ marginTop: '0.5rem' }}>
            Run the calculator and click "Save comparison" on the results page.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comparisons.map((c) => {
            const recommended = c.bills.find((b) => b.planId === c.recommendedPlanId);
            const next = c.bills.find((b) => b.planId !== c.recommendedPlanId);
            const savings = next && recommended
              ? next.estimatedTotal - recommended.estimatedTotal
              : 0;

            return (
              <div key={c.id ?? c.timestamp} className="panel ww-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <p className="field-hint">
                      {new Date(c.timestamp).toLocaleString()}
                    </p>
                    <h3 style={{ margin: '4px 0' }}>
                      Recommended: {recommended?.planName ?? c.recommendedPlanId}
                    </h3>
                    {savings > 0 && (
                      <p style={{ color: 'var(--color-green)', fontSize: '0.9rem' }}>
                        Saves {formatCurrency(savings)} vs next plan
                      </p>
                    )}
                    <p className="field-hint" style={{ marginTop: '4px' }}>
                      {c.consumption.total.toFixed(1)} kWh ·{' '}
                      {c.consumption.consumerType} ·{' '}
                      {c.consumption.billingPeriod}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => viewComparison(c)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => void handleDelete(c)}
                      aria-label="Delete this saved comparison"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
