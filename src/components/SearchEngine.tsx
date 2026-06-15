'use client';

import React from 'react';
import Image from 'next/image';
import {
  ConfirmActionModal,
  ReportContentModal,
} from '@/components/ui/ActionModals';
import type {
  NetworkUser,
  Post,
  ReportReason,
  TrendingItemData,
} from '@/types/feed';

interface SearchEngineProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  trendingItems: TrendingItemData[];
  onTrendClick: (topic: string) => void;
  filteredUsers: NetworkUser[];
  filteredPosts: Post[];
  suggestedUsers: NetworkUser[];
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
}

export function SearchEngine({
  searchQuery,
  onSearchChange,
  trendingItems,
  onTrendClick,
  filteredUsers,
  filteredPosts,
  suggestedUsers,
  onBlockUser,
  onMuteUser,
  onReportUser,
  onStartConversation,
  onToggleFollow,
}: SearchEngineProps) {
  const [reportUserTarget, setReportUserTarget] =
    React.useState<NetworkUser | null>(null);
  const [blockUserTarget, setBlockUserTarget] =
    React.useState<NetworkUser | null>(null);
  const isSearching = searchQuery.trim().length > 0;
  const statusStyles = {
    available: 'bg-emerald-400',
    away: 'bg-amber-400',
    busy: 'bg-rose-400',
  };

  return (
    <aside className="sticky top-0 hidden h-screen min-w-0 flex-col space-y-6 overflow-hidden py-8 pl-8 lg:flex">
      <div className="relative z-20 min-w-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search network and posts..."
          className="w-full rounded-xl border border-white/[0.06] bg-[#0c111d]/60 py-2.5 pl-4 pr-9 text-xs text-slate-200 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-[#0c111d]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-300 transition hover:bg-slate-700"
            aria-label="Clear search"
          >
            x
          </button>
        )}
      </div>

      <div className="custom-scrollbar min-w-0 flex-1 overflow-y-auto pr-2">
        {isSearching ? (
          <div className="min-w-0 space-y-6">
            {filteredUsers.length > 0 && (
              <div className="space-y-3">
                <h3 className="border-b border-white/[0.05] pb-2 pl-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  Network Profiles
                </h3>

                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <NetworkUserCard
                      key={user.id}
                      user={user}
                      onStartConversation={onStartConversation}
                      onToggleFollow={onToggleFollow}
                      onMuteUser={onMuteUser}
                      onBlockUserRequest={setBlockUserTarget}
                      onReportUserRequest={setReportUserTarget}
                      statusStyles={statusStyles}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredPosts.length > 0 && (
              <div className="space-y-3">
                <h3 className="border-b border-white/[0.05] pb-2 pl-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Content Threads
                </h3>

                <div className="min-w-0 space-y-2">
                  {filteredPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="min-w-0 rounded-lg border border-white/[0.03] bg-[#0c111d]/40 p-3 transition hover:border-white/[0.1]"
                    >
                      <p className="mb-1 text-[10px] font-medium text-slate-400">
                        {post.user}
                      </p>
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-300">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>

                {filteredPosts.length > 3 && (
                  <p className="pt-2 text-center text-[10px] text-slate-500">
                    View all {filteredPosts.length} matches
                  </p>
                )}
              </div>
            )}

            {filteredUsers.length === 0 && filteredPosts.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/[0.05] py-10 text-center">
                <p className="text-xs font-medium text-slate-400">
                  No results found
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {suggestedUsers.length > 0 && (
              <div className="space-y-4 rounded-2xl border border-white/[0.04] bg-gradient-to-b from-[#0c111d]/70 to-transparent p-5 shadow-lg">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Suggested People
                </h3>

                <div className="space-y-1">
                  {suggestedUsers.map((user) => (
                    <NetworkUserCard
                      key={user.id}
                      user={user}
                      onStartConversation={onStartConversation}
                      onToggleFollow={onToggleFollow}
                      onMuteUser={onMuteUser}
                      onBlockUserRequest={setBlockUserTarget}
                      onReportUserRequest={setReportUserTarget}
                      statusStyles={statusStyles}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5 rounded-2xl border border-white/[0.04] bg-gradient-to-b from-[#0c111d]/60 to-transparent p-5 shadow-lg">
              <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Live Insights
              </h3>

              <div className="min-w-0 space-y-4">
                {trendingItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTrendClick(item.topic)}
                    className="group block w-full min-w-0 rounded-md text-left transition"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      {item.category}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-slate-300 transition group-hover:text-indigo-400">
                      {item.topic}
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-slate-500">
                      {item.count}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {reportUserTarget && (
        <ReportContentModal
          targetId={reportUserTarget.id}
          targetLabel={reportUserTarget.name}
          targetType="user"
          onCancel={() => setReportUserTarget(null)}
          onSubmit={(_targetType, targetId, reason, details) => {
            onReportUser('user', targetId, reason, details);
            setReportUserTarget(null);
          }}
        />
      )}
      {blockUserTarget && (
        <ConfirmActionModal
          confirmLabel="Block user"
          description={`You will stop seeing content from ${blockUserTarget.name}. This keeps your feed and search results cleaner.`}
          intent="warning"
          title={`Block ${blockUserTarget.name}?`}
          onCancel={() => setBlockUserTarget(null)}
          onConfirm={() => {
            onBlockUser(blockUserTarget.id);
            setBlockUserTarget(null);
          }}
        />
      )}
    </aside>
  );
}

function NetworkUserCard({
  user,
  onStartConversation,
  onToggleFollow,
  onMuteUser,
  onBlockUserRequest,
  onReportUserRequest,
  statusStyles,
}: {
  user: NetworkUser;
  onStartConversation: (userId: string) => void;
  onToggleFollow: (userId: string) => void;
  onMuteUser: (userId: string) => void;
  onBlockUserRequest: (user: NetworkUser) => void;
  onReportUserRequest: (user: NetworkUser) => void;
  statusStyles: Record<'available' | 'away' | 'busy', string>;
}) {
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
