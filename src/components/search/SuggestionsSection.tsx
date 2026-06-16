'use client';

import type { NetworkUser, TrendingItemData } from '@/types/feed';
import { NetworkUserListSection } from './NetworkUserListSection';

type SuggestionsSectionProps = {
  onBlockUserRequest: (user: NetworkUser) => void;
  onMuteUser: (userId: string) => void;
  onReportUserRequest: (user: NetworkUser) => void;
  onStartConversation: (userId: string) => void;
  onToggleFollow: (userId: string) => void;
  onTrendClick: (topic: string) => void;
  suggestedUsers: NetworkUser[];
  trendingItems: TrendingItemData[];
};

export function SuggestionsSection({
  onBlockUserRequest,
  onMuteUser,
  onReportUserRequest,
  onStartConversation,
  onToggleFollow,
  onTrendClick,
  suggestedUsers,
  trendingItems,
}: SuggestionsSectionProps) {
  return (
    <div className="space-y-5">
      <NetworkUserListSection
        heading="Suggested People"
        isCard
        users={suggestedUsers}
        onStartConversation={onStartConversation}
        onToggleFollow={onToggleFollow}
        onMuteUser={onMuteUser}
        onBlockUserRequest={onBlockUserRequest}
        onReportUserRequest={onReportUserRequest}
      />

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
  );
}
