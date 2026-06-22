'use client';

import { HighlightedText } from '@/components/HighlightedText';
import type { Post } from '@/types/feed';

type PostSearchResultsSectionProps = {
  posts: Post[];
};

export function PostSearchResultsSection({
  posts,
}: PostSearchResultsSectionProps) {
  if (posts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="border-b border-white/[0.05] pb-2 pl-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
        Content Threads
      </h3>

      <div className="min-w-0 space-y-2">
        {posts.slice(0, 3).map((post) => (
          <div
            key={post.id}
            className="interactive-surface min-w-0 rounded-2xl border border-white/[0.055] bg-white/[0.02] p-3"
          >
            <p className="mb-1 text-[10px] font-medium text-slate-400">
              {post.user}
            </p>
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-300">
              <HighlightedText text={post.content} />
            </p>
          </div>
        ))}
      </div>

      {posts.length > 3 && (
        <p className="pt-2 text-center text-[10px] text-slate-500">
          View all {posts.length} matches
        </p>
      )}
    </div>
  );
}
