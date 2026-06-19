'use client';

import { useEffect, useState } from 'react';
import { HighlightedText } from '@/components/HighlightedText';
import { PostMediaGrid } from '@/components/posts/PostMediaGrid';
import { ConfirmActionModal } from '@/components/ui/ActionModals';
import { AppIcon } from '@/components/ui/AppIcon';
import { sharePost, type SharePostResult } from '@/lib/postSharing';
import type { Post } from '@/types/feed';

type ProfilePostCardProps = {
  onDeletePost: (postId: Post['id']) => void;
  onEditPost: (postId: Post['id'], content: string) => void;
  post: Post;
};

export function ProfilePostCard({
  post,
  onDeletePost,
  onEditPost,
}: ProfilePostCardProps) {
  const [draftContent, setDraftContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<SharePostResult | 'idle'>(
    'idle',
  );

  useEffect(() => {
    if (shareStatus === 'idle' || shareStatus === 'cancelled') return;

    const timeoutId = window.setTimeout(() => {
      setShareStatus('idle');
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [shareStatus]);

  const submitEdit = () => {
    const content = draftContent.trim();
    if (!content) return;

    onEditPost(post.id, content);
    setIsEditing(false);
  };

  const handleSharePost = async () => {
    const result = await sharePost({
      content: post.content,
      postId: String(post.id),
      user: post.user,
    });

    setShareStatus(result);
  };

  return (
    <>
      <article
        id={`post-${post.id}`}
        className="scroll-mt-24 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-300">{post.handle}</p>
            <p className="mt-1 text-xs text-slate-500">{post.time}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDraftContent(post.content);
                setIsEditing((current) => !current);
              }}
              className="rounded-full border border-white/[0.08] px-3 py-1 text-[11px] font-semibold text-slate-400 transition hover:text-slate-200"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="rounded-full border border-rose-500/20 px-3 py-1 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/10"
            >
              Delete
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-3 space-y-3">
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
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
            <HighlightedText text={post.content} />
          </p>
        )}

        <PostMediaGrid mediaUrls={post.mediaUrls} />

        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <span>{post.likes} likes</span>
          <span>{post.comments} comments</span>
          <button
            type="button"
            onClick={handleSharePost}
            className="ml-auto inline-flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-slate-300"
          >
            <AppIcon name="share" className="h-3.5 w-3.5" />
            {shareStatus === 'copied'
              ? 'Copied'
              : shareStatus === 'shared'
                ? 'Shared'
                : shareStatus === 'failed'
                  ? 'Copy failed'
                : 'Share'}
          </button>
        </div>
      </article>

      {isDeleteOpen && (
        <ConfirmActionModal
          confirmLabel="Delete post"
          description="This post will be permanently removed from your profile and feed. This cannot be undone."
          title="Delete this post?"
          onCancel={() => setIsDeleteOpen(false)}
          onConfirm={() => {
            onDeletePost(post.id);
            setIsDeleteOpen(false);
          }}
        />
      )}
    </>
  );
}
