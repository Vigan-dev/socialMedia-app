'use client';

import { SearchEngine } from '@/components/SearchEngine';
import type { useHomeController } from '@/hooks/useHomeController';
import { AppSidebar } from './AppSidebar';
import { HomeTabContent } from './HomeTabContent';

type HomeController = ReturnType<typeof useHomeController>;

type DesktopLayoutProps = {
  home: HomeController;
};

export function DesktopLayout({ home }: DesktopLayoutProps) {
  return (
    <div className="app-grid grid min-h-screen w-full max-w-[1420px] grid-cols-[minmax(0,1fr)] gap-0 px-0 pb-20 md:grid-cols-[240px_minmax(0,704px)] md:gap-5 md:px-5 md:py-5 md:pb-5 lg:grid-cols-[252px_minmax(0,704px)_340px] xl:gap-6">
      <AppSidebar
        activeTab={home.activeTab}
        auth={home.auth}
        messagesUnreadCount={home.chat.unreadCount}
        notificationsUnreadCount={home.notifications.unreadCount}
        onSelectTab={home.selectTab}
        tabs={home.tabs}
        themeAccentIndicator={home.theme.themeAccentIndicator}
      />

      <HomeTabContent
        activeTab={home.activeTab}
        auth={home.auth}
        canAdmin={home.canAdmin}
        canModerate={home.canModerate}
        chat={home.chat}
        notifications={home.notifications}
        onHomeSearch={home.showHomeSearch}
        onPublishPost={home.publishPost}
        onStartConversation={home.startConversation}
        posts={home.posts}
        theme={home.theme}
      />

      <SearchEngine
        searchQuery={home.posts.searchQuery}
        onSearchChange={home.posts.setSearchQuery}
        trendingItems={home.posts.trendingItems}
        onTrendClick={home.showHomeSearch}
        filteredUsers={home.posts.filteredUsers}
        filteredPosts={home.posts.filteredPosts}
        suggestedUsers={home.posts.suggestedUsers}
        onBlockUser={home.posts.blockUser}
        onMuteUser={home.posts.muteUser}
        onReportUser={home.posts.reportContent}
        onStartConversation={home.startConversation}
        onToggleFollow={home.posts.toggleFollow}
      />
    </div>
  );
}
