'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiJsonData, apiPatchArray } from '@/lib/apiClient';
import { decodeNotification, decodeNotifications } from '@/lib/apiSchemas';
import {
  type NotificationFilter,
  type NotificationItem,
} from '@/components/sections/NotificationsSection';

function matchesFilter(item: NotificationItem, filter: NotificationFilter) {
  if (filter === 'all') return true;
  if (filter === 'unread') return !item.read;

  return item.type === filter;
}

export function useNotifications(isLoggedIn: boolean) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  const showError = useCallback((fallback: string, error?: unknown) => {
    setError(error instanceof Error ? error.message : fallback);
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      clearError();
      return;
    }

    try {
      setIsLoading(true);

      const data = await apiJsonData<NotificationItem[]>(
        '/notifications',
        'Failed to load notifications',
        decodeNotifications,
      );

      setItems(data);
      clearError();
    } catch (error) {
      console.error('Failed loading notifications:', error);
      setItems([]);
      showError('Failed to load notifications. Please try again.', error);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, isLoggedIn, showError]);

  const markAllRead = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      clearError();
      const data = await apiPatchArray<NotificationItem>(
        '/notifications/read-all',
        undefined,
        decodeNotification,
        'Failed to update notifications',
      );

      setItems(data);
    } catch (error) {
      console.error('Failed updating notifications:', error);
      showError('Failed to mark notifications as read. Please try again.', error);
    }
  }, [clearError, isLoggedIn, showError]);

  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
      return;
    }

    setItems([]);
    clearError();
  }, [clearError, isLoggedIn, loadNotifications]);

  const filteredItems = useMemo(
    () => items.filter((item) => matchesFilter(item, filter)),
    [filter, items],
  );

  return {
    clearError,
    error,
    filter,
    filteredItems,
    isLoading,
    items,
    loadNotifications,
    markAllRead,
    setFilter,
    totalCount: items.length,
    unreadCount: items.filter((item) => !item.read).length,
  };
}
