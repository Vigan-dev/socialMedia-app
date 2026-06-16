'use client';

import { useState } from 'react';
import { HighlightedText } from '@/components/HighlightedText';
import { AppIcon } from '@/components/ui/AppIcon';
import type { Post, ReportTargetType } from '@/types/feed';

type ReportTarget = {
  id: string;
  label: string;
  type: ReportTargetType;
};

type PostCommentsProps = {
  onAddComment: (postId: Post['id'], content: string) => void;
  onAddReply: (postId: Post['id'], commentId: string, content: string) => void;
  onToggleCommentLike: (postId: Post['id'], commentId: string) => void;
  onToggleReplyLike: (
    postId: Post['id'],
    commentId: string,
    replyId: string,
  ) => void;
  post: Post;
  setReportTarget: (target: ReportTarget) => void;
};

export function PostComments({
  onAddComment,
  onAddReply,
  onToggleCommentLike,
  onToggleReplyLike,
  post,
  setReportTarget,
}: PostCommentsProps) {
  const [commentInput, setCommentInput] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const submitComment = () => {
    const content = commentInput.trim();
    if (!content) return;

    onAddComment(post.id, content);
    setCommentInput('');
  };

  const submitReply = (commentId: string) => {
    const content = replyInputs[commentId]?.trim();
    if (!content) return;

    onAddReply(post.id, commentId, content);
    setReplyInputs((current) => ({ ...current, [commentId]: '' }));
    setExpandedReplies((current) => ({ ...current, [commentId]: true }));
  };

  return (
    <div className="comment-drop mt-4 space-y-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      {(post.commentItems ?? []).length > 0 && (
        <div className="space-y-2">
          {(post.commentItems ?? []).map((comment) => (
            <div key={comment.id} className="rounded-lg bg-[#060911]/60 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    {comment.user}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    <HighlightedText text={comment.content} />
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleCommentLike(post.id, comment.id)}
                  className={`shrink-0 text-xs font-semibold transition ${
                    comment.isLiked
                      ? 'text-rose-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <AppIcon
                      name="heart"
                      className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-current' : ''}`}
                    />
                    {comment.isLiked ? 'Liked' : 'Like'} {comment.likes}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReportTarget({
                      id: comment.id,
                      label: 'comment',
                      type: 'comment',
                    })
                  }
                  className="shrink-0 text-xs font-semibold text-amber-300/80 transition hover:text-amber-200"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <AppIcon name="flag" className="h-3.5 w-3.5" />
                    Report
                  </span>
                </button>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedReplies((current) => ({
                      ...current,
                      [comment.id]: !current[comment.id],
                    }))
                  }
                  className="font-semibold transition hover:text-slate-300"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <AppIcon name="reply" className="h-3.5 w-3.5" />
                    {(comment.replies ?? []).length > 0
                      ? expandedReplies[comment.id]
                        ? 'Hide replies'
                        : `Show ${(comment.replies ?? []).length} replies`
                      : 'Reply'}
                  </span>
                </button>
              </div>

              {expandedReplies[comment.id] && (
                <div className="mt-3 space-y-2 border-l border-white/[0.08] pl-3">
                  {(comment.replies ?? []).map((reply) => (
                    <div key={reply.id} className="rounded-lg bg-white/[0.03] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-300">
                            {reply.user}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            <HighlightedText text={reply.content} />
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onToggleReplyLike(post.id, comment.id, reply.id)
                          }
                          className={`shrink-0 text-xs font-semibold transition ${
                            reply.isLiked
                              ? 'text-rose-400'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <AppIcon
                              name="heart"
                              className={`h-3.5 w-3.5 ${reply.isLiked ? 'fill-current' : ''}`}
                            />
                            {reply.isLiked ? 'Liked' : 'Like'} {reply.likes}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      value={replyInputs[comment.id] ?? ''}
                      onChange={(event) =>
                        setReplyInputs((current) => ({
                          ...current,
                          [comment.id]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          submitReply(comment.id);
                        }
                      }}
                      placeholder="Write a reply..."
                      className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#051223] px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => submitReply(comment.id)}
                      disabled={!replyInputs[comment.id]?.trim()}
                      className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <AppIcon name="reply" className="h-3.5 w-3.5" />
                        Reply
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={commentInput}
          onChange={(event) => setCommentInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submitComment();
            }
          }}
          placeholder="Write a comment..."
          className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#051223] px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={submitComment}
          disabled={!commentInput.trim()}
          className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-1.5">
            <AppIcon name="paperPlane" className="h-3.5 w-3.5" />
            Send
          </span>
        </button>
      </div>
    </div>
  );
}
