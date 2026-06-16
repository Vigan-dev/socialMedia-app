'use client';

import { Card } from '@/components/ui/Card';
import type {
  ProfileNetworkData,
  ProfileSocialTab,
  ProfileUserActions,
} from './profileTypes';
import { SocialUserCard } from './SocialUserCard';

const socialTabOptions: Array<{
  id: ProfileSocialTab;
  label: string;
}> = [
  { id: 'followers', label: 'Followers' },
  { id: 'following', label: 'Following' },
];

type ProfileNetworkSectionProps = ProfileNetworkData &
  ProfileUserActions & {
    onSocialTabChange: (tab: ProfileSocialTab) => void;
    socialTab: ProfileSocialTab;
  };

export function ProfileNetworkSection({
  followers,
  followersCount,
  following,
  followingCount,
  onBlockUser,
  onMuteUser,
  onReportUser,
  onSocialTabChange,
  onStartConversation,
  onToggleFollow,
  socialTab,
}: ProfileNetworkSectionProps) {
  const visibleSocialUsers = socialTab === 'followers' ? followers : following;

  return (
    <Card className="space-y-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Network</h2>
          <p className="mt-1 text-sm text-slate-400">
            People connected to this profile.
          </p>
        </div>

        <div className="flex rounded-full border border-white/[0.06] bg-white/[0.03] p-1">
          {socialTabOptions.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSocialTabChange(id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                socialTab === id
                  ? 'bg-white text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}{' '}
              {id === 'followers'
                ? followers.length || followersCount
                : following.length || followingCount}
            </button>
          ))}
        </div>
      </div>

      {visibleSocialUsers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleSocialUsers.map((user) => (
            <SocialUserCard
              key={user.id}
              user={user}
              onStartConversation={onStartConversation}
              onToggleFollow={onToggleFollow}
              onBlockUser={onBlockUser}
              onMuteUser={onMuteUser}
              onReportUser={onReportUser}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center">
          <p className="text-sm font-medium text-slate-300">
            No {socialTab} yet
          </p>
        </div>
      )}
    </Card>
  );
}
