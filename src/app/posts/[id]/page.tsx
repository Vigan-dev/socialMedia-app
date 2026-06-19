import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicPostCard } from '@/components/public/PublicPostCard';
import { getPublicPost } from '@/lib/publicApi';
import type { Post } from '@/types/feed';

type PublicPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function PublicPostPage({ params }: PublicPostPageProps) {
  const { id } = await params;

  let post: Post | null;

  try {
    post = await getPublicPost(id);
  } catch {
    notFound();
  }

  if (!post) {
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
            href={`/profile/${encodeURIComponent(post.user)}`}
            className="rounded-lg border border-white/[0.1] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
          >
            View profile
          </Link>
        </header>

        <section className="glass-panel overflow-hidden rounded-2xl">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h1 className="text-sm font-semibold text-slate-200">
              Public post
            </h1>
          </div>
          <PublicPostCard post={post} />
        </section>
      </div>
    </main>
  );
}
