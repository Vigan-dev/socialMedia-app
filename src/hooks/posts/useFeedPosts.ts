'use client';

import { useMemo, useState } from 'react';
import type { FeedMode } from './postUtils';
import { selectFilteredPosts, selectTrendingItems } from './feedSelectors';
import { useFeedPagination } from './useFeedPagination';
import { usePostMutations } from './usePostMutations';

type UseFeedPostsInput = {
  clearError: () => void;
  isAuthReady: boolean;
  isLoggedIn: boolean;
  searchQuery: string;
  showError: (fallback: string, error?: unknown) => void;
};

export function useFeedPosts({
  clearError,
  isAuthReady,
  isLoggedIn,
  searchQuery,
  showError,
}: UseFeedPostsInput) {
  const [composerInput, setComposerInput] = useState('');
  const [feedMode, setFeedMode] = useState<FeedMode>('latest');
  const feed = useFeedPagination({
    clearError,
    feedMode,
    isAuthReady,
    isLoggedIn,
    showError,
  });
  const mutations = usePostMutations({
    clearError,
    composerInput,
    feedMode,
    setComposerInput,
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
    composerInput,
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
    setComposerInput,
    setFeedMode,
    setIsLoadingFeed: feed.setIsLoadingFeed,
    setPosts: feed.setPosts,
    toggleCommentLike: mutations.toggleCommentLike,
    toggleLike: mutations.toggleLike,
    toggleReplyLike: mutations.toggleReplyLike,
    trendingItems,
  };
}
