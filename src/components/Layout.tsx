/**
 * Layout.tsx
 *
 * WattWise shared shell: top navigation + <Outlet /> + footer.
 * - Brand updated to "WattWise" with Zap icon
 * - Nav links updated to WattWise routes
 * - Keeps mobile hamburger toggle
 * - Keeps language toggle (useLang from lang.jsx)
 * - Shows Firebase configuration status in footer
 */
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { isConfigured } from '../firebase/config';
import { useLang } from '../lib/lang.jsx';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const [navOpen, setNavOpen] = useState(false);
  const { lang, toggle, t } = useLang();
  const { user, signOut } = useAuth();

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="WattWise home" onClick={closeNav}>
          <Zap className="brand-icon" aria-hidden="true" size={20} />
          <span>WattWise</span>
        </NavLink>

        <button
          className="nav-toggle"
          aria-expanded={navOpen}
          aria-controls="main-nav"
          aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setNavOpen((o) => !o)}
          type="button"
        >
          {navOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>

        <nav
          id="main-nav"
          className={`topbar-nav${navOpen ? ' nav-open' : ''}`}
          aria-label="Main navigation"
        >
          <NavLink to="/"            end onClick={closeNav}>{t('home')}</NavLink>
          <NavLink to="/calculator"      onClick={closeNav}>{t('billCalculator')}</NavLink>
          <NavLink to="/plans"           onClick={closeNav}>Plans</NavLink>

          {user ? (
            <>
              <NavLink to="/saved"   onClick={closeNav}>Saved</NavLink>
              <NavLink to="/profile" onClick={closeNav}>Profile</NavLink>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                onClick={() => { void signOut(); closeNav(); }}
                type="button"
              >
                {t('signOut')}
              </button>
            </>
          ) : (
            <NavLink to="/login" onClick={closeNav}>
              {t('signIn')}
            </NavLink>
          )}

          <button
            className="lang-toggle"
            onClick={toggle}
            type="button"
            aria-label={lang === 'en' ? 'தமிழில் காண்க' : 'Switch to English'}
            title={lang === 'en' ? 'Switch to Tamil' : 'Switch to English'}
          >
            {lang === 'en' ? 'தமிழ்' : 'EN'}
          </button>
        </nav>
      </header>

      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="footer">
        <span>WattWise · Explainable Electricity Tariff Intelligence</span>
        <span className={isConfigured ? 'status-ok' : 'status-demo'}>
          {isConfigured
            ? 'Firebase connected'
            : 'Running in guest mode — add .env to enable Firebase'}
        </span>
      </footer>
    </div>
  );
}
