'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiJsonData } from '@/lib/apiClient';
import { decodeFeedPage } from '@/lib/apiSchemas';
import type { Post } from '@/types/feed';
import { formatPost } from './postUtils';
import type { FeedMode } from './postUtils';

type UseFeedPaginationInput = {
  clearError: () => void;
  feedMode: FeedMode;
  isAuthReady: boolean;
  isLoggedIn: boolean;
  showError: (fallback: string, error?: unknown) => void;
};

export function useFeedPagination({
  clearError,
  feedMode,
  isAuthReady,
  isLoggedIn,
  showError,
}: UseFeedPaginationInput) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedCursor, setFeedCursor] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);

  const buildFeedUrl = useCallback(
    (cursor?: string | null) => {
      const params = new URLSearchParams({
        feed: feedMode === 'following' ? 'following' : 'all',
        limit: '12',
        sort: feedMode === 'top' ? 'top' : 'latest',
      });

      if (cursor) {
        params.set('cursor', cursor);
      }

      return `/posts?${params.toString()}`;
    },
    [feedMode],
  );

  useEffect(() => {
    let isMounted = true;

    if (!isAuthReady) {
      return () => {
        isMounted = false;
      };
    }

    if (!isLoggedIn) {
      clearError();
      setPosts([]);
      setFeedCursor(null);
      setHasMorePosts(false);
      setIsLoadingFeed(false);
      return () => {
        isMounted = false;
      };
    }

    const loadFeed = async () => {
      setIsLoadingFeed(true);

      try {
        const page = await apiJsonData(
          buildFeedUrl(),
          'Failed to load posts',
          decodeFeedPage,
        );

        const validatedPosts = page.items.map(formatPost);

        if (isMounted) {
          setPosts(validatedPosts);
          setFeedCursor(page.nextCursor);
          setHasMorePosts(page.hasMore);
        }
      } catch (error) {
        console.error('Failed loading posts:', error);

        if (isMounted) {
          setPosts([]);
          setFeedCursor(null);
          setHasMorePosts(false);
          showError('Failed to load the feed. Try refreshing the page.', error);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFeed(false);
        }
      }
    };

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, [buildFeedUrl, clearError, isAuthReady, isLoggedIn, showError]);

  const loadMorePosts = async () => {
    if (!feedCursor || isLoadingMorePosts || !hasMorePosts) return;

    try {
      clearError();
      setIsLoadingMorePosts(true);
      const page = await apiJsonData(
        buildFeedUrl(feedCursor),
        'Failed to load more posts',
        decodeFeedPage,
      );

      const validatedPosts = page.items.map(formatPost);

      setPosts((current) => {
        const existingIds = new Set(current.map((post) => String(post.id)));
        return [
          ...current,
          ...validatedPosts.filter((post) => !existingIds.has(String(post.id))),
        ];
      });
      setFeedCursor(page.nextCursor);
      setHasMorePosts(page.hasMore);
    } catch (error) {
      showError('More posts could not be loaded. Please try again.', error);
    } finally {
      setIsLoadingMorePosts(false);
    }
  };

  return {
    hasMorePosts,
    isLoadingFeed,
    isLoadingMorePosts,
    loadMorePosts,
    posts,
    setIsLoadingFeed,
    setPosts,
  };
}
