/**
 * NotificationContext.tsx
 *
 * Provides a global notification system via React context.
 * NotificationProvider renders the notification container and mounts
 * the Notification components. Children access addNotification via
 * the useNotification hook.
 *
 * Usage:
 *   // In main.tsx: wrap <App /> with <NotificationProvider>
 *   const { addNotification } = useNotification();
 *   addNotification('success', 'Bill calculated successfully!');
 */
import { createContext, useContext, type ReactNode } from 'react';
import useNotifications from '../hooks/useNotifications';
import Notification from '../components/Notification';
import type { NotificationType } from '../components/Notification';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface NotificationContextValue {
  addNotification: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { notifications, addNotification, removeNotification } = useNotifications();

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      <div className="notification-container" aria-live="polite" aria-atomic="false">
        {notifications.map((n) => (
          <Notification
            key={n.id}
            id={n.id}
            type={n.type}
            message={n.message}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>
      {children}
    </NotificationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  // Null-safe guard: return a no-op if used outside NotificationProvider.
  // This prevents test failures in App.test.tsx and other tests that don't
  // wrap components in NotificationProvider.
  if (!ctx) {
    return { addNotification: () => {} };
  }
  return ctx;
}
