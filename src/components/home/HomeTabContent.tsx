'use client';

import { UserAvatar } from '@/components/UserAvatar';
import { VirtualPostFeed } from '@/components/VirtualPostFeed';
import { AdminSection } from '@/components/sections/AdminSection';
import { ExploreSection } from '@/components/sections/ExploreSection';
import { MessagesSection } from '@/components/sections/MessagesSection';
import { ModerationSection } from '@/components/sections/ModerationSection';
import { NotificationsSection } from '@/components/sections/NotificationsSection';
import { ProfileSection } from '@/components/sections/ProfileSection';
import { SupportSection } from '@/components/sections/SupportSection';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextArea } from '@/components/ui/Input';
import type { useAuth } from '@/hooks/useAuth';
import type { useChat } from '@/hooks/useChat';
import type { useNotifications } from '@/hooks/useNotifications';
import type { usePosts } from '@/hooks/usePosts';
import type { useThemePreference } from '@/hooks/useThemePreference';
import { HomeHero } from './HomeHero';
import { InlineError } from './InlineError';

type AuthState = ReturnType<typeof useAuth>;
type ChatState = ReturnType<typeof useChat>;
type NotificationsState = ReturnType<typeof useNotifications>;
type PostsState = ReturnType<typeof usePosts>;
type ThemeState = ReturnType<typeof useThemePreference>;

type HomeTabContentProps = {
  activeTab: string;
  auth: AuthState;
  canAdmin: boolean;
  canModerate: boolean;
  chat: ChatState;
  notifications: NotificationsState;
  onHomeSearch: (topic: string) => void;
  onPublishPost: () => void;
  onStartConversation: (userId: string) => void;
  posts: PostsState;
  theme: ThemeState;
};

