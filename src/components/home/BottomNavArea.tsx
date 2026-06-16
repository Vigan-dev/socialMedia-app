'use client';

import type { useHomeController } from '@/hooks/useHomeController';
import { MobileNavigation } from './MobileNavigation';

type HomeController = ReturnType<typeof useHomeController>;

type BottomNavAreaProps = {
  home: HomeController;
};

export function BottomNavArea({ home }: BottomNavAreaProps) {
  return (
    <MobileNavigation
      activeTab={home.activeTab}
      isMoreOpen={home.isMoreOpen}
      messagesUnreadCount={home.chat.unreadCount}
      notificationsUnreadCount={home.notifications.unreadCount}
      onMoreToggle={() => home.setIsMoreOpen((current) => !current)}
      onSelectTab={home.selectTab}
      primaryTabs={home.primaryMobileTabs}
      secondaryTabs={home.secondaryMobileTabs}
    />
  );
}
