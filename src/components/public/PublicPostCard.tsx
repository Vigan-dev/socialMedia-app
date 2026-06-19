import Link from 'next/link';
import { HighlightedText } from '@/components/HighlightedText';
import { UserAvatar } from '@/components/UserAvatar';
import { AppIcon } from '@/components/ui/AppIcon';
import type { Post } from '@/types/feed';

type PublicPostCardProps = {
  post: Post;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function PublicPostCard({ post }: PublicPostCardProps) {
  const profileHref = `/profile/${encodeURIComponent(post.user)}`;

  return (
    <article className="feed-card border-b border-white/[0.06] bg-[#07111f]/60 p-5">
      <div className="flex gap-4">
        <Link href={profileHref} className="shrink-0">
          <UserAvatar
            avatarUrl={post.avatarUrl ?? null}
            username={post.user}
            size="h-11 w-11"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <Link
              href={profileHref}
              className="truncate text-sm font-semibold text-slate-100 transition hover:text-cyan-300"
            >
              {post.user}
            </Link>
            <span className="truncate text-xs text-slate-500">
              {post.handle}
            </span>
            <span className="text-xs text-slate-700">-</span>
            <Link
              href={`/posts/${post.id}`}
              className="text-xs text-slate-500 transition hover:text-slate-300"
            >
              {formatDate(post.time)}
            </Link>
          </div>

          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
            <HighlightedText text={post.content} />
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <AppIcon name="heart" className="h-4 w-4" />
              {post.likes}
            </span>
            <span className="inline-flex items-center gap-2">
              <AppIcon name="chat" className="h-4 w-4" />
              {post.comments}
            </span>
            <span className="inline-flex items-center gap-2">
              <AppIcon name="share" className="h-4 w-4" />
              Public
            </span>
          </div>

          {(post.commentItems ?? []).length > 0 && (
            <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4">
              {post.commentItems?.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg bg-white/[0.035] p-3"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {comment.user}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {formatDate(comment.time)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-400">
                    <HighlightedText text={comment.content} />
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
