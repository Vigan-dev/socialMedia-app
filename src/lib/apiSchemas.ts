import type { MessageItem, MessageThread } from '@/components/sections/MessagesSection';
import type { NotificationItem } from '@/components/sections/NotificationsSection';
import type { NetworkUser, Post, PostComment, PostCommentReply } from '@/types/feed';

export type UserStatus = 'available' | 'away' | 'busy';
export type MessagePrivacy = 'everyone' | 'following' | 'none';

export type AuthProfile = {
  bio: string;
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  notificationSettings: NotificationSettings;
  privacy: {
    allowMessagesFrom: MessagePrivacy;
    allowMentionsFrom: MessagePrivacy;
  };
  showOnlineStatus: boolean;
  status: UserStatus;
};

export type NotificationSettings = {
  comments: boolean;
  follows: boolean;
  likes: boolean;
  mentions: boolean;
  messages: boolean;
};

export type FeedPage = {
  hasMore: boolean;
  items: Post[];
  nextCursor: string | null;
};

export type SupportChatResponse = {
  sessionId: string;
  reply: string;
};

export type ChatSession = {
  _id: string;
  firstMessage: string;
  lastMessageAt: string;
};

export type SupportHistoryItem = {
  _id: string;
  userMessage: string;
  assistantMessage: string;
};

export type AdminMetrics = {
  openReports: number;
  suspendedUsers: number;
  totalPosts: number;
  totalReports: number;
  totalUsers: number;
};

export type AdminUser = {
  email: string;
  id: string;
  isSuspended: boolean;
  role: UserRole;
  suspensionReason: string;
  username: string;
};

export type AdminReport = {
  details: string;
  id: string;
  reason: string;
  reporter: { email: string; username: string } | null;
  status: ReportStatus;
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
};

export type ReportStatusUpdate = {
  id: string;
  status: ReportStatus;
};

export type AuthOkResponse = {
  ok: boolean;
};

export type PasswordResetRequestResponse = {
  message: string;
  resetToken?: string;
};

export type MessageResponse = {
  message: string;
};

const userStatuses = ['available', 'away', 'busy'] as const;
const userRoles = ['admin', 'moderator', 'user'] as const;
const messagePrivacyValues = ['everyone', 'following', 'none'] as const;
const notificationTypes = ['like', 'comment', 'follow', 'mention', 'message'] as const;
const reportTargetTypes = ['post', 'comment', 'user'] as const;
const reportStatuses = ['open', 'reviewed', 'dismissed', 'actioned'] as const;

export type UserRole = (typeof userRoles)[number];
export type ReportStatus = (typeof reportStatuses)[number];

function objectRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function stringValue(value: unknown, label: string) {
  if (typeof value !== 'string') throw new Error(`${label} must be a string.`);
  return value;
}

function nonEmptyString(value: unknown, label: string) {
  const text = stringValue(value, label);

  if (!text.trim()) throw new Error(`${label} must not be empty.`);
  return text;
}

