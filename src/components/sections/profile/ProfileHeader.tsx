'use client';

import type { ChangeEvent, RefObject } from 'react';
import NextImage from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { resolveMediaUrl } from '@/lib/mediaUrls';
import type { ProfileFieldErrors } from './profileTypes';

type ProfileHeaderProps = {
  avatarUrl: string | null;
  draftAvatarUrl: string | null;
  fieldErrors: ProfileFieldErrors;
  fileInputRef: RefObject<HTMLInputElement | null>;
  followersCount: number;
  followingCount: number;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggleSettings: () => void;
  postsCount: number;
  presence: 'available' | 'away' | 'busy';
  savedBio: string;
  showSettings: boolean;
  username: string;
};

const presenceDotStyles = {
  available: 'bg-emerald-400',
  away: 'bg-amber-400',
  busy: 'bg-rose-400',
};

export function ProfileHeader({
  avatarUrl,
  draftAvatarUrl,
  fieldErrors,
  fileInputRef,
  followersCount,
  followingCount,
  onImageChange,
  onToggleSettings,
  postsCount,
  presence,
  savedBio,
  showSettings,
  username,
}: ProfileHeaderProps) {
  const visibleAvatarUrl = showSettings ? draftAvatarUrl : avatarUrl;
  const resolvedAvatarUrl = resolveMediaUrl(visibleAvatarUrl);

  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-500" />

      <div className="space-y-5 p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <div className="-mt-14">
              <button
                type="button"
                onClick={() => {
                  if (showSettings) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#060911] bg-slate-800 text-xl font-bold text-white outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  showSettings ? 'cursor-pointer' : 'cursor-default'
                }`}
                aria-label={showSettings ? 'Upload profile image' : 'Profile image'}
              >
                {resolvedAvatarUrl ? (
                  <NextImage
                    src={resolvedAvatarUrl}
                    alt="Profile avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  username.slice(0, 2).toUpperCase()
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="sr-only"
                aria-describedby={
                  fieldErrors.avatar ? 'profile-avatar-error' : undefined
                }
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-white">
                {username}
              </p>
              <p className="truncate text-sm text-slate-400">
                @{username.toLowerCase().replace(/\s+/g, '_')}
              </p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-2.5 py-1 text-xs capitalize text-slate-300">
                <span className={`h-2 w-2 rounded-full ${presenceDotStyles[presence]}`} />
                {presence}
              </p>
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-3 gap-2 xl:max-w-[360px] xl:flex-1">
            {[
              ['Posts', postsCount],
              ['Followers', followersCount],
              ['Following', followingCount],
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-w-0 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.07] to-white/[0.025] px-2 py-3 text-center shadow-[0_12px_28px_rgba(0,0,0,0.16)] sm:px-3"
              >
                <p className="text-base font-black leading-none text-white">
                  {value}
                </p>
                <p className="mt-2 truncate text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500 min-[420px]:text-[9px] sm:text-[10px] sm:tracking-[0.16em]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-300">
          {savedBio || 'No bio yet.'}
        </p>

        <Button
          type="button"
          variant={showSettings ? 'secondary' : 'ghost'}
          onClick={onToggleSettings}
        >
          {showSettings ? 'View Public Profile' : 'Settings'}
        </Button>
      </div>
    </Card>
  );
}
