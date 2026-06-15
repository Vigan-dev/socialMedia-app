'use client';

import { apiPostVoid } from '@/lib/apiClient';
import type { Post, ReportReason, ReportTargetType } from '@/types/feed';
import type { Dispatch, SetStateAction } from 'react';

type UseModerationActionsInput = {
  clearError: () => void;
  removeUserFromLocalState: (userId: string) => void;
  setPosts: Dispatch<SetStateAction<Post[]>>;
  showError: (fallback: string, error?: unknown) => void;
};

export function useModerationActions({
  clearError,
  removeUserFromLocalState,
  setPosts,
  showError,
}: UseModerationActionsInput) {
  const hidePost = async (postId: Post['id']) => {
    clearError();

    try {
      await apiPostVoid(
        `/posts/${postId}/hide`,
        undefined,
        'Failed to hide post',
      );

      setPosts((current) => current.filter((post) => post.id !== postId));
    } catch (error) {
      showError('Post could not be hidden. Please try again.', error);
    }
  };

  const reportContent = async (
    targetType: ReportTargetType,
    targetId: string,
    reason: ReportReason,
    details = '',
  ) => {
    clearError();

    try {
      await apiPostVoid(
        '/posts/reports',
        {
          details,
          reason,
          targetId,
          targetType,
        },
        'Failed to submit report',
      );

      if (targetType === 'post') {
        setPosts((current) =>
          current.filter((post) => String(post.id) !== targetId),
        );
      }

      if (targetType === 'comment') {
        setPosts((current) =>
          current.map((post) => ({
            ...post,
            commentItems: (post.commentItems ?? []).filter(
              (comment) => comment.id !== targetId,
            ),
          })),
        );
      }
    } catch (error) {
      showError('Report could not be submitted. Please try again.', error);
    }
  };

  const blockUser = async (userId: string) => {
    if (!userId) return;
    clearError();

    try {
      await apiPostVoid(
        `/users/${userId}/block`,
        undefined,
        'Failed to block user',
      );

      removeUserFromLocalState(userId);
    } catch (error) {
      showError('User could not be blocked. Please try again.', error);
    }
  };

  const muteUser = async (userId: string) => {
    if (!userId) return;
    clearError();

    try {
      await apiPostVoid(
        `/users/${userId}/mute`,
        undefined,
        'Failed to mute user',
      );

      removeUserFromLocalState(userId);
    } catch (error) {
      showError('User could not be muted. Please try again.', error);
    }
  };

  return {
    blockUser,
    hidePost,
    muteUser,
    reportContent,
  };
}
