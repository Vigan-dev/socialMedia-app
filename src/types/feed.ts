export interface PostCommentReply {
  id: string;
  user: string;
  content: string;
  time: string;
  likes: number;
  isLiked?: boolean;
}

export interface PostComment {
  id: string;
  user: string;
  content: string;
  time: string;
  likes: number;
  isLiked?: boolean;
  replies?: PostCommentReply[];
}

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate'
  | 'self_harm'
  | 'sexual_content'
  | 'violence'
  | 'other';

export type ReportTargetType = 'post' | 'comment' | 'user';

export interface Post {
  id: string | number;
  authorId?: string;
  user: string;
  handle: string;
  avatarBg: string;
  avatarText: string;
  avatarUrl?: string | null;
  content: string;
  time: string;
  likes: number;
  mediaUrls?: string[];
  comments: number;
  commentItems?: PostComment[];
  isLiked?: boolean;
  isFollowing?: boolean;
  isOwnPost?: boolean;
}

export interface TrendingItemData {
  id: string;
  category: string;
  topic: string;
  count: string;
}

export interface NetworkUser {
  id: string;
  handle: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  status?: 'available' | 'away' | 'busy' | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}
