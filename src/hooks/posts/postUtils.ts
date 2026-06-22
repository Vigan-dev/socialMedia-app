import type { Post } from '@/types/feed';

export type FeedMode = 'latest' | 'trending' | 'following';

export function accentGradient(accentColor: string) {
  if (accentColor === 'emerald') return 'from-emerald-600 to-teal-500';
  if (accentColor === 'rose') return 'from-rose-600 to-pink-500';
  return 'from-indigo-600 to-violet-500';
}

export function formatPost(post: Post): Post {
  const createdAt = new Date(String(post.time));

  if (Number.isNaN(createdAt.getTime())) {
    return post;
  }

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  let time = 'Just now';
  if (diffDays > 0) time = `${diffDays}d ago`;
  else if (diffHours > 0) time = `${diffHours}h ago`;
  else if (diffMinutes > 0) time = `${diffMinutes}m ago`;

  return { ...post, time };
}

export function scoreTextMatch(
  value: string | undefined,
  query: string,
  weight = 1,
) {
  const normalized = value?.toLowerCase().trim() ?? '';
  if (!normalized) return 0;

  if (normalized === query) return 100 * weight;
  if (normalized.startsWith(query)) return 60 * weight;
  if (normalized.includes(query)) return 25 * weight;

  const queryTerms = query.split(/\s+/).filter(Boolean);
  const matchedTerms = queryTerms.filter((term) => normalized.includes(term));

  return matchedTerms.length * 10 * weight;
}

export function scoreRelativeTime(time: string | undefined) {
  if (!time) return 0;

  if (time === 'Just now') return 15;

  const match = time.match(/^(\d+)(m|h|d) ago$/);
  if (!match) return 0;

  const amount = Number(match[1]);
  const unit = match[2];

  if (unit === 'm') return Math.max(0, 15 - amount / 10);
  if (unit === 'h') return Math.max(0, 10 - amount / 3);
  if (unit === 'd') return Math.max(0, 6 - amount);

  return 0;
}
