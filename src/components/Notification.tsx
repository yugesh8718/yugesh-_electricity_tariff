/**
 * Notification.tsx
 *
 * Pure presentational notification component.
 * Renders a dismissible alert with role="alert" for screen-reader support.
 * No timers — auto-dismiss is handled by the useNotifications hook.
 */

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  onClose?: () => void;
}

export default function Notification({ id, type, message, onClose }: NotificationProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`notification notification-${type}`}
      data-notification-id={id}
    >
      <span className="notification-message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="notification-close"
          aria-label="Dismiss notification"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
}