export function HomeTabContent({
  activeTab,
  auth,
  canAdmin,
  canModerate,
  chat,
  notifications,
  onHomeSearch,
  onPublishPost,
  onStartConversation,
  posts,
  theme,
}: HomeTabContentProps) {
  return (
    <main className="relative min-h-screen min-w-0 border-r border-white/[0.05] bg-[#060911]/50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.05] bg-[#060911]/80 p-4 shadow-sm backdrop-blur-xl">
        <h1 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          {activeTab}
        </h1>
      </header>

      {auth.error && (
        <InlineError message={auth.error} onDismiss={auth.clearError} />
      )}

      {posts.error && (
        <InlineError message={posts.error} onDismiss={posts.clearError} />
      )}

      <div key={activeTab} className="tab-panel-transition">
        {activeTab === 'Home' && (
          <>
            <HomeHero isLoggedIn={auth.isLoggedIn} openAuth={auth.openAuth} />

            {auth.isLoggedIn ? (
              <>
                <div className="flex gap-4 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent p-5">
                  <UserAvatar
                    avatarUrl={auth.avatarUrl}
                    username={auth.username}
                  />

                  <div className="min-w-0 flex-1">
                    <TextArea
                      value={posts.composerInput}
                      onChange={(event) =>
                        posts.setComposerInput(event.target.value)
                      }
                      placeholder="Broadcast an update to the network..."
                      className="h-16 pt-1"
                    />

                    <div className="flex justify-end border-t border-white/[0.03] pt-3">
                      <Button
                        onClick={onPublishPost}
                        disabled={
                          !auth.isAuthReady ||
                          !auth.isLoggedIn ||
                          !posts.composerInput.trim()
                        }
                        className={`px-5 py-1.5 text-xs ${theme.themeAccent.split(' ')[0]}`}
                      >
                        Publish
                      </Button>
                    </div>
                  </div>
                </div>

                <VirtualPostFeed
                  feedMode={posts.feedMode}
                  hasMorePosts={posts.hasMorePosts}
                  isLoading={posts.isLoadingFeed}
                  isLoadingMore={posts.isLoadingMorePosts}
                  posts={posts.filteredPosts}
                  searchQuery={posts.searchQuery}
                  onAddComment={posts.addComment}
                  onAddReply={posts.addReply}
                  onBlockUser={posts.blockUser}
                  onDeletePost={posts.deletePost}
                  onEditPost={posts.editPost}
                  onFeedModeChange={posts.setFeedMode}
                  onHidePost={posts.hidePost}
                  onLoadMore={posts.loadMorePosts}
                  onMuteUser={posts.muteUser}
                  onReportContent={posts.reportContent}
                  onToggleCommentLike={posts.toggleCommentLike}
                  onToggleFollow={posts.toggleFollow}
                  onToggleLike={posts.toggleLike}
                  onToggleReplyLike={posts.toggleReplyLike}
                />
              </>
            ) : (
              <div className="p-5">
                <Card className="bg-[#04101f] p-6 text-slate-300">
                  <p className="font-semibold text-white">
                    Start connecting with people today.
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Sign in to post updates, react to content, and keep your
                    conversations organized in one place.
                  </p>

                  <Button
                    onClick={() => auth.openAuth('login')}
                    className="mt-4 rounded-full"
                  >
                    Sign in now
                  </Button>
                </Card>
              </div>
            )}
          </>
        )}

        {activeTab === 'Explore' && (
          <ExploreSection
            trendingItems={posts.trendingItems}
            onTrendClick={onHomeSearch}
          />
        )}

      {activeTab === 'Notifications' && (
        <>
          {notifications.error && (
            <InlineError
              message={notifications.error}
              onDismiss={notifications.clearError}
            />
          )}

          <NotificationsSection
            isLoading={notifications.isLoading}
            items={notifications.items}
            onMarkAllRead={notifications.markAllRead}
            unreadCount={notifications.unreadCount}
          />
        </>
      )}

      {activeTab === 'Messages' && (
        <>
          {chat.error && (
            <InlineError message={chat.error} onDismiss={chat.clearError} />
          )}

          <MessagesSection
            threads={chat.threads}
            filteredThreads={chat.filteredThreads}
            activeThreadId={chat.activeThreadId}
            setActiveThreadId={chat.setActiveThreadId}
            chatInput={chat.chatInput}
            setChatInput={chat.setChatInput}
            conversationSearch={chat.conversationSearch}
            setConversationSearch={chat.setConversationSearch}
            onSendMessage={chat.sendMessage}
            isLoading={chat.isLoading}
            messages={chat.messages}
            themeAccent={theme.themeAccent}
            typingUser={chat.typingUser}
            unreadCount={chat.unreadCount}
          />
        </>
      )}

      {activeTab === 'Support' && (
        <SupportSection userId={auth.profile?.id ?? null} />
      )}

      {activeTab === 'Profile' && (
        <ProfileSection
          username={auth.username}
          accentColor={theme.accentColor}
          setAccentColor={theme.setAccentColor}
          themeMode={theme.themeMode}
          setThemeMode={theme.setThemeMode}
          avatarUrl={auth.avatarUrl}
          followersCount={auth.profile?.followersCount ?? 0}
          followingCount={posts.followingCount}
          followers={posts.followers}
          following={posts.following}
          postsCount={
            posts.posts.filter((post) => post.user === auth.username).length
          }
          posts={posts.posts.filter((post) => post.user === auth.username)}
          onDeletePost={posts.deletePost}
          onEditPost={posts.editPost}
          onStartConversation={onStartConversation}
          onToggleFollow={posts.toggleFollow}
          onBlockUser={posts.blockUser}
          onMuteUser={posts.muteUser}
          onReportUser={posts.reportContent}
          profile={auth.profile}
          onSaveNotificationSettings={auth.updateNotificationSettings}
          onSaveProfile={auth.updateProfile}
          onSavePrivacy={auth.updatePrivacy}
          onLogout={auth.logout}
        />
      )}

      {activeTab === 'Moderation' && canModerate && (
        <ModerationSection onLogout={auth.logout} />
      )}

        {activeTab === 'Admin' && canAdmin && (
          <AdminSection onLogout={auth.logout} />
        )}
      </div>
    </main>
  );
}
