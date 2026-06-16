'use client';

import { Card } from '@/components/ui/Card';
import type { Post } from '@/types/feed';
import { ProfilePostCard } from './ProfilePostCard';

type ProfilePostsSectionProps = {
  onDeletePost: (postId: Post['id']) => void;
  onEditPost: (postId: Post['id'], content: string) => void;
  posts: Post[];
};

export function ProfilePostsSection({
  onDeletePost,
  onEditPost,
  posts,
}: ProfilePostsSectionProps) {
  return (
    <Card className="space-y-5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Posts</h2>
          <p className="mt-1 text-sm text-slate-400">
            Public posts from this profile.
          </p>
        </div>
        <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
          {posts.length}
        </span>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <ProfilePostCard
              key={post.id}
              post={post}
              onDeletePost={onDeletePost}
              onEditPost={onEditPost}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
          <p className="text-sm font-medium text-slate-300">No posts yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Posts you publish will appear on your public profile.
          </p>
        </div>
      )}
    </Card>
  );
}
