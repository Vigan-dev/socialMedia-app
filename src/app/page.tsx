'use client';

import { SearchEngine } from '@/components/SearchEngine';
import { AppSidebar } from '@/components/home/AppSidebar';
import { CookieConsent } from '@/components/home/CookieConsent';
import { HomeTabContent } from '@/components/home/HomeTabContent';
import { MobileNavigation } from '@/components/home/MobileNavigation';
import { WelcomeToast } from '@/components/home/WelcomeToast';
import { useHomeController } from '@/hooks/useHomeController';
import { appConfig } from '@/lib/config';

export default function Home() {
  const home = useHomeController();

  return (
    <div
      data-api-base-url={appConfig.apiBaseUrl}
      data-theme={home.theme.themeMode}
      className={`app-shell min-h-screen ${home.rootMode} flex justify-center selection:bg-indigo-500/30 font-sans tracking-tight antialiased`}
    >
      <div className="app-grid grid min-h-screen w-full max-w-7xl grid-cols-[minmax(0,1fr)] px-0 pb-16 md:grid-cols-[256px_minmax(0,672px)] md:px-8 md:pb-0 lg:grid-cols-[256px_minmax(0,672px)_320px]">
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
      </div>

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
