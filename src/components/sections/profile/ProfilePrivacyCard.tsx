'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Card } from '@/components/ui/Card';
import type { MessagePrivacy, ProfilePrivacySettings } from './profileTypes';

type ProfilePrivacyCardProps = {
  draftPrivacy: ProfilePrivacySettings;
  setDraftPrivacy: Dispatch<SetStateAction<ProfilePrivacySettings>>;
};

export function ProfilePrivacyCard({
  draftPrivacy,
  setDraftPrivacy,
}: ProfilePrivacyCardProps) {
  return (
    <Card className="space-y-5 p-5">
      <div>
        <h2 className="text-sm font-semibold text-white">Privacy Controls</h2>
        <p className="mt-1 text-sm text-slate-400">
          Choose who can contact or mention you. These controls reduce unwanted
          interactions without changing your existing posts.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Direct messages
          </span>
          <select
            value={draftPrivacy.allowMessagesFrom}
            onChange={(event) =>
              setDraftPrivacy((current) => ({
                ...current,
                allowMessagesFrom: event.target.value as MessagePrivacy,
              }))
            }
            className="w-full rounded-xl border border-white/[0.08] bg-[#051223] px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
          >
            <option value="everyone">Everyone</option>
            <option value="following">People I follow</option>
            <option value="none">No one</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Mentions
          </span>
          <select
            value={draftPrivacy.allowMentionsFrom}
            onChange={(event) =>
              setDraftPrivacy((current) => ({
                ...current,
                allowMentionsFrom: event.target.value as MessagePrivacy,
              }))
            }
            className="w-full rounded-xl border border-white/[0.08] bg-[#051223] px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
          >
            <option value="everyone">Everyone</option>
            <option value="following">People I follow</option>
            <option value="none">No one</option>
          </select>
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-white/[0.06] p-4">
        <input
          type="checkbox"
          checked={draftPrivacy.showOnlineStatus}
          onChange={(event) =>
            setDraftPrivacy((current) => ({
              ...current,
              showOnlineStatus: event.target.checked,
            }))
          }
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium text-slate-200">
            Show online status
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            When enabled, other users can see your Available, Away, or Busy
            status in search and conversations.
          </span>
        </span>
      </label>
    </Card>
  );
}
