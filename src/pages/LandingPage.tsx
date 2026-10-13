/**
 * LandingPage.tsx
 *
 * WattWise hero page with feature cards, demo profiles, and CTAs.
 */
import { Link, useNavigate } from 'react-router-dom';
import { DEMO_PROFILES } from '../data/samplePlans.ts';
import type { ConsumptionInput } from '../types';

export default function LandingPage() {
  const navigate = useNavigate();

  function quickStart(consumption: ConsumptionInput) {
    sessionStorage.setItem('ww-consumption', JSON.stringify(consumption));
    navigate('/comparison');
  }

  return (
    <div className="page home-page">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">WattWise</p>
          <h1>Know Your Electricity Plan</h1>
          <p className="hero-description">
            Compare tariff plans, estimate your bill and discover the cheapest option with a
            Consumption Digital Twin that explains exactly how your usage pattern drives the cost.
          </p>
          <div className="hero-cta-group">
            <Link to="/calculator" className="btn btn-primary">
              Start Comparing
            </Link>
            <Link to="/plans" className="btn btn-secondary">
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── Demo notice ──────────────────────────────────────────────────── */}
      <div className="notice demo-notice" role="note">
        <strong>Demo mode</strong> — all tariff rates shown are fictional and are used only for
        illustration. They do not represent official electricity pricing.
      </div>

      {/* ── Feature cards ────────────────────────────────────────────────── */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" style={{ marginBottom: '1rem' }}>Five original insights</h2>
        <div className="features-grid">
          <article className="panel ww-card">
            <h3>🔬 Consumption Digital Twin</h3>
            <p>
              Your usage is classified into a fingerprint — Off-Peak Optimiser, Balanced
              Household, Peak-Heavy, or Daytime Business — derived from actual percentages,
              never randomly assigned.
            </p>
          </article>

          <article className="panel ww-card">
            <h3>⚖️ Tariff Break-Even Explorer</h3>
            <p>
              Calculates the exact peak-usage percentage at which the cheapest plan switches.
              The crossover is computed mathematically from real rates, never hard-coded.
            </p>
          </article>

          <article className="panel ww-card">
            <h3>🛡️ Tariff Risk Shield</h3>
            <p>
              Simulates 25 usage scenarios (5 consumption levels × 5 peak shifts) and scores
              each plan's stability so you know which remains cheapest as habits change.
            </p>
          </article>

          <article className="panel ww-card">
            <h3>😬 Plan Regret Guard</h3>
            <p>
              Quantifies how much you could overpay in any simulated scenario if your usage
              drifts, giving an average and worst-case regret figure in rupees.
            </p>
          </article>

          <article className="panel ww-card">
            <h3>🔄 Peak Shift Advisor</h3>
            <p>
              Shows how shifting 10%, 20% or 30% of peak consumption to off-peak hours changes
              your bill under each plan — without reducing total usage.
            </p>
          </article>
        </div>
      </section>

      {/* ── Demo profiles ────────────────────────────────────────────────── */}
      <section aria-labelledby="demo-profiles-heading" style={{ marginTop: '2rem' }}>
        <h2 id="demo-profiles-heading" style={{ marginBottom: '0.5rem' }}>
          Quick-start with a demo profile
        </h2>
        <p className="field-hint" style={{ marginBottom: '1rem' }}>
          Pre-fills the calculator with a fictional usage pattern so you can explore the
          analysis instantly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {DEMO_PROFILES.map((profile) => (
            <button
              key={profile.label}
              type="button"
              className="btn btn-secondary"
              onClick={() => quickStart(profile.consumption)}
            >
              {profile.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
