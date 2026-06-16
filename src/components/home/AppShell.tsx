'use client';

import type { useHomeController } from '@/hooks/useHomeController';
import { appConfig } from '@/lib/config';
import { BottomNavArea } from './BottomNavArea';
import { CookieConsent } from './CookieConsent';
import { DesktopLayout } from './DesktopLayout';
import { WelcomeToast } from './WelcomeToast';

type HomeController = ReturnType<typeof useHomeController>;

type AppShellProps = {
  home: HomeController;
};

export function AppShell({ home }: AppShellProps) {
  return (
    <div
      data-api-base-url={appConfig.apiBaseUrl}
      data-theme={home.theme.themeMode}
      className={`app-shell min-h-screen ${home.rootMode} flex justify-center selection:bg-indigo-500/30 font-sans tracking-tight antialiased`}
    >
      <DesktopLayout home={home} />
      <BottomNavArea home={home} />

      {!home.hasAcceptedCookies && (
        <CookieConsent onAccept={home.acceptCookies} />
      )}

      {home.showWelcome && (
        <WelcomeToast
          username={home.auth.username}
          onDismiss={home.dismissWelcome}
        />
      )}
    </div>
  );
}
