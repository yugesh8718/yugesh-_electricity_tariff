import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    /**
     * Override Cross-Origin-Opener-Policy so that Firebase Authentication
     * popup windows (Google sign-in) can communicate back to the opener tab.
     *
     * Vite 5+ sets COOP: same-origin by default which silently breaks
     * signInWithPopup — the popup opens but Firebase never receives the
     * credential because the BroadcastChannel / postMessage is blocked.
     *
     * same-origin-allow-popups: allows popups opened by this page to
     * communicate back while still protecting against cross-origin openers.
     */
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    server: {
      deps: {
        inline: ['firebase'],
      },
    },
  },
});
