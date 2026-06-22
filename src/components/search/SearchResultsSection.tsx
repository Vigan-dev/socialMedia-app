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
        <div className="app-surface rounded-3xl border-dashed px-4 py-8 text-center">
          <p className="text-sm font-semibold text-slate-200">
            No results found
          </p>
          <p className="mx-auto mt-2 max-w-[18rem] text-xs leading-5 text-slate-500">
            Try a name, handle, topic, or phrase from a post.
          </p>
        </div>
      )}
    </div>
  );
}
