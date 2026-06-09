// src/hooks/useNotification.js
import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

export function useNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch notification history from the Laravel API.
   * This automatically runs the backend scan to generate notifications.
   */
  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/notifikasi');
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Fetch notifications failed:', err);
      setError(err.message || 'Gagal memuat riwayat notifikasi.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark a notification as read (permanently stored in backend database,
   * with optimistic local toggle for responsive UI).
   */
  const markAsRead = useCallback(async (id) => {
    // 1. Optimistic UI update
    setNotifications(prev => 
      prev.map(n => n.id_notifikasi === id ? { ...n, status_baca: true } : n)
    );

    // 2. Persist in database in background
    try {
      await api.put(`/notifikasi/${id}/read`, {});
    } catch (err) {
      console.error('Failed to mark notification as read in database:', err);
      // Revert state if API call failed
      setNotifications(prev => 
        prev.map(n => n.id_notifikasi === id ? { ...n, status_baca: false } : n)
      );
    }
  }, []);

  /**
   * Calculate the number of unread notifications based on the status_baca attribute
   */
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.status_baca).length;
  }, [notifications]);

  // Fetch notifications automatically on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      refreshNotifications();
    });
  }, [refreshNotifications]);

  return {
    notifications,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    getUnreadCount
  };
}
