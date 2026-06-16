'use client';

import { useCallback, useState } from 'react';
import { useFeedPosts } from './posts/useFeedPosts';
import { useModerationActions } from './posts/useModerationActions';
import { useRelationships } from './posts/useRelationships';

export type { FeedMode } from './posts/postUtils';

type UsePostsInput = {
  isAuthReady: boolean;
  isLoggedIn: boolean;
  draftOwnerKey?: string | null;
};

export function usePosts({
  draftOwnerKey,
  isAuthReady,
  isLoggedIn,
}: UsePostsInput) {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  const showError = useCallback((fallback: string, error?: unknown) => {
    setError(error instanceof Error ? error.message : fallback);
  }, []);

  const feed = useFeedPosts({
    clearError,
    draftOwnerKey,
    isAuthReady,
    isLoggedIn,
    searchQuery,
    showError,
  });

  const relationships = useRelationships({
    clearError,
    isAuthReady,
    isLoggedIn,
    searchQuery,
    setPosts: feed.setPosts,
    showError,
  });

  const moderation = useModerationActions({
    clearError,
    removeUserFromLocalState: relationships.removeUserFromLocalState,
    setPosts: feed.setPosts,
    showError,
  });

  return {
    addComment: feed.addComment,
    addReply: feed.addReply,
    clearError,
    blockUser: moderation.blockUser,
    composerDraftStatus: feed.composerDraftStatus,
    composerInput: feed.composerInput,
    createPost: feed.createPost,
    deletePost: feed.deletePost,
    editPost: feed.editPost,
    feedMode: feed.feedMode,
    filteredPosts: feed.filteredPosts,
    filteredUsers: relationships.filteredUsers,
    followers: relationships.followers,
    error,
    isLoadingFeed: feed.isLoadingFeed,
    isLoadingMorePosts: feed.isLoadingMorePosts,
    hidePost: moderation.hidePost,
    hasMorePosts: feed.hasMorePosts,
    loadMorePosts: feed.loadMorePosts,
    muteUser: moderation.muteUser,
    posts: feed.posts,
    following: relationships.following,
    followingCount: relationships.followingCount,
    searchQuery,
    setComposerInput: feed.setComposerInput,
    setFeedMode: feed.setFeedMode,
    setIsLoadingFeed: feed.setIsLoadingFeed,
    setSearchQuery,
    reportContent: moderation.reportContent,
    toggleLike: feed.toggleLike,
    toggleCommentLike: feed.toggleCommentLike,
    toggleFollow: relationships.toggleFollow,
    toggleReplyLike: feed.toggleReplyLike,
    suggestedUsers: relationships.suggestedUsers,
    trendingItems: feed.trendingItems,
  };
}
