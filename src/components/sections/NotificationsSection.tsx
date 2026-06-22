'use client';

import React from 'react';
import { HighlightedText } from '@/components/HighlightedText';
import { UserAvatar } from '@/components/UserAvatar';
import { ListItemSkeleton } from '@/components/ui/Skeleton';

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
      <div className="space-y-3 p-4" aria-label="Loading notifications">
        {Array.from({ length: 4 }, (_, index) => (
          <ListItemSkeleton key={index} lines={2} />
        ))}
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="p-4">
        <div className="app-surface rounded-3xl border-dashed p-8 text-center">
          <p className="text-sm font-semibold text-slate-200">
            No notifications yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Likes, comments, follows, and mentions will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pb-4 pt-1">
        <div className="app-surface rounded-3xl p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/70">
              {unreadCount} unread
            </p>

            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="pressable rounded-full border border-white/[0.08] px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Mark all read
            </button>
          </div>

          <div className="custom-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onFilterChange(option.id)}
                aria-pressed={filter === option.id}
                className={`pressable whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                  filter === option.id
                    ? 'border-cyan-300/50 bg-cyan-400/12 text-cyan-100'
                    : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {items.length === 0 && (
        <div className="p-4">
          <div className="app-surface rounded-3xl border-dashed p-8 text-center">
            <p className="text-sm font-semibold text-slate-200">
              No notifications match this filter
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Switch filters to see other notification categories.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 px-4 pb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`interactive-surface flex gap-4 rounded-2xl border p-4 ${
              item.read
                ? 'border-white/[0.055] bg-white/[0.015]'
                : 'border-cyan-300/15 bg-cyan-400/[0.045]'
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
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
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
