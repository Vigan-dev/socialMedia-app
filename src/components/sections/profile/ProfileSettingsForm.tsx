'use client';

import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type {
  NotificationSettings,
  ProfileFieldErrors,
  ProfilePrivacySettings,
  ThemeMode,
} from './profileTypes';
import { ProfileNotificationCard } from './ProfileNotificationCard';
import { ProfilePrivacyCard } from './ProfilePrivacyCard';

type ProfileSettingsFormProps = {
  accentColor: string;
  bio: string;
  draftAvatarUrl: string | null;
  draftNotificationSettings: NotificationSettings;
  draftPrivacy: ProfilePrivacySettings;
  draftUsername: string;
  fieldErrors: ProfileFieldErrors;
  isSaving: boolean;
  onChangePhoto: () => void;
  onLogout: () => void;
  onRemovePhoto: () => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  setAccentColor: (color: string) => void;
  setBio: (bio: string) => void;
  setDraftNotificationSettings: Dispatch<SetStateAction<NotificationSettings>>;
  setDraftPrivacy: Dispatch<SetStateAction<ProfilePrivacySettings>>;
  setDraftUsername: (username: string) => void;
  setFieldErrors: Dispatch<SetStateAction<ProfileFieldErrors>>;
  setThemeMode: (mode: ThemeMode) => void;
  status: string;
  themeMode: ThemeMode;
};

export function ProfileSettingsForm({
  accentColor,
  bio,
  draftAvatarUrl,
  draftNotificationSettings,
  draftPrivacy,
  draftUsername,
  fieldErrors,
  isSaving,
  onChangePhoto,
  onLogout,
  onRemovePhoto,
  onSubmit,
  setAccentColor,
  setBio,
  setDraftNotificationSettings,
  setDraftPrivacy,
  setDraftUsername,
  setFieldErrors,
  setThemeMode,
  status,
  themeMode,
}: ProfileSettingsFormProps) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <Card className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Button type="button" variant="secondary" onClick={onChangePhoto}>
            Change Photo
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onRemovePhoto}
            disabled={!draftAvatarUrl}
          >
            Remove Photo
          </Button>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {fieldErrors.avatar && (
          <p id="profile-avatar-error" className="text-sm text-rose-400">
            {fieldErrors.avatar}
          </p>
        )}

        {status && (
          <p
            id="profile-save-status"
            aria-live="polite"
            className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-slate-300"
          >
            {status}
          </p>
        )}
      </Card>

      <Card className="space-y-5 p-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Account</h2>
          <p className="mt-1 text-sm text-slate-400">
            Update the public identity people see in posts, search, messages,
            and notifications.
          </p>
        </div>

        <label htmlFor="profile-display-name" className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Display Name
          </span>
          <input
            id="profile-display-name"
            type="text"
            value={draftUsername}
            onChange={(event) => {
              setDraftUsername(event.target.value);
              setFieldErrors((current) => ({ ...current, username: '' }));
            }}
            className="w-full rounded-xl border border-white/[0.08] bg-[#051223] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
            placeholder="Enter your display name"
            autoComplete="name"
            maxLength={50}
            required
            aria-describedby={
              fieldErrors.username
                ? 'profile-display-name-error'
                : status
                  ? 'profile-save-status'
                  : undefined
            }
            aria-invalid={Boolean(fieldErrors.username)}
          />
          {fieldErrors.username && (
            <p
              id="profile-display-name-error"
              className="mt-2 text-xs text-rose-400"
            >
              {fieldErrors.username}
            </p>
          )}
        </label>

        <label htmlFor="profile-bio" className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Bio
          </span>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => {
              setBio(event.target.value);
              setFieldErrors((current) => ({ ...current, bio: '' }));
            }}
            className="min-h-24 w-full resize-none rounded-xl border border-white/[0.08] bg-[#051223] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
            placeholder="Tell people what you are working on."
            maxLength={280}
            aria-describedby={
              fieldErrors.bio
                ? 'profile-bio-error'
                : status
                  ? 'profile-save-status'
                  : undefined
            }
            aria-invalid={Boolean(fieldErrors.bio)}
          />
          <span className="mt-2 block text-xs text-slate-500">
            {bio.length}/280 characters
          </span>
          {fieldErrors.bio && (
            <p id="profile-bio-error" className="mt-2 text-xs text-rose-400">
              {fieldErrors.bio}
            </p>
          )}
        </label>
      </Card>

      <Card className="space-y-5 p-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Appearance</h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose the contrast and accent that are easiest for you to use.
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">Theme</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'dark' as const, label: 'Dark', helper: 'Low glare' },
              { id: 'light' as const, label: 'Light', helper: 'High contrast' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setThemeMode(option.id)}
                aria-pressed={themeMode === option.id}
                className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  themeMode === option.id
                    ? 'border-indigo-400 bg-indigo-500/[0.1] text-indigo-100'
                    : 'border-white/[0.08] text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <span className="block text-sm font-semibold">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {option.helper}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">
            Accent Color
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
              { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
              { id: 'rose', label: 'Rose', color: 'bg-rose-500' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAccentColor(option.id)}
                aria-pressed={accentColor === option.id}
                className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  accentColor === option.id
                    ? 'border-white/30 bg-white/[0.06] text-white'
                    : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04]'
                }`}
              >
                <span className={`h-4 w-4 rounded-full ${option.color}`} />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <ProfilePrivacyCard
        draftPrivacy={draftPrivacy}
        setDraftPrivacy={setDraftPrivacy}
      />

      <ProfileNotificationCard
        draftNotificationSettings={draftNotificationSettings}
        setDraftNotificationSettings={setDraftNotificationSettings}
      />

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Session</h2>
            <p className="mt-1 text-sm text-slate-400">
              Sign out of this browser when you are done.
            </p>
          </div>

          <Button type="button" variant="danger" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </form>
  );
}
