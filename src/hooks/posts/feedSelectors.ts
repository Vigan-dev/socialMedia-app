import type { Post, TrendingItemData } from '@/types/feed';
import { scoreRelativeTime, scoreTextMatch } from './postUtils';

export function selectFilteredPosts(posts: Post[], searchQuery: string): Post[] {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return posts;

  return posts
    .map((post) => {
      const textScore =
        scoreTextMatch(post.user, query, 2) +
        scoreTextMatch(post.handle, query, 1.5) +
        scoreTextMatch(post.content, query, 3);
      const engagementScore =
        Math.log10(post.likes + 1) * 8 +
        Math.log10(post.comments + 1) * 6 +
        (post.isLiked ? 4 : 0) +
        (post.isFollowing ? 8 : 0);
      const recencyScore = scoreRelativeTime(post.time);
      const score = textScore + engagementScore + recencyScore;

      return { post, score };
    })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.likes + b.post.comments - (a.post.likes + a.post.comments),
    )
    .map((item) => item.post);
}

export function selectTrendingItems(posts: Post[]): TrendingItemData[] {
  const topicCounts = posts.reduce<Map<string, number>>((counts, post) => {
    const topic = post.user.trim();
    if (!topic) return counts;

    counts.set(topic, (counts.get(topic) ?? 0) + 1);
    return counts;
  }, new Map());

  return Array.from(topicCounts.entries())
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([topic, count]) => ({
      id: topic,
      category: 'Active author',
      topic,
      count: `${count} ${count === 1 ? 'post' : 'posts'}`,
    }));
}
