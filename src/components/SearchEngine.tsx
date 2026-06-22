'use client';

import React from 'react';
import { SearchResultsSection } from '@/components/search/SearchResultsSection';
import { SuggestionsSection } from '@/components/search/SuggestionsSection';
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

  return (
    <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] min-w-0 flex-col gap-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-[#07101f]/50 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:flex">
      <div className="relative z-20 min-w-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search network and posts..."
          className="w-full rounded-2xl border border-white/[0.07] bg-[#0c111d]/78 py-3 pl-4 pr-10 text-sm text-slate-100 shadow-inner outline-none placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-[#10192b]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="pressable absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700"
            aria-label="Clear search"
          >
            x
          </button>
        )}
      </div>

      <div className="custom-scrollbar min-w-0 flex-1 overflow-y-auto pr-1">
        {isSearching ? (
          <SearchResultsSection
            filteredUsers={filteredUsers}
            filteredPosts={filteredPosts}
            onStartConversation={onStartConversation}
            onToggleFollow={onToggleFollow}
            onMuteUser={onMuteUser}
            onBlockUserRequest={setBlockUserTarget}
            onReportUserRequest={setReportUserTarget}
          />
        ) : (
          <SuggestionsSection
            suggestedUsers={suggestedUsers}
            trendingItems={trendingItems}
            onTrendClick={onTrendClick}
            onStartConversation={onStartConversation}
            onToggleFollow={onToggleFollow}
            onMuteUser={onMuteUser}
            onBlockUserRequest={setBlockUserTarget}
            onReportUserRequest={setReportUserTarget}
          />
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
