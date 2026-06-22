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

      <div className="app-surface space-y-5 rounded-3xl p-5">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Live Insights
        </h3>

        <div className="min-w-0 space-y-4">
          {trendingItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTrendClick(item.topic)}
              className="pressable group block w-full min-w-0 rounded-2xl px-3 py-2 text-left hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                {item.category}
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-slate-300 transition group-hover:text-cyan-200">
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
