'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Card } from '@/components/ui/Card';
import type { NotificationSettings } from './profileTypes';

type ProfileNotificationCardProps = {
  draftNotificationSettings: NotificationSettings;
  setDraftNotificationSettings: Dispatch<SetStateAction<NotificationSettings>>;
};

export function ProfileNotificationCard({
  draftNotificationSettings,
  setDraftNotificationSettings,
}: ProfileNotificationCardProps) {
  return (
    <Card className="space-y-5 p-5">
      <div>
        <h2 className="text-sm font-semibold text-white">Notifications</h2>
        <p className="mt-1 text-sm text-slate-400">
          Control which actions create notifications. Disabling a category does
          not delete older notifications.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['likes', 'Likes'],
          ['comments', 'Comments'],
          ['follows', 'Follows'],
          ['mentions', 'Mentions'],
          ['messages', 'Messages'],
        ].map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3"
          >
            <span className="text-sm text-slate-300">{label}</span>
            <input
              type="checkbox"
              checked={
                draftNotificationSettings[key as keyof NotificationSettings]
              }
              onChange={(event) =>
                setDraftNotificationSettings((current) => ({
                  ...current,
                  [key]: event.target.checked,
                }))
              }
            />
          </label>
        ))}
      </div>
    </Card>
  );
}
