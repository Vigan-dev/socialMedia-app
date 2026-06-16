import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useKeyPress } from '@/hooks/useKeyPress';
import { useNotifications } from '@/hooks/useNotifications';
import { usePosts } from '@/hooks/usePosts';
import { useThemePreference } from '@/hooks/useThemePreference';
import {
  buildHomeTabsForRole,
  canAccessAdmin,
  canAccessModeration,
  primaryMobileTabs,
} from '@/lib/roleNavigation';
import {
  cookieConsentStorageKey,
  loginSuccessStorageKey,
} from '@/lib/authUiState';

const activeTabStorageKey = 'versatile-active-tab';

function useHomeNavigation(role?: string | null) {
  const [activeTab, setActiveTab] = useState('Home');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const tabs = useMemo(
    () => buildHomeTabsForRole(role),
    [role],
  );
  const secondaryMobileTabs = useMemo(
    () => tabs.filter((tab) => !primaryMobileTabs.includes(tab)),
    [tabs],
  );

  useEffect(() => {
    const storedTab = localStorage.getItem(activeTabStorageKey);
    if (storedTab && tabs.includes(storedTab)) {
      setActiveTab(storedTab);
      return;
    }

    if (!tabs.includes(activeTab)) {
      setActiveTab('Home');
      localStorage.setItem(activeTabStorageKey, 'Home');
    }
  }, [activeTab, tabs]);

  const selectTab = useCallback((tab: string) => {
    setActiveTab(tab);
    localStorage.setItem(activeTabStorageKey, tab);
    setIsMoreOpen(false);
  }, []);

  return {
    activeTab,
    isMoreOpen,
    primaryMobileTabs,
    secondaryMobileTabs,
    selectTab,
    setIsMoreOpen,
    tabs,
  };
}

function useCookieConsentState() {
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(true);

  useEffect(() => {
    setHasAcceptedCookies(
      localStorage.getItem(cookieConsentStorageKey) === 'accepted',
    );
  }, []);

  const acceptCookies = useCallback(() => {
    localStorage.setItem(cookieConsentStorageKey, 'accepted');
    setHasAcceptedCookies(true);
  }, []);

  return {
    acceptCookies,
    hasAcceptedCookies,
  };
}

function useLoginWelcomeState(isAuthReady: boolean, isLoggedIn: boolean) {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!isAuthReady || !isLoggedIn) return;
    if (sessionStorage.getItem(loginSuccessStorageKey) !== 'true') return;

    sessionStorage.removeItem(loginSuccessStorageKey);
    setShowWelcome(true);

    const timeoutId = window.setTimeout(() => {
      setShowWelcome(false);
    }, 5200);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthReady, isLoggedIn]);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
  }, []);

  return {
    dismissWelcome,
    showWelcome,
  };
}

export function useHomeController() {
  const auth = useAuth();
  const chat = useChat(auth.isLoggedIn);
  const notifications = useNotifications(auth.isLoggedIn);
  const posts = usePosts({
    draftOwnerKey: auth.isLoggedIn ? auth.username : null,
    isAuthReady: auth.isAuthReady,
    isLoggedIn: auth.isLoggedIn,
  });
  const theme = useThemePreference();
  const canModerate = canAccessModeration(auth.profile?.role);
  const canAdmin = canAccessAdmin(auth.profile?.role);
  const navigation = useHomeNavigation(auth.profile?.role);
  const cookieConsent = useCookieConsentState();
  const loginWelcome = useLoginWelcomeState(auth.isAuthReady, auth.isLoggedIn);
  const { activeTab, selectTab } = navigation;

  const showHomeSearch = useCallback(
    (topic: string) => {
      posts.setSearchQuery(topic);
      selectTab('Home');
    },
    [posts, selectTab],
  );

  const startConversation = useCallback(
    async (userId: string) => {
      try {
        await chat.startConversation(userId);
      } finally {
        selectTab('Messages');
      }
    },
    [chat, selectTab],
  );

  const publishPost = useCallback(() => {
    if (!auth.isAuthReady || !auth.isLoggedIn) {
      auth.openAuth('login');
      return;
    }

    posts.createPost(auth.username, theme.accentColor);
  }, [
    auth,
    posts,
    theme.accentColor,
  ]);

  useKeyPress(
    useCallback(
      (event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === 'Enter' &&
          activeTab === 'Home' &&
          auth.isAuthReady &&
          auth.isLoggedIn
        ) {
          publishPost();
        }
      },
      [activeTab, auth.isAuthReady, auth.isLoggedIn, publishPost],
    ),
  );

  const rootMode =
    theme.themeMode === 'dark'
      ? 'text-slate-100'
      : 'text-slate-950';

  return {
    acceptCookies: cookieConsent.acceptCookies,
    activeTab,
    auth,
    canAdmin,
    canModerate,
    chat,
    hasAcceptedCookies: cookieConsent.hasAcceptedCookies,
    dismissWelcome: loginWelcome.dismissWelcome,
    isMoreOpen: navigation.isMoreOpen,
    notifications,
    posts,
    primaryMobileTabs: navigation.primaryMobileTabs,
    publishPost,
    rootMode,
    secondaryMobileTabs: navigation.secondaryMobileTabs,
    selectTab,
    setIsMoreOpen: navigation.setIsMoreOpen,
    showHomeSearch,
    showWelcome: loginWelcome.showWelcome,
    startConversation,
    tabs: navigation.tabs,
    theme,
  };
}
