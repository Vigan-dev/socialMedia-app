'use client';

import React from 'react';
import { HighlightedText } from '@/components/HighlightedText';
import { UserAvatar } from '@/components/UserAvatar';

export interface NotificationItem {
  id: string;
  actorAvatarUrl?: string | null;
  actorId?: string | null;
  content?: string;
  meta: string;
  postId?: string | null;
  read: boolean;
  time: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message';
  user: string;
}

export type NotificationFilter =
  | 'all'
  | 'unread'
  | NotificationItem['type'];

interface NotificationsSectionProps {
  filter: NotificationFilter;
  isLoading: boolean;
  items: NotificationItem[];
  onFilterChange: (filter: NotificationFilter) => void;
  onMarkAllRead: () => void;
  totalCount: number;
  unreadCount: number;
}

function formatNotificationTime(value: string) {
  const createdAt = new Date(value);

  if (Number.isNaN(createdAt.getTime())) {
    return value;
  }

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return 'Just now';
}

function getTypeLabel(type: NotificationItem['type']) {
  if (type === 'like') return 'Like';
  if (type === 'comment') return 'Comment';
  if (type === 'follow') return 'Follow';
  if (type === 'message') return 'Message';
  return 'Mention';
}

export function NotificationsSection({
  filter,
  isLoading,
  items,
  onFilterChange,
  onMarkAllRead,
  totalCount,
  unreadCount,
}: NotificationsSectionProps) {
  const filterOptions: Array<{ id: NotificationFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'like', label: 'Likes' },
    { id: 'comment', label: 'Comments' },
    { id: 'follow', label: 'Follows' },
    { id: 'mention', label: 'Mentions' },
    { id: 'message', label: 'Messages' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-xl bg-white/[0.03]"
          />
        ))}
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-medium text-slate-400">No notifications yet</p>
        <p className="mt-1 text-xs text-slate-600">
          Likes, comments, follows, and mentions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-white/[0.05] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {unreadCount} unread
          </p>

          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="rounded-full border border-white/[0.08] px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark all read
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onFilterChange(option.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
                filter === option.id
                  ? 'border-indigo-400/70 bg-indigo-500/15 text-indigo-100'
                  : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 && (
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-slate-400">
            No notifications match this filter
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Switch filters to see other notification categories.
          </p>
        </div>
      )}

      <div className="divide-y divide-white/[0.03]">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex gap-4 p-5 transition hover:bg-white/[0.02] ${
              item.read ? 'bg-transparent' : 'bg-indigo-500/[0.04]'
            }`}
          >
            <UserAvatar
              avatarUrl={item.actorAvatarUrl ?? null}
              username={item.user}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {getTypeLabel(item.type)}
                </span>

                {!item.read && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </div>

              <p className="mt-2 text-sm text-slate-300">
                <span className="font-semibold text-slate-100">{item.user}</span>{' '}
                {item.meta}
              </p>

              {item.content && (
                <p className="mt-2 line-clamp-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs leading-5 text-slate-400">
                  <HighlightedText
                    text={item.content}
                    hashtagClassName="font-semibold text-indigo-200"
                  />
                </p>
              )}

              <p className="mt-2 text-xs text-slate-600">
                {formatNotificationTime(item.time)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
