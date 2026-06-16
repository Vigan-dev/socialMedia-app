import type { NetworkUser, Post, ReportReason } from '@/types/feed';

export type ThemeMode = 'dark' | 'light';
export type MessagePrivacy = 'everyone' | 'following' | 'none';

export type NotificationSettings = {
  comments: boolean;
  follows: boolean;
  likes: boolean;
  mentions: boolean;
  messages: boolean;
};

export type ProfileFieldErrors = {
  avatar: string;
  bio: string;
  username: string;
};

export type ProfileSocialTab = 'followers' | 'following';

export type ProfilePrivacySettings = {
  allowMessagesFrom: MessagePrivacy;
  allowMentionsFrom: MessagePrivacy;
  showOnlineStatus: boolean;
};

export type ProfileData = {
  bio: string;
  notificationSettings: NotificationSettings;
  privacy: {
    allowMessagesFrom: MessagePrivacy;
    allowMentionsFrom: MessagePrivacy;
  };
  showOnlineStatus: boolean;
  status?: 'available' | 'away' | 'busy';
} | null;

export type ProfileUserActions = {
  onBlockUser: (userId: string) => void;
  onMuteUser: (userId: string) => void;
  onReportUser: (
    targetType: 'user',
    targetId: string,
    reason: ReportReason,
    details?: string,
  ) => void;
  onStartConversation: (userId: string) => void;
  onToggleFollow: (userId: string) => void;
};

export type ProfileNetworkData = {
  followers: NetworkUser[];
  followersCount: number;
  following: NetworkUser[];
  followingCount: number;
};

export type ProfilePostsData = {
  posts: Post[];
  postsCount: number;
};
