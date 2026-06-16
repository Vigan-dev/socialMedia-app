'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  apiDeleteVoid,
  apiPatchData,
  apiPostData,
} from '@/lib/apiClient';
import { decodePost } from '@/lib/apiSchemas';
import type { Post } from '@/types/feed';
import {
  accentGradient,
  formatPost,
} from './postUtils';
import type { FeedMode } from './postUtils';

type UsePostMutationsInput = {
  clearError: () => void;
  composerInput: string;
  feedMode: FeedMode;
  setComposerInput: Dispatch<SetStateAction<string>>;
  setPosts: Dispatch<SetStateAction<Post[]>>;
  showError: (fallback: string, error?: unknown) => void;
};

export function usePostMutations({
  clearError,
  composerInput,
  feedMode,
  setComposerInput,
  setPosts,
  showError,
}: UsePostMutationsInput) {
  const syncUpdatedPost = (postId: Post['id'], updatedPost: Post) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? formatPost(updatedPost) : post,
      ),
    );
  };

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
    createPost,
    deletePost,
    editPost,
    toggleCommentLike,
    toggleLike,
    toggleReplyLike,
  };
}
