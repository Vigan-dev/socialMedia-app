'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ConfirmActionModal,
  ReportContentModal,
} from '@/components/ui/ActionModals';
import { PostComments } from '@/components/posts/PostComments';
import { AppIcon } from '@/components/ui/AppIcon';
import type { Post, ReportReason, ReportTargetType } from '@/types/feed';

interface PostCardProps {
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
  onToggleCommentLike: (postId: Post['id'], commentId: string) => void;
  onToggleFollow: (userId: string) => void;
  onToggleLike: (postId: Post['id']) => void;
  onToggleReplyLike: (
    postId: Post['id'],
    commentId: string,
    replyId: string,
  ) => void;
  post: Post;
}

export const PostCard = React.memo(function PostCard({
  onAddComment,
  onAddReply,
  onDeletePost,
  onEditPost,
  onHidePost,
  onBlockUser,
  onMuteUser,
  onReportContent,
  onToggleCommentLike,
  onToggleFollow,
  onToggleLike,
  onToggleReplyLike,
  post,
}: PostCardProps) {
  const [draftContent, setDraftContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    label: string;
    type: ReportTargetType;
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    | {
        description: string;
        label: string;
        onConfirm: () => void;
        title: string;
      }
    | null
  >(null);

  const initials = useMemo(() => {
    return post.user
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [post.user]);

  const liked = Boolean(post.isLiked);
  const canFollow = Boolean(post.authorId) && !post.isOwnPost;
  const canModerateAuthor = Boolean(post.authorId) && !post.isOwnPost;

  const submitEdit = () => {
    const content = draftContent.trim();
    if (!content || content === post.content) {
      setDraftContent(post.content);
      setIsEditing(false);
      return;
    }

    onEditPost(post.id, content);
    setIsEditing(false);
  };

  const deletePost = () => {
    setConfirmAction({
      description:
        'This post and its conversation will be removed from the feed. This cannot be undone.',
      label: 'Delete post',
      onConfirm: () => onDeletePost(post.id),
      title: 'Delete this post?',
    });
  };

  return (
    <>
    <article className="feed-card flex gap-4 border-b border-white/[0.05] bg-[#0c111d]/10 p-5 transition duration-200 hover:bg-[#0c111d]/40">
      {post.avatarUrl ? (
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/[0.1] shadow-sm">
          <Image
            src={post.avatarUrl}
            alt={`${post.user} avatar`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div
          className={`flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-tr ${post.avatarBg} text-xs font-bold text-white shadow-sm`}
        >
          {initials}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
            <span className="truncate text-sm font-semibold text-slate-200 transition hover:text-indigo-400">
              {post.user}
            </span>
            <span className="truncate text-xs text-slate-600">{post.handle}</span>
            <span className="text-xs text-slate-700">-</span>
            <span className="shrink-0 text-xs text-slate-500">{post.time}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
          {post.isOwnPost && (
            <>
              <button
                type="button"
                onClick={() => {
                  setDraftContent(post.content);
                  setIsEditing((current) => !current);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <AppIcon name="edit" className="h-3.5 w-3.5" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                type="button"
                onClick={deletePost}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 px-3 py-1 text-[11px] font-semibold text-rose-300 transition-colors hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <AppIcon name="trash" className="h-3.5 w-3.5" />
                Delete
              </button>
            </>
          )}

          {canFollow && (
            <button
              type="button"
              onClick={() => onToggleFollow(post.authorId!)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                post.isFollowing
                  ? 'border-white/[0.08] text-slate-400 hover:border-rose-500/30 hover:text-rose-300'
                  : 'border-indigo-400/40 bg-indigo-500/[0.08] text-indigo-200 hover:bg-indigo-500/[0.16]'
              }`}
            >
              <AppIcon name="userPlus" className="h-3.5 w-3.5" />
              {post.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {!post.isOwnPost && (
            <button
              type="button"
              onClick={() =>
                setReportTarget({
                  id: String(post.id),
                  label: 'post',
                  type: 'post',
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 px-3 py-1 text-[11px] font-semibold text-amber-200 transition-colors hover:bg-amber-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <AppIcon name="flag" className="h-3.5 w-3.5" />
              Report
            </button>
          )}
          </div>
        </div>

        {isEditing ? (
          <div className="mb-4 space-y-3">
            <textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              maxLength={500}
              className="min-h-24 w-full resize-none rounded-xl border border-white/[0.08] bg-[#051223] px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {draftContent.length}/500 characters
              </span>
              <button
                type="button"
                onClick={submitEdit}
                disabled={!draftContent.trim()}
                className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save edit
              </button>
            </div>
          </div>
        ) : (
          <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
            {post.content}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setShowComments((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 transition-colors hover:bg-white/[0.05] hover:text-slate-300"
          >
            <AppIcon name="chat" className="h-4 w-4" />
            <span>Comment</span>
            <span>{post.comments}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleLike(post.id)}
            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 transition-colors ${
              liked ? 'bg-rose-500/[0.08] text-rose-500' : 'hover:bg-white/[0.05] hover:text-slate-300'
            }`}
          >
            <AppIcon name="heart" className={liked ? 'fill-current' : ''} />
            <span>{liked ? 'Liked' : 'Like'}</span>
            <span className={liked ? 'text-rose-500/90' : ''}>{post.likes}</span>
          </button>

          <button
            type="button"
            onClick={() => onHidePost(post.id)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-slate-700 transition-colors hover:bg-white/[0.05] hover:text-slate-300"
          >
            <AppIcon name="eyeOff" className="h-4 w-4" />
            Hide
          </button>

          {canModerateAuthor && (
            <>
              <button
                type="button"
                onClick={() => onMuteUser(post.authorId!)}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors hover:bg-white/[0.05] hover:text-slate-300"
              >
                <AppIcon name="mute" className="h-4 w-4" />
                Mute
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    description: `You will stop seeing posts from ${post.user}, and they will be removed from your visible feed.`,
                    label: 'Block user',
                    onConfirm: () => onBlockUser(post.authorId!),
                    title: `Block ${post.user}?`,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-rose-400/80 transition-colors hover:bg-rose-500/[0.08] hover:text-rose-300"
              >
                <AppIcon name="block" className="h-4 w-4" />
                Block
              </button>
            </>
          )}
        </div>

        {showComments && (
          <PostComments
            post={post}
            onAddComment={onAddComment}
            onAddReply={onAddReply}
            onToggleCommentLike={onToggleCommentLike}
            onToggleReplyLike={onToggleReplyLike}
            setReportTarget={setReportTarget}
          />
        )}
      </div>
    </article>
    {reportTarget && (
      <ReportContentModal
        targetId={reportTarget.id}
        targetLabel={reportTarget.label}
        targetType={reportTarget.type}
        onCancel={() => setReportTarget(null)}
        onSubmit={(targetType, targetId, reason, details) => {
          onReportContent(targetType, targetId, reason, details);
          setReportTarget(null);
        }}
      />
    )}
    {confirmAction && (
      <ConfirmActionModal
        confirmLabel={confirmAction.label}
        description={confirmAction.description}
        intent={confirmAction.label.toLowerCase().includes('block') ? 'warning' : 'danger'}
        title={confirmAction.title}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          confirmAction.onConfirm();
          setConfirmAction(null);
        }}
      />
    )}
    </>
  );
});
