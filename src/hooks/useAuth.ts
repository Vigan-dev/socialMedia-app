'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiPatchData } from '@/lib/apiClient';
import {
  decodeAuthProfile,
  type AuthProfile,
  type MessagePrivacy,
  type UserStatus,
} from '@/lib/apiSchemas';
import {
  logoutSession,
  refreshSession,
} from '@/lib/authApi';
import { useRouter } from 'next/navigation';

export type { MessagePrivacy, UserStatus } from '@/lib/apiSchemas';

type AuthMode = 'login' | 'signup';

export function useAuth() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [username, setUsername] = useState('Current User');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  const showError = useCallback((fallback: string, error?: unknown) => {
    setError(error instanceof Error ? error.message : fallback);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const result = await refreshSession();
        if (!isMounted) return;

        setProfile(result.user);
        setUsername(result.user.username);
        setAvatarUrl(result.user.avatarUrl);
        setIsLoggedIn(true);
        setIsAuthReady(true);
        clearError();
      } catch {
        if (!isMounted) return;

        setIsLoggedIn(false);
        setProfile(null);
        setUsername('Current User');
        setAvatarUrl(null);
        setIsAuthReady(true);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [clearError]);

  const openAuth = useCallback((mode: AuthMode) => {
    router.push(mode === 'signup' ? '/signup' : '/login');
  }, [router]);

  const logout = async () => {
    try {
      await logoutSession();
      clearError();
    } catch (error) {
      showError('Logout failed on the server. Local session was cleared.', error);
    }

    setIsLoggedIn(false);
    setIsAuthReady(true);
    setProfile(null);
    setAvatarUrl(null);
    setUsername('Current User');

    router.replace('/login');
    router.refresh();
  };

  const updateProfile = async (nextProfile: {
    bio?: string;
    username: string;
    avatarUrl: string | null;
  }) => {
    try {
      clearError();
      const profileData = await apiPatchData(
        '/users/me',
        {
          avatarUrl: nextProfile.avatarUrl,
          bio: nextProfile.bio,
          username: nextProfile.username,
        },
        'Profile update failed',
        decodeAuthProfile,
      );

      setProfile(profileData);
      setUsername(profileData.username);
      setAvatarUrl(profileData.avatarUrl);
    } catch (error) {
      showError('Profile update failed. No profile changes were applied locally.', error);
      throw error;
    }
  };

  const updateStatus = async (status: UserStatus) => {
    try {
      clearError();
      const data = await apiPatchData(
        '/users/status',
        {
          status,
        },
        'Status update failed',
        decodeAuthProfile,
      );

      setProfile(data);
    } catch (error) {
      showError('Status update failed. Please try again.', error);
      throw error;
    }
  };

  const updatePrivacy = async (nextPrivacy: {
    allowMessagesFrom?: MessagePrivacy;
    allowMentionsFrom?: MessagePrivacy;
    showOnlineStatus?: boolean;
  }) => {
    try {
      clearError();
      const data = await apiPatchData(
        '/users/privacy',
        nextPrivacy,
        'Privacy update failed',
        decodeAuthProfile,
      );

      setProfile(data);
    } catch (error) {
      showError('Privacy update failed. Your previous settings are still shown.', error);
      throw error;
    }
  };

  const updateNotificationSettings = async (settings: Partial<AuthProfile['notificationSettings']>) => {
    try {
      clearError();
      const data = await apiPatchData(
        '/users/notification-settings',
        settings,
        'Notification settings update failed',
        decodeAuthProfile,
      );

      setProfile(data);
    } catch (error) {
      showError('Notification settings update failed. Please try again.', error);
      throw error;
    }
  };

  return {
    avatarUrl,
    clearError,
    error,
    isAuthReady,
    isLoggedIn,
    profile,
    setUsername,
    updateNotificationSettings,
    updatePrivacy,
    updateProfile,
    updateStatus,
    openAuth,
    username,
    logout,
  };
}
