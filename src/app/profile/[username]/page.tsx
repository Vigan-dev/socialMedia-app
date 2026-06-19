import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicPostCard } from '@/components/public/PublicPostCard';
import { UserAvatar } from '@/components/UserAvatar';
import {
  getPublicPostsByUsername,
  getPublicProfile,
} from '@/lib/publicApi';
import type { PublicProfile } from '@/lib/apiSchemas';
import type { Post } from '@/types/feed';

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  let profile: PublicProfile | null;
  let posts: Post[] | null;

  try {
    [profile, posts] = await Promise.all([
      getPublicProfile(decodedUsername),
      getPublicPostsByUsername(decodedUsername),
    ]);
  } catch {
    notFound();
  }

  if (!profile || !posts) {
    notFound();
  }

  return (
    <main className="app-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-400 transition hover:text-slate-100"
          >
            Versatile
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/[0.1] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
          >
            Sign in
          </Link>
        </header>

        <section className="glass-panel overflow-hidden rounded-2xl">
          <div className="h-28 bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-500" />
          <div className="p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <div className="-mt-14">
                  <UserAvatar
                    avatarUrl={profile.avatarUrl}
                    username={profile.name}
                    size="h-24 w-24"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold text-white">
                    {profile.name}
                  </h1>
                  <p className="truncate text-sm text-slate-400">
                    {profile.handle}
                  </p>
                  <p className="mt-2 inline-flex rounded-full border border-white/[0.08] px-2.5 py-1 text-xs capitalize text-slate-300">
                    {profile.status ?? 'offline'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-80">
                {[
                  ['Posts', posts.length],
                  ['Followers', profile.followersCount],
                  ['Following', profile.followingCount],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-3 text-center"
                  >
                    <p className="text-lg font-bold text-white">{value}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">
              {profile.bio || 'No bio yet.'}
            </p>
          </div>
        </section>

        <section className="glass-panel overflow-hidden rounded-2xl">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-200">Posts</h2>
          </div>

          {posts.length > 0 ? (
            posts.map((post) => <PublicPostCard key={post.id} post={post} />)
          ) : (
            <p className="p-5 text-sm text-slate-500">
              This profile has not published any posts yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
