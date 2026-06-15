'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import {
  ConfirmActionModal,
  ReportContentModal,
} from '@/components/ui/ActionModals';
import type { NetworkUser, ReportReason } from '@/types/feed';

type SocialUserCardProps = {
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
  user: NetworkUser;
};

const statusStyles = {
  available: 'bg-emerald-400',
  away: 'bg-amber-400',
  busy: 'bg-rose-400',
};

export function SocialUserCard({
  user,
  onStartConversation,
  onToggleFollow,
  onBlockUser,
  onMuteUser,
  onReportUser,
}: SocialUserCardProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  return (
    <>
      <article className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          {user.avatarUrl ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <NextImage
                src={user.avatarUrl}
                alt={`${user.name} avatar`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user.name}
            </p>
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
              {user.status && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusStyles[user.status]}`}
                />
              )}
              {user.handle}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {user.followersCount} followers
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onStartConversation(user.id)}
            className="flex-1 rounded-full border border-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.04]"
          >
            Message
          </button>
          <button
            type="button"
            onClick={() => onToggleFollow(user.id)}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
              user.isFollowing
                ? 'border-white/[0.08] text-slate-400 hover:text-rose-300'
                : 'border-indigo-400/40 bg-indigo-500/[0.08] text-indigo-200'
            }`}
          >
            {user.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        <div className="mt-3 flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="font-semibold text-amber-300/80 transition hover:text-amber-200"
          >
            Report
          </button>
          <button
            type="button"
            onClick={() => onMuteUser(user.id)}
            className="font-semibold text-slate-500 transition hover:text-slate-300"
          >
            Mute
          </button>
          <button
            type="button"
            onClick={() => setIsBlockOpen(true)}
            className="font-semibold text-rose-400/80 transition hover:text-rose-300"
          >
            Block
          </button>
        </div>
      </article>

      {isReportOpen && (
        <ReportContentModal
          targetId={user.id}
          targetLabel={user.name}
          targetType="user"
          onCancel={() => setIsReportOpen(false)}
          onSubmit={(_targetType, targetId, reason, details) => {
            onReportUser('user', targetId, reason, details);
            setIsReportOpen(false);
          }}
        />
      )}

      {isBlockOpen && (
        <ConfirmActionModal
          confirmLabel="Block user"
          description={`You will stop seeing content from ${user.name}. This can help keep your network focused.`}
          intent="warning"
          title={`Block ${user.name}?`}
          onCancel={() => setIsBlockOpen(false)}
          onConfirm={() => {
            onBlockUser(user.id);
            setIsBlockOpen(false);
          }}
        />
      )}
    </>
  );
}
