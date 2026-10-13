/**
 * main.tsx
 *
 * Application entry point.
 * Wraps the app in BrowserRouter, AuthProvider, LangProvider, and NotificationProvider.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LangProvider } from './lib/lang.jsx';
import { NotificationProvider } from './contexts/NotificationContext';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in the document.');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
