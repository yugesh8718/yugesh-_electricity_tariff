/**
 * useNotifications.ts
 *
 * Manages an array of in-app notification items.
 * Each notification auto-dismisses after 5000ms.
 *
 * Usage:
 *   const { notifications, addNotification, removeNotification } = useNotifications();
 */
import { useState, useCallback } from 'react';
import type { NotificationType } from '../components/Notification';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
}

export interface UseNotificationsReturn {
  notifications: NotificationItem[];
  addNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: string) => void;
}

export default function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (type: NotificationType, message: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      const item: NotificationItem = { id, type, message };
      setNotifications((prev) => [...prev, item]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    },
    [],
  );

  return { notifications, addNotification, removeNotification };
}
