'use client';

import { useMemo, useRef, useState } from 'react';
import type { Post, ReportReason, ReportTargetType } from '@/types/feed';
import { PostCard } from '@/components/PostCard';
import { PostSkeleton } from '@/components/ui/Skeleton';
import type { FeedMode } from '@/hooks/usePosts';

type VirtualPostFeedProps = {
  feedMode: FeedMode;
  hasMorePosts: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onAddComment: (postId: Post['id'], content: string) => void;
  onAddReply: (postId: Post['id'], commentId: string, content: string) => void;
  onDeletePost: (postId: Post['id']) => void;
  onEditPost: (postId: Post['id'], content: string) => void;
  onHidePost: (postId: Post['id']) => void;
  onBlockUser: (userId: string) => void;
  onMuteUser: (userId: string) => void;
  onReportContent: (
    targetType: ReportTargetType,
    targetId: string,
    reason: ReportReason,
    details?: string,
  ) => void;
  onFeedModeChange: (mode: FeedMode) => void;
  onLoadMore: () => void;
  onToggleCommentLike: (postId: Post['id'], commentId: string) => void;
  onToggleFollow: (userId: string) => void;
  onToggleLike: (postId: Post['id']) => void;
  onToggleReplyLike: (
    postId: Post['id'],
    commentId: string,
    replyId: string,
  ) => void;
  posts: Post[];
  searchQuery: string;
};

const rowHeight = 420;
const overscan = 4;

export function VirtualPostFeed({
  feedMode,
  hasMorePosts,
  isLoading = false,
  isLoadingMore = false,
  onAddComment,
  onAddReply,
  onDeletePost,
  onEditPost,
  onHidePost,
  onBlockUser,
  onMuteUser,
  onReportContent,
  onFeedModeChange,
  onLoadMore,
  onToggleCommentLike,
  onToggleFollow,
  onToggleLike,
  onToggleReplyLike,
  posts,
  searchQuery,
}: VirtualPostFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(720);

  const visibleRows = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(posts.length, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);

    return posts.slice(start, end).map((post, index) => ({
      index: start + index,
      post,
    }));
  }, [posts, scrollTop, viewportHeight]);

  const feedHeader = (
    <FeedToolbar
      feedMode={feedMode}
      onFeedModeChange={onFeedModeChange}
      postCount={posts.length}
    />
  );

  if (isLoading) {
    return (
      <div>
        {feedHeader}
        {Array.from({ length: 4 }, (_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div>
        {feedHeader}
        <FeedEmptyState feedMode={feedMode} searchQuery={searchQuery} />
      </div>
    );
  }

  if (posts.length < 25) {
    return (
      <div>
        {feedHeader}
        <div className="divide-y divide-white/[0.02]">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onAddComment={onAddComment}
              onAddReply={onAddReply}
              onDeletePost={onDeletePost}
              onEditPost={onEditPost}
              onHidePost={onHidePost}
              onBlockUser={onBlockUser}
              onMuteUser={onMuteUser}
              onReportContent={onReportContent}
              onToggleCommentLike={onToggleCommentLike}
              onToggleFollow={onToggleFollow}
              onToggleLike={onToggleLike}
              onToggleReplyLike={onToggleReplyLike}
            />
          ))}
        </div>
        <FeedPaginationFooter
          hasMorePosts={hasMorePosts}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
        />
      </div>
    );
  }

  return (
    <div>
      {feedHeader}
      <div
        ref={scrollRef}
        onScroll={(event) => {
          setScrollTop(event.currentTarget.scrollTop);
          setViewportHeight(event.currentTarget.clientHeight);
        }}
        className="h-[70vh] overflow-y-auto"
      >
        <div style={{ height: posts.length * rowHeight, position: 'relative' }}>
          {visibleRows.map(({ index, post }) => (
            <div key={post.id} style={{ height: rowHeight, left: 0, position: 'absolute', right: 0, top: index * rowHeight }}>
              <PostCard
                post={post}
                onAddComment={onAddComment}
                onAddReply={onAddReply}
                onDeletePost={onDeletePost}
                onEditPost={onEditPost}
                onHidePost={onHidePost}
                onBlockUser={onBlockUser}
                onMuteUser={onMuteUser}
                onReportContent={onReportContent}
                onToggleCommentLike={onToggleCommentLike}
                onToggleFollow={onToggleFollow}
                onToggleLike={onToggleLike}
                onToggleReplyLike={onToggleReplyLike}
              />
            </div>
          ))}
        </div>
      </div>
      <FeedPaginationFooter
        hasMorePosts={hasMorePosts}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
      />
    </div>
  );
}

function FeedToolbar({
  feedMode,
  onFeedModeChange,
  postCount,
}: {
  feedMode: FeedMode;
  onFeedModeChange: (mode: FeedMode) => void;
  postCount: number;
}) {
  const options: Array<{ id: FeedMode; label: string; helper: string }> = [
    { id: 'latest', label: 'Latest', helper: 'Newest posts first' },
    { id: 'trending', label: 'Trending', helper: 'Recent active posts' },
    { id: 'following', label: 'Following', helper: 'People you follow' },
  ];

  return (
    <div className="border-b border-white/[0.05] bg-[#060911]/80 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
            Feed Quality
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {postCount} loaded posts. Load more when you reach the end.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onFeedModeChange(option.id)}
              className={`rounded-xl px-3 py-2 text-left transition ${
                feedMode === option.id
                  ? 'bg-white text-slate-950'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <span className="block text-xs font-bold">{option.label}</span>
              <span className="hidden text-[10px] opacity-70 sm:block">
                {option.helper}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedEmptyState({
  feedMode,
  searchQuery,
}: {
  feedMode: FeedMode;
  searchQuery: string;
}) {
  if (searchQuery.trim()) {
    return (
      <div className="p-5">
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center">
          <p className="text-sm font-semibold text-slate-200">
            No posts match &quot;{searchQuery.trim()}&quot;.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Try a different keyword or clear search to return to the full feed.
          </p>
        </div>
      </div>
    );
  }

  const copy =
    feedMode === 'following'
      ? {
          title: 'No posts from people you follow yet.',
          body: 'Follow more people from search or suggestions to build a focused feed.',
        }
      : {
          title: 'No posts to show right now.',
          body: 'Create a post or check back after your network starts sharing.',
        };

  return (
    <div className="p-5">
      <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center">
        <p className="text-sm font-semibold text-slate-200">{copy.title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {copy.body}
        </p>
      </div>
    </div>
  );
}

function FeedPaginationFooter({
  hasMorePosts,
  isLoadingMore,
  onLoadMore,
}: {
  hasMorePosts: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div className="border-t border-white/[0.05] p-5 text-center">
      {hasMorePosts ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoadingMore ? 'Loading more...' : 'Load more posts'}
        </button>
      ) : (
        <p className="text-xs text-slate-600">You reached the end of this feed.</p>
      )}
    </div>
  );
}
