'use client';

import Image from 'next/image';
import type { NetworkUser } from '@/types/feed';

type NetworkUserCardProps = {
  onBlockUserRequest: (user: NetworkUser) => void;
  onMuteUser: (userId: string) => void;
  onReportUserRequest: (user: NetworkUser) => void;
  onStartConversation: (userId: string) => void;
  onToggleFollow: (userId: string) => void;
  user: NetworkUser;
};

const statusStyles = {
  available: 'bg-emerald-400',
  away: 'bg-amber-400',
  busy: 'bg-rose-400',
};

export function NetworkUserCard({
  user,
  onStartConversation,
  onToggleFollow,
  onMuteUser,
  onBlockUserRequest,
  onReportUserRequest,
}: NetworkUserCardProps) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.04] bg-white/[0.025] p-3 transition hover:border-white/[0.08] hover:bg-white/[0.04]">
      <div className="flex min-w-0 items-center gap-3">
        {user.avatarUrl ? (
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/[0.1]">
            <Image
              src={user.avatarUrl}
              alt={`${user.name} avatar`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-100">
            {user.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-[10px] text-slate-500">
            {user.status && (
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyles[user.status]}`}
              />
            )}
            {user.handle} - {user.followersCount} followers
          </p>
        </div>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="grid min-w-0 grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onStartConversation(user.id)}
            className="truncate rounded-md border border-white/[0.08] px-2 py-1.5 text-[10px] font-semibold text-slate-300 transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Message
          </button>
          <button
            type="button"
            onClick={() => onToggleFollow(user.id)}
            className={`truncate rounded-md border px-2 py-1.5 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              user.isFollowing
                ? 'border-white/[0.08] text-slate-400 hover:text-rose-300'
                : 'border-indigo-400/40 bg-indigo-500/[0.08] text-indigo-200'
            }`}
          >
            {user.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        <div
          className="flex shrink-0 flex-col rounded-xl border border-white/[0.05] bg-[#070b14]/70 p-1"
          aria-label={`Safety actions for ${user.name}`}
        >
          <button
            type="button"
            onClick={() => onReportUserRequest(user)}
            className="rounded-lg px-2 py-1 text-left text-[10px] font-semibold text-amber-300/80 transition hover:bg-amber-400/10 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Report
          </button>
          <button
            type="button"
            onClick={() => onMuteUser(user.id)}
            className="rounded-lg px-2 py-1 text-left text-[10px] font-semibold text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Mute
          </button>
          <button
            type="button"
            onClick={() => onBlockUserRequest(user)}
            className="rounded-lg px-2 py-1 text-left text-[10px] font-semibold text-rose-400/80 transition hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Block
          </button>
        </div>
      </div>
    </div>
  );
}
