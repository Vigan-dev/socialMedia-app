'use client';

import { useMemo, useState } from 'react';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import type { FeedMode } from './postUtils';
import { selectFilteredPosts, selectTrendingItems } from './feedSelectors';
import { useFeedPagination } from './useFeedPagination';
import { usePostMutations } from './usePostMutations';

type UseFeedPostsInput = {
  clearError: () => void;
  draftOwnerKey?: string | null;
  isAuthReady: boolean;
  isLoggedIn: boolean;
  searchQuery: string;
  showError: (fallback: string, error?: unknown) => void;
};

export function useFeedPosts({
  clearError,
  draftOwnerKey,
  isAuthReady,
  isLoggedIn,
  searchQuery,
  showError,
}: UseFeedPostsInput) {
  const composerDraft = useDraftAutosave({
    storageKey: `versatile-post-draft:${draftOwnerKey ?? 'anonymous'}`,
  });
  const [composerMediaUrls, setComposerMediaUrls] = useState<string[]>([]);
  const [feedMode, setFeedMode] = useState<FeedMode>('latest');
  const feed = useFeedPagination({
    clearError,
    feedMode,
    isAuthReady,
    isLoggedIn,
    showError,
  });
  const mutations = usePostMutations({
    clearComposerDraft: composerDraft.clearDraft,
    clearError,
    composerInput: composerDraft.value,
    composerMediaUrls,
    feedMode,
    resetComposerMediaUrls: () => setComposerMediaUrls([]),
    resetComposerInput: composerDraft.resetValue,
    setComposerInput: composerDraft.setValue,
    setComposerMediaUrls,
    setPosts: feed.setPosts,
    showError,
  });
  const filteredPosts = useMemo(
    () => selectFilteredPosts(feed.posts, searchQuery),
    [feed.posts, searchQuery],
  );
  const trendingItems = useMemo(
    () => selectTrendingItems(feed.posts),
    [feed.posts],
  );

  return {
    addComment: mutations.addComment,
    addReply: mutations.addReply,
    composerDraftStatus: composerDraft.draftStatus,
    composerInput: composerDraft.value,
    composerMediaUrls,
    createPost: mutations.createPost,
    deletePost: mutations.deletePost,
    editPost: mutations.editPost,
    feedMode,
    filteredPosts,
    hasMorePosts: feed.hasMorePosts,
    isLoadingFeed: feed.isLoadingFeed,
    isLoadingMorePosts: feed.isLoadingMorePosts,
    loadMorePosts: feed.loadMorePosts,
    posts: feed.posts,
    setComposerInput: composerDraft.setValue,
    setComposerMediaUrls,
    setFeedMode,
    setIsLoadingFeed: feed.setIsLoadingFeed,
    setPosts: feed.setPosts,
    toggleCommentLike: mutations.toggleCommentLike,
    toggleLike: mutations.toggleLike,
    toggleReplyLike: mutations.toggleReplyLike,
    trendingItems,
  };
}
