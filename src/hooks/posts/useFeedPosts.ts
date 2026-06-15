'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiData,
  apiDeleteVoid,
  apiPatchData,
  apiPostData,
} from '@/lib/apiClient';
import { decodeFeedPage, decodePost } from '@/lib/apiSchemas';
import type { Post, TrendingItemData } from '@/types/feed';
import {
  accentGradient,
  formatPost,
  scoreRelativeTime,
  scoreTextMatch,
} from './postUtils';
import type { FeedMode } from './postUtils';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [composerInput, setComposerInput] = useState('');
  const [feedMode, setFeedMode] = useState<FeedMode>('latest');
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
        const page = await apiData(
          buildFeedUrl(),
          undefined,
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
      const page = await apiData(
        buildFeedUrl(feedCursor),
        undefined,
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

  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return posts;

    return posts
      .map((post) => {
        const textScore =
          scoreTextMatch(post.user, query, 2) +
          scoreTextMatch(post.handle, query, 1.5) +
          scoreTextMatch(post.content, query, 3);
        const engagementScore =
          Math.log10(post.likes + 1) * 8 +
          Math.log10(post.comments + 1) * 6 +
          (post.isLiked ? 4 : 0) +
          (post.isFollowing ? 8 : 0);
        const recencyScore = scoreRelativeTime(post.time);
        const score = textScore + engagementScore + recencyScore;

        return { post, score };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.post.likes + b.post.comments - (a.post.likes + a.post.comments),
      )
      .map((item) => item.post);
  }, [posts, searchQuery]);

  const trendingItems = useMemo<TrendingItemData[]>(() => {
    const topicCounts = posts.reduce<Map<string, number>>((counts, post) => {
      const topic = post.user.trim();
      if (!topic) return counts;

      counts.set(topic, (counts.get(topic) ?? 0) + 1);
      return counts;
    }, new Map());

    return Array.from(topicCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([topic, count]) => ({
        id: topic,
        category: 'Active author',
        topic,
        count: `${count} ${count === 1 ? 'post' : 'posts'}`,
      }));
  }, [posts]);

  const createPost = async (username: string, accentColor: string) => {
    const content = composerInput.trim();
    if (!content) return;
    clearError();

    const optimisticPost: Post = {
      id: crypto.randomUUID(),
      user: username,
      handle: `@${username.toLowerCase().replace(/\s+/g, '_')}`,
      avatarBg: accentGradient(accentColor),
      avatarText: username.slice(0, 2).toUpperCase(),
      content,
      time: 'Just now',
      likes: 0,
      comments: 0,
      isLiked: false,
    };

    if (feedMode !== 'following') {
      setPosts((current) => [optimisticPost, ...current]);
    }
    setComposerInput('');

    try {
      const createdPost = await apiPostData(
        '/posts',
        {
          content,
        },
        'Failed to create post',
        decodePost,
      );

      setPosts((current) =>
        feedMode === 'following'
          ? current
          : current.map((post) =>
              post.id === optimisticPost.id ? formatPost(createdPost) : post,
            ),
      );
    } catch (error) {
      if (feedMode !== 'following') {
        setPosts((current) =>
          current.filter((post) => post.id !== optimisticPost.id),
        );
      }
      setComposerInput(content);
      showError('Your post was not published. Please try again.', error);
    }
  };

  const syncUpdatedPost = (postId: Post['id'], updatedPost: Post) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? formatPost(updatedPost) : post,
      ),
    );
  };

  const toggleLike = async (postId: Post['id']) => {
    clearError();

    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;
        const nextLiked = !post.isLiked;
        return {
          ...post,
          isLiked: nextLiked,
          likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)),
        };
      }),
    );

    try {
      const data = await apiPostData(
        `/posts/${postId}/like`,
        undefined,
        'Failed to update like',
        decodePost,
      );

      syncUpdatedPost(postId, data);
    } catch (error) {
      setPosts((current) =>
        current.map((post) => {
          if (post.id !== postId) return post;
          const nextLiked = !post.isLiked;
          return {
            ...post,
            isLiked: nextLiked,
            likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)),
          };
        }),
      );
      showError('Like update failed. Your feed was restored.', error);
    }
  };

  const addComment = async (postId: Post['id'], content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    clearError();

    try {
      const data = await apiPostData(
        `/posts/${postId}/comments`,
        {
          content: trimmedContent,
        },
        'Failed to add comment',
        decodePost,
      );

      syncUpdatedPost(postId, data);
    } catch (error) {
      showError('Comment was not saved. Please try again.', error);
    }
  };

  const toggleCommentLike = async (postId: Post['id'], commentId: string) => {
    clearError();

    const updateComment = (post: Post): Post => ({
      ...post,
      commentItems: (post.commentItems ?? []).map((comment) => {
        if (comment.id !== commentId) return comment;

        const nextLiked = !comment.isLiked;
        return {
          ...comment,
          isLiked: nextLiked,
          likes: Math.max(0, comment.likes + (nextLiked ? 1 : -1)),
        };
      }),
    });

    setPosts((current) =>
      current.map((post) => (post.id === postId ? updateComment(post) : post)),
    );

    try {
      const data = await apiPostData(
        `/posts/${postId}/comments/${commentId}/like`,
        undefined,
        'Failed to update comment like',
        decodePost,
      );

      syncUpdatedPost(postId, data);
    } catch (error) {
      setPosts((current) =>
        current.map((post) => (post.id === postId ? updateComment(post) : post)),
      );
      showError('Comment like update failed. Your feed was restored.', error);
    }
  };

  const addReply = async (
    postId: Post['id'],
    commentId: string,
    content: string,
  ) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    clearError();

    try {
      const data = await apiPostData(
        `/posts/${postId}/comments/${commentId}/replies`,
        {
          content: trimmedContent,
        },
        'Failed to add reply',
        decodePost,
      );

      syncUpdatedPost(postId, data);
    } catch (error) {
      showError('Reply was not saved. Please try again.', error);
    }
  };

  const toggleReplyLike = async (
    postId: Post['id'],
    commentId: string,
    replyId: string,
  ) => {
    clearError();

    const updateReply = (post: Post): Post => ({
      ...post,
      commentItems: (post.commentItems ?? []).map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: (comment.replies ?? []).map((reply) => {
                if (reply.id !== replyId) return reply;

                const nextLiked = !reply.isLiked;
                return {
                  ...reply,
                  isLiked: nextLiked,
                  likes: Math.max(0, reply.likes + (nextLiked ? 1 : -1)),
                };
              }),
            }
          : comment,
      ),
    });

    setPosts((current) =>
      current.map((post) => (post.id === postId ? updateReply(post) : post)),
    );

    try {
      const data = await apiPostData(
        `/posts/${postId}/comments/${commentId}/replies/${replyId}/like`,
        undefined,
        'Failed to update reply like',
        decodePost,
      );

      syncUpdatedPost(postId, data);
    } catch (error) {
      setPosts((current) =>
        current.map((post) => (post.id === postId ? updateReply(post) : post)),
      );
      showError('Reply like update failed. Your feed was restored.', error);
    }
  };

  const editPost = async (postId: Post['id'], content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    clearError();

    let previousPost: Post | undefined;

    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;

        previousPost = post;
        return { ...post, content: trimmedContent };
      }),
    );

    try {
      const data = await apiPatchData(
        `/posts/${postId}`,
        {
          content: trimmedContent,
        },
        'Failed to edit post',
        decodePost,
      );

      syncUpdatedPost(postId, data);
    } catch (error) {
      if (!previousPost) return;

      setPosts((current) =>
        current.map((post) => (post.id === postId ? previousPost! : post)),
      );
      showError('Post edit failed. Your previous post was restored.', error);
    }
  };

  const deletePost = async (postId: Post['id']) => {
    clearError();
    let deletedPost: Post | undefined;

    setPosts((current) =>
      current.filter((post) => {
        if (post.id !== postId) return true;

        deletedPost = post;
        return false;
      }),
    );

    try {
      await apiDeleteVoid(
        `/posts/${postId}`,
        'Failed to delete post',
      );
    } catch (error) {
      if (!deletedPost) return;

      setPosts((current) => [deletedPost!, ...current]);
      showError('Post deletion failed. Your post was restored.', error);
    }
  };

  return {
    addComment,
    addReply,
    composerInput,
    createPost,
    deletePost,
    editPost,
    feedMode,
    filteredPosts,
    hasMorePosts,
    isLoadingFeed,
    isLoadingMorePosts,
    loadMorePosts,
    posts,
    setComposerInput,
    setFeedMode,
    setIsLoadingFeed,
    setPosts,
    toggleCommentLike,
    toggleLike,
    toggleReplyLike,
    trendingItems,
  };
}
