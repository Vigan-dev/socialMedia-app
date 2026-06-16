'use client';

import type { NetworkUser, Post } from '@/types/feed';
import { NetworkUserListSection } from './NetworkUserListSection';
import { PostSearchResultsSection } from './PostSearchResultsSection';

type SearchResultsSectionProps = {
  filteredPosts: Post[];
  filteredUsers: NetworkUser[];
  onBlockUserRequest: (user: NetworkUser) => void;
  onMuteUser: (userId: string) => void;
  onReportUserRequest: (user: NetworkUser) => void;
  onStartConversation: (userId: string) => void;
  onToggleFollow: (userId: string) => void;
};

export function SearchResultsSection({
  filteredPosts,
  filteredUsers,
  onBlockUserRequest,
  onMuteUser,
  onReportUserRequest,
  onStartConversation,
  onToggleFollow,
}: SearchResultsSectionProps) {
  const hasResults = filteredUsers.length > 0 || filteredPosts.length > 0;

  return (
    <div className="min-w-0 space-y-6">
      <NetworkUserListSection
        heading="Network Profiles"
        headingTone="indigo"
        users={filteredUsers}
        onStartConversation={onStartConversation}
        onToggleFollow={onToggleFollow}
        onMuteUser={onMuteUser}
        onBlockUserRequest={onBlockUserRequest}
        onReportUserRequest={onReportUserRequest}
      />

      <PostSearchResultsSection posts={filteredPosts} />

      {!hasResults && (
        <div className="rounded-xl border border-dashed border-white/[0.05] py-10 text-center">
          <p className="text-xs font-medium text-slate-400">
            No results found
          </p>
        </div>
      )}
    </div>
  );
}
