'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import Image from 'next/image';
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
import { resolveMediaUrl } from '@/lib/mediaUrls';
import { uploadPostImage } from '@/lib/uploads';
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
  const postMediaInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPostMedia, setIsUploadingPostMedia] = useState(false);
  const [postMediaError, setPostMediaError] = useState('');

  const handlePostMediaChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const remainingSlots = Math.max(0, 4 - posts.composerMediaUrls.length);
    if (remainingSlots === 0) {
      setPostMediaError('Remove an image before adding another.');
      return;
    }

    try {
      setIsUploadingPostMedia(true);
      setPostMediaError('');
      const uploadedUrls = await Promise.all(
        files.slice(0, remainingSlots).map((file) => uploadPostImage(file)),
      );

      posts.setComposerMediaUrls((current) => [
        ...current,
        ...uploadedUrls,
      ]);
    } catch (error) {
      setPostMediaError(
        error instanceof Error ? error.message : 'Image upload failed.',
      );
    } finally {
      setIsUploadingPostMedia(false);
    }
  };

  return (
    <main className="relative min-h-screen min-w-0 overflow-hidden border-x border-white/[0.055] bg-[#060911]/45 shadow-[0_0_70px_rgba(0,0,0,0.18)] md:min-h-[calc(100vh-2.5rem)] md:rounded-3xl">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#07101f]/82 px-5 py-4 shadow-[0_14px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <h1 className="text-sm font-black uppercase tracking-[0.18em] text-slate-200">
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
                <div className="m-4 rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.07] to-white/[0.025] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)] sm:p-5">
                  <div className="flex gap-4">
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
                        className="h-20 rounded-2xl border-white/[0.08] bg-[#07101f]/80 pt-2 text-[15px]"
                      />

                      <div className="mt-3 flex flex-col gap-3 border-t border-white/[0.05] pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="min-h-4 text-xs text-slate-500">
                          {posts.composerDraftStatus === 'restored' &&
                            'Draft restored'}
                          {posts.composerDraftStatus === 'saved' &&
                            'Draft saved'}
                          {isUploadingPostMedia && 'Uploading image...'}
                          {postMediaError}
                        </p>

                        <div className="flex shrink-0 items-center gap-2">
                          <input
                            ref={postMediaInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePostMediaChange}
                            className="sr-only"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => postMediaInputRef.current?.click()}
                            disabled={
                              isUploadingPostMedia ||
                              posts.composerMediaUrls.length >= 4
                            }
                            className="pressable px-3 py-1.5 text-xs"
                          >
                            Image
                          </Button>

                          <Button
                            onClick={onPublishPost}
                            disabled={
                              !auth.isAuthReady ||
                              !auth.isLoggedIn ||
                              isUploadingPostMedia ||
                              (!posts.composerInput.trim() &&
                                posts.composerMediaUrls.length === 0)
                            }
                            className={`pressable px-5 py-1.5 text-xs shadow-[0_12px_28px_rgba(79,70,229,0.2)] ${theme.themeAccent.split(' ')[0]}`}
                          >
                            Publish
                          </Button>
                        </div>
                      </div>

                      {posts.composerMediaUrls.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {posts.composerMediaUrls.map((url, index) => {
                            const resolvedUrl = resolveMediaUrl(url);
                            if (!resolvedUrl) return null;

                            return (
                              <div
                                key={`${url}-${index}`}
                                className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                              >
                                <Image
                                  src={resolvedUrl}
                                  alt="Selected post media"
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 45vw, 320px"
                                  unoptimized
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    posts.setComposerMediaUrls((current) =>
                                      current.filter((item) => item !== url),
                                    )
                                  }
                                  className="pressable absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white hover:bg-black/85"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
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
            filter={notifications.filter}
            isLoading={notifications.isLoading}
            items={notifications.filteredItems}
            onFilterChange={notifications.setFilter}
            onMarkAllRead={notifications.markAllRead}
            totalCount={notifications.totalCount}
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