function finiteNumber(value: unknown, label: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a number.`);
  }

  return value;
}

function nonNegativeInteger(value: unknown, label: string) {
  const number = finiteNumber(value, label);

  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }

  return number;
}

function booleanValue(value: unknown, label: string) {
  if (typeof value !== 'boolean') throw new Error(`${label} must be a boolean.`);
  return value;
}

function nullableString(value: unknown, label: string) {
  if (value === null) return null;
  return stringValue(value, label);
}

function optionalString(value: unknown, label: string) {
  if (value === undefined) return undefined;
  return stringValue(value, label);
}

function optionalNonEmptyString(value: unknown, label: string) {
  if (value === undefined) return undefined;
  return nonEmptyString(value, label);
}

function optionalNullableString(value: unknown, label: string) {
  if (value === undefined || value === null) return value;
  return stringValue(value, label);
}

function optionalBoolean(value: unknown, label: string) {
  if (value === undefined) return undefined;
  return booleanValue(value, label);
}

function literalUnion<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  label: string,
): T[number] {
  if (typeof value !== 'string' || !allowed.includes(value as T[number])) {
    throw new Error(`${label} has an unsupported value.`);
  }

  return value;
}

function optionalLiteralUnion<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  label: string,
): T[number] | undefined {
  if (value === undefined) return undefined;
  return literalUnion(value, allowed, label);
}

function optionalArray<T>(
  value: unknown,
  label: string,
  decodeItem: (item: unknown) => T,
) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);

  return value.map((item, index) => decodeWithContext(item, `${label}[${index}]`, decodeItem));
}

function arrayValue<T>(
  value: unknown,
  label: string,
  decodeItem: (item: unknown) => T,
) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);

  return value.map((item, index) => decodeWithContext(item, `${label}[${index}]`, decodeItem));
}

export function decodeArrayOf<T>(
  label: string,
  decodeItem: (item: unknown) => T,
) {
  return (value: unknown) => arrayValue(value, label, decodeItem);
}

function decodeWithContext<T>(
  item: unknown,
  label: string,
  decodeItem: (item: unknown) => T,
) {
  try {
    return decodeItem(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid item.';
    throw new Error(`${label}: ${message}`);
  }
}

export function decodePostReply(input: unknown): PostCommentReply {
  const data = objectRecord(input, 'Post reply');

  return {
    id: nonEmptyString(data.id, 'Post reply id'),
    user: stringValue(data.user, 'Post reply user'),
    content: stringValue(data.content, 'Post reply content'),
    time: stringValue(data.time, 'Post reply time'),
    likes: nonNegativeInteger(data.likes, 'Post reply likes'),
    isLiked: optionalBoolean(data.isLiked, 'Post reply isLiked'),
  };
}

export function decodePostComment(input: unknown): PostComment {
  const data = objectRecord(input, 'Post comment');

  return {
    id: nonEmptyString(data.id, 'Post comment id'),
    user: stringValue(data.user, 'Post comment user'),
    content: stringValue(data.content, 'Post comment content'),
    time: stringValue(data.time, 'Post comment time'),
    likes: nonNegativeInteger(data.likes, 'Post comment likes'),
    isLiked: optionalBoolean(data.isLiked, 'Post comment isLiked'),
    replies: optionalArray(data.replies, 'Post comment replies', decodePostReply),
  };
}

export function decodePost(input: unknown): Post {
  const data = objectRecord(input, 'Post');

  return {
    id: nonEmptyString(data.id, 'Post id'),
    authorId: optionalNonEmptyString(data.authorId, 'Post authorId'),
    user: stringValue(data.user, 'Post user'),
    handle: stringValue(data.handle, 'Post handle'),
    avatarBg: stringValue(data.avatarBg, 'Post avatarBg'),
    avatarText: stringValue(data.avatarText, 'Post avatarText'),
    avatarUrl: optionalNullableString(data.avatarUrl, 'Post avatarUrl'),
    content: stringValue(data.content, 'Post content'),
    time: stringValue(data.time, 'Post time'),
    likes: nonNegativeInteger(data.likes, 'Post likes'),
    comments: nonNegativeInteger(data.comments, 'Post comments'),
    commentItems: optionalArray(data.commentItems, 'Post commentItems', decodePostComment),
    isLiked: optionalBoolean(data.isLiked, 'Post isLiked'),
    isFollowing: optionalBoolean(data.isFollowing, 'Post isFollowing'),
    isOwnPost: optionalBoolean(data.isOwnPost, 'Post isOwnPost'),
  };
}

export const decodePosts = decodeArrayOf('Posts', decodePost);

export function decodeFeedPage(input: unknown): FeedPage {
  if (Array.isArray(input)) {
    return {
      hasMore: false,
      items: arrayValue(input, 'Feed page legacy items', decodePost),
      nextCursor: null,
    };
  }

  const data = objectRecord(input, 'Feed page');

  return {
    hasMore: booleanValue(data.hasMore, 'Feed page hasMore'),
    items: arrayValue(data.items, 'Feed page items', decodePost),
    nextCursor: nullableString(data.nextCursor, 'Feed page nextCursor'),
  };
}

export function decodeNetworkUser(input: unknown): NetworkUser {
  const data = objectRecord(input, 'Network user');

  return {
    id: nonEmptyString(data.id, 'Network user id'),
    handle: stringValue(data.handle, 'Network user handle'),
    name: stringValue(data.name, 'Network user name'),
    role: literalUnion(data.role, userRoles, 'Network user role'),
    avatarUrl: optionalNullableString(data.avatarUrl, 'Network user avatarUrl'),
    status:
      data.status === null
        ? null
        : optionalLiteralUnion(data.status, userStatuses, 'Network user status'),
    followersCount: nonNegativeInteger(data.followersCount, 'Network user followersCount'),
    followingCount: nonNegativeInteger(data.followingCount, 'Network user followingCount'),
    isFollowing: booleanValue(data.isFollowing, 'Network user isFollowing'),
  };
}

export const decodeNetworkUsers = decodeArrayOf('Network users', decodeNetworkUser);

export function decodeNotification(input: unknown): NotificationItem {
  const data = objectRecord(input, 'Notification');

  return {
    id: nonEmptyString(data.id, 'Notification id'),
    actorAvatarUrl: optionalNullableString(data.actorAvatarUrl, 'Notification actorAvatarUrl'),
    actorId: data.actorId === null ? null : optionalNonEmptyString(data.actorId, 'Notification actorId'),
    content: optionalString(data.content, 'Notification content'),
    meta: stringValue(data.meta, 'Notification meta'),
    postId: data.postId === null ? null : optionalNonEmptyString(data.postId, 'Notification postId'),
    read: booleanValue(data.read, 'Notification read'),
    time: stringValue(data.time, 'Notification time'),
    type: literalUnion(data.type, notificationTypes, 'Notification type'),
    user: stringValue(data.user, 'Notification user'),
  };
}

export const decodeNotifications = decodeArrayOf('Notifications', decodeNotification);

export function decodeMessageThread(input: unknown): MessageThread {
  const data = objectRecord(input, 'Message thread');
  const participant = objectRecord(data.participant, 'Message thread participant');

  return {
    handle: stringValue(data.handle, 'Message thread handle'),
    id: nonEmptyString(data.id, 'Message thread id'),
    lastMessage: stringValue(data.lastMessage, 'Message thread lastMessage'),
    lastMessageAt: nullableString(data.lastMessageAt, 'Message thread lastMessageAt'),
    participant: {
      avatarUrl: nullableString(participant.avatarUrl, 'Message thread participant avatarUrl'),
      id: nonEmptyString(participant.id, 'Message thread participant id'),
      name: stringValue(participant.name, 'Message thread participant name'),
      status: literalUnion(participant.status, userStatuses, 'Message thread participant status'),
    },
    typingUsers: optionalArray(data.typingUsers, 'Message thread typingUsers', (item) =>
      stringValue(item, 'Message thread typing user'),
    ),
    unreadCount: nonNegativeInteger(data.unreadCount, 'Message thread unreadCount'),
    user: stringValue(data.user, 'Message thread user'),
  };
}

export const decodeMessageThreads = decodeArrayOf('Message threads', decodeMessageThread);

export function decodeMessageItem(input: unknown): MessageItem {
  const data = objectRecord(input, 'Message');
  const sender = objectRecord(data.sender, 'Message sender');

  return {
    delivered: booleanValue(data.delivered, 'Message delivered'),
    id: nonEmptyString(data.id, 'Message id'),
    isOwn: booleanValue(data.isOwn, 'Message isOwn'),
    read: booleanValue(data.read, 'Message read'),
    sender: {
      avatarUrl: nullableString(sender.avatarUrl, 'Message sender avatarUrl'),
      id: nonEmptyString(sender.id, 'Message sender id'),
      name: stringValue(sender.name, 'Message sender name'),
    },
    text: stringValue(data.text, 'Message text'),
    time: stringValue(data.time, 'Message time'),
  };
}

export const decodeMessageItems = decodeArrayOf('Messages', decodeMessageItem);

export function decodeNotificationSettings(input: unknown): NotificationSettings {
  const data = objectRecord(input, 'Notification settings');

  return {
    comments: booleanValue(data.comments, 'Notification comments'),
    follows: booleanValue(data.follows, 'Notification follows'),
    likes: booleanValue(data.likes, 'Notification likes'),
    mentions: booleanValue(data.mentions, 'Notification mentions'),
    messages: booleanValue(data.messages, 'Notification messages'),
  };
}

export function decodeAuthProfile(input: unknown): AuthProfile {
  const data = objectRecord(input, 'Auth profile');
  const privacy = objectRecord(data.privacy, 'Auth privacy');

  return {
    bio: stringValue(data.bio, 'Auth bio'),
    id: nonEmptyString(data.id, 'Auth id'),
    username: stringValue(data.username, 'Auth username'),
    email: stringValue(data.email, 'Auth email'),
    role: literalUnion(data.role, userRoles, 'Auth role'),
    avatarUrl: nullableString(data.avatarUrl, 'Auth avatarUrl'),
    followersCount: nonNegativeInteger(data.followersCount, 'Auth followersCount'),
    followingCount: nonNegativeInteger(data.followingCount, 'Auth followingCount'),
    notificationSettings: decodeNotificationSettings(data.notificationSettings),
    privacy: {
      allowMessagesFrom: literalUnion(
        privacy.allowMessagesFrom,
        messagePrivacyValues,
        'Auth allowMessagesFrom',
      ),
      allowMentionsFrom: literalUnion(
        privacy.allowMentionsFrom,
        messagePrivacyValues,
        'Auth allowMentionsFrom',
      ),
    },
    showOnlineStatus: booleanValue(data.showOnlineStatus, 'Auth showOnlineStatus'),
    status: literalUnion(data.status, userStatuses, 'Auth status'),
  };
}

export function decodeRefreshSession(input: unknown) {
  const data = objectRecord(input, 'Refresh session');

  return {
    user: decodeAuthProfile(data.user),
  };
}

export function decodeAuthOk(input: unknown): AuthOkResponse {
  const data = objectRecord(input, 'Auth response');

  return {
    ok: booleanValue(data.ok, 'Auth ok'),
  };
}

export function decodePasswordResetRequest(input: unknown): PasswordResetRequestResponse {
  const data = objectRecord(input, 'Password reset response');

  return {
    message: stringValue(data.message, 'Password reset message'),
    resetToken: optionalString(data.resetToken, 'Password reset token'),
  };
}

export function decodeMessageResponse(input: unknown): MessageResponse {
  const data = objectRecord(input, 'Message response');

  return {
    message: stringValue(data.message, 'Message response message'),
  };
}

export function decodeSupportChatResponse(input: unknown): SupportChatResponse {
  const data = objectRecord(input, 'Support chat response');

  return {
    sessionId: nonEmptyString(data.sessionId, 'Support chat sessionId'),
    reply: stringValue(data.reply, 'Support chat reply'),
  };
}

export function decodeChatSession(input: unknown): ChatSession {
  const data = objectRecord(input, 'Support chat session');

  return {
    _id: nonEmptyString(data._id, 'Support chat session id'),
    firstMessage: stringValue(data.firstMessage, 'Support chat firstMessage'),
    lastMessageAt: stringValue(data.lastMessageAt, 'Support chat lastMessageAt'),
  };
}

export const decodeChatSessions = decodeArrayOf('Support chat sessions', decodeChatSession);

export function decodeSupportHistoryItem(input: unknown): SupportHistoryItem {
  const data = objectRecord(input, 'Support history item');

  return {
    _id: nonEmptyString(data._id, 'Support history id'),
    userMessage: stringValue(data.userMessage, 'Support history userMessage'),
    assistantMessage: stringValue(data.assistantMessage, 'Support history assistantMessage'),
  };
}

export const decodeSupportHistory = decodeArrayOf('Support history', decodeSupportHistoryItem);

export function decodeAdminMetrics(input: unknown): AdminMetrics {
  const data = objectRecord(input, 'Admin metrics');

  return {
    openReports: nonNegativeInteger(data.openReports, 'Admin openReports'),
    suspendedUsers: nonNegativeInteger(data.suspendedUsers, 'Admin suspendedUsers'),
    totalPosts: nonNegativeInteger(data.totalPosts, 'Admin totalPosts'),
    totalReports: nonNegativeInteger(data.totalReports, 'Admin totalReports'),
    totalUsers: nonNegativeInteger(data.totalUsers, 'Admin totalUsers'),
  };
}

export function decodeAdminUser(input: unknown): AdminUser {
  const data = objectRecord(input, 'Admin user');

  return {
    email: stringValue(data.email, 'Admin user email'),
    id: nonEmptyString(data.id, 'Admin user id'),
    isSuspended: booleanValue(data.isSuspended, 'Admin user isSuspended'),
    role: literalUnion(data.role, userRoles, 'Admin user role'),
    suspensionReason: stringValue(data.suspensionReason, 'Admin user suspensionReason'),
    username: stringValue(data.username, 'Admin user username'),
  };
}

export const decodeAdminUsers = decodeArrayOf('Admin users', decodeAdminUser);

export function decodeAdminReport(input: unknown): AdminReport {
  const data = objectRecord(input, 'Admin report');
  const reporter =
    data.reporter === null ? null : objectRecord(data.reporter, 'Admin report reporter');

  return {
    details: stringValue(data.details, 'Admin report details'),
    id: nonEmptyString(data.id, 'Admin report id'),
    reason: stringValue(data.reason, 'Admin report reason'),
    reporter: reporter
      ? {
          email: stringValue(reporter.email, 'Admin report reporter email'),
          username: stringValue(reporter.username, 'Admin report reporter username'),
        }
      : null,
    status: literalUnion(data.status, reportStatuses, 'Admin report status'),
    targetId: nonEmptyString(data.targetId, 'Admin report targetId'),
    targetType: literalUnion(data.targetType, reportTargetTypes, 'Admin report targetType'),
  };
}

export const decodeAdminReports = decodeArrayOf('Admin reports', decodeAdminReport);

export function decodeReportStatusUpdate(input: unknown): ReportStatusUpdate {
  const data = objectRecord(input, 'Report status update');

  return {
    id: nonEmptyString(data.id, 'Report status update id'),
    status: literalUnion(data.status, reportStatuses, 'Report status update status'),
  };
}

export function decodeAvailability(input: unknown) {
  const data = objectRecord(input, 'Availability response');

  return {
    available: booleanValue(data.available, 'Availability available'),
  };
}
