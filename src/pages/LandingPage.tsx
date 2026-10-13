/**
 * LandingPage.tsx — stub (full implementation in FEAT-004)
 */
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">WattWise</p>
          <h1>Explainable Electricity Tariff Intelligence</h1>
          <p className="hero-description">
            Compare tariff plans, estimate your bill, and discover the cheapest option —
            with a full explanation of how your usage affects the cost.
          </p>
          <div className="hero-cta-group">
            <Link to="/calculator" className="btn btn-primary">
              Start Comparing
            </Link>
            <Link to="/plans" className="btn btn-secondary">
              Browse Plans
            </Link>
          </div>
        </div>
      </section>
      <p className="field-hint">Full landing page coming soon.</p>
    </div>
  );
}
