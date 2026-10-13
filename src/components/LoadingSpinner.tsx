/**
 * LoadingSpinner.tsx
 *
 * Accessible loading spinner.
 * Renders a CSS-animated circle (class .spinner from styles.css) with a
 * visually-hidden status text so screen readers announce "Loading…".
 */

export default function LoadingSpinner() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className="visually-hidden">Loading…</span>
    </div>
  );
}
