'use client';

import type { NetworkUser } from '@/types/feed';
import { NetworkUserCard } from './NetworkUserCard';

type NetworkUserListSectionProps = {
  heading: string;
  headingTone?: 'indigo' | 'slate';
  isCard?: boolean;
  onBlockUserRequest: (user: NetworkUser) => void;
  onMuteUser: (userId: string) => void;
  onReportUserRequest: (user: NetworkUser) => void;
  onStartConversation: (userId: string) => void;
  onToggleFollow: (userId: string) => void;
  users: NetworkUser[];
};

const headingToneClass = {
  indigo: 'border-b border-white/[0.05] pb-2 pl-1 text-indigo-400',
  slate: 'flex items-center gap-2 text-slate-500',
};

export function NetworkUserListSection({
  heading,
  headingTone = 'slate',
  isCard = false,
  onBlockUserRequest,
  onMuteUser,
  onReportUserRequest,
  onStartConversation,
  onToggleFollow,
  users,
}: NetworkUserListSectionProps) {
  if (users.length === 0) return null;

  const content = (
    <>
      <h3
        className={`${headingToneClass[headingTone]} text-[10px] font-bold uppercase tracking-widest`}
      >
        {headingTone === 'slate' && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        )}
        {heading}
      </h3>

      <div className="space-y-1">
        {users.map((user) => (
          <NetworkUserCard
            key={user.id}
            user={user}
            onStartConversation={onStartConversation}
            onToggleFollow={onToggleFollow}
            onMuteUser={onMuteUser}
            onBlockUserRequest={onBlockUserRequest}
            onReportUserRequest={onReportUserRequest}
          />
        ))}
      </div>
    </>
  );

  if (isCard) {
    return (
      <div className="space-y-4 rounded-2xl border border-white/[0.04] bg-gradient-to-b from-[#0c111d]/70 to-transparent p-5 shadow-lg">
        {content}
      </div>
    );
  }

  return <div className="space-y-3">{content}</div>;
}
