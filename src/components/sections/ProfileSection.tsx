'use client';

import React, { useRef, useState } from 'react';
import NextImage from 'next/image';
import { ProfilePostCard } from '@/components/sections/profile/ProfilePostCard';
import { SocialUserCard } from '@/components/sections/profile/SocialUserCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiData } from '@/lib/apiClient';
import { decodeAvailability } from '@/lib/apiSchemas';
import { validateBio, validateUsername } from '@/lib/formValidation';
import type { NetworkUser, Post, ReportReason } from '@/types/feed';

type ThemeMode = 'dark' | 'light';
type MessagePrivacy = 'everyone' | 'following' | 'none';
type NotificationSettings = {
  comments: boolean;
  follows: boolean;
  likes: boolean;
  mentions: boolean;
  messages: boolean;
};

const avatarSize = 320;
const avatarQuality = 0.85;
const maxAvatarFileSize = 5 * 1024 * 1024;
interface ProfileSectionProps {
  username: string;
  accentColor: string;
  setAccentColor: (color: string) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  followers: NetworkUser[];
  following: NetworkUser[];
  postsCount: number;
  posts: Post[];
  onDeletePost: (postId: Post['id']) => void;
  onEditPost: (postId: Post['id'], content: string) => void;
  onStartConversation: (userId: string) => void;
  onToggleFollow: (userId: string) => void;
  onBlockUser: (userId: string) => void;
  onMuteUser: (userId: string) => void;
  onReportUser: (
    targetType: 'user',
    targetId: string,
    reason: ReportReason,
    details?: string,
  ) => void;
  profile: {
    bio: string;
    notificationSettings: NotificationSettings;
    privacy: {
      allowMessagesFrom: MessagePrivacy;
      allowMentionsFrom: MessagePrivacy;
    };
    showOnlineStatus: boolean;
    status?: 'available' | 'away' | 'busy';
  } | null;
  onSaveNotificationSettings: (
    settings: Partial<NotificationSettings>,
  ) => Promise<void>;
  onSaveProfile: (profile: {
    bio?: string;
    username: string;
    avatarUrl: string | null;
  }) => Promise<void>;
  onSavePrivacy: (settings: {
    allowMessagesFrom?: MessagePrivacy;
    allowMentionsFrom?: MessagePrivacy;
    showOnlineStatus?: boolean;
  }) => Promise<void>;
  onLogout: () => void;
}

export function ProfileSection({
  username,
  accentColor,
  setAccentColor,
  themeMode,
  setThemeMode,
  avatarUrl,
  followersCount,
  followingCount,
  followers,
  following,
  postsCount,
  posts,
  onDeletePost,
  onEditPost,
  onStartConversation,
  onToggleFollow,
  onBlockUser,
  onMuteUser,
  onReportUser,
  profile,
  onSaveNotificationSettings,
  onSaveProfile,
  onSavePrivacy,
  onLogout,
}: ProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draftUsername, setDraftUsername] = useState(username);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string | null>(avatarUrl);
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [draftNotificationSettings, setDraftNotificationSettings] =
    useState<NotificationSettings>(
      profile?.notificationSettings ?? {
        comments: true,
        follows: true,
        likes: true,
        mentions: true,
        messages: true,
      },
    );
  const [draftPrivacy, setDraftPrivacy] = useState({
    allowMessagesFrom: profile?.privacy.allowMessagesFrom ?? 'everyone',
    allowMentionsFrom: profile?.privacy.allowMentionsFrom ?? 'everyone',
    showOnlineStatus: profile?.showOnlineStatus ?? true,
  });
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [socialTab, setSocialTab] = useState<'followers' | 'following'>(
    'followers',
  );
  const [fieldErrors, setFieldErrors] = useState({
    avatar: '',
    bio: '',
    username: '',
  });

  const savedBio = profile?.bio?.trim() ?? '';
  const presence = profile?.status ?? 'available';
  const presenceDotStyles = {
    available: 'bg-emerald-400',
    away: 'bg-amber-400',
    busy: 'bg-rose-400',
  };
  const visibleSocialUsers = socialTab === 'followers' ? followers : following;

  




  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('Could not read image file.'));
      };

      reader.onerror = () => reject(new Error('Could not read image file.'));
      reader.readAsDataURL(file);
    });

  const resizeAvatar = (source: string) =>
    new Promise<string>((resolve, reject) => {
      const image = new window.Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Could not prepare avatar image.'));
          return;
        }

        const side = Math.min(image.width, image.height);
        const sourceX = Math.max(0, (image.width - side) / 2);
        const sourceY = Math.max(0, (image.height - side) / 2);

        canvas.width = avatarSize;
        canvas.height = avatarSize;
        context.drawImage(
          image,
          sourceX,
          sourceY,
          side,
          side,
          0,
          0,
          avatarSize,
          avatarSize,
        );

        resolve(canvas.toDataURL('image/jpeg', avatarQuality));
      };

      image.onerror = () => reject(new Error('Could not load image file.'));
      image.src = source;
    });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFieldErrors((current) => ({
        ...current,
        avatar: 'Choose an image file.',
      }));
      setStatus('Choose an image file.');
      return;
    }

    if (file.size > maxAvatarFileSize) {
      setFieldErrors((current) => ({
        ...current,
        avatar: 'Avatar image must be 5 MB or smaller.',
      }));
      setStatus('Avatar image must be 5 MB or smaller.');
      return;
    }

    try {
      const source = await readFileAsDataUrl(file);
      const resizedAvatar = await resizeAvatar(source);
      setDraftAvatarUrl(resizedAvatar);
      setFieldErrors((current) => ({ ...current, avatar: '' }));
      setStatus('Avatar preview updated. Save changes to keep it.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Avatar preview failed.');
    } finally {
      event.target.value = '';
    }
  };

  const saveProfile = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const nextUsername = draftUsername.trim();
    const nextFieldErrors = {
      avatar: fieldErrors.avatar,
      bio: validateBio(bio),
      username: validateUsername(nextUsername),
    };

    setFieldErrors(nextFieldErrors);

    if (
      nextFieldErrors.avatar ||
      nextFieldErrors.bio ||
      nextFieldErrors.username
    ) {
      setStatus('Check the highlighted fields.');
      return;
    }

    try {
      setIsSaving(true);
      setStatus('');
      const availability = await apiData(
        `/users/username-availability?username=${encodeURIComponent(nextUsername)}`,
        undefined,
        'Username availability check failed',
        decodeAvailability,
      );

      if (availability.available !== true) {
        setFieldErrors((current) => ({
          ...current,
          username: 'That display name is already taken.',
        }));
        setStatus('That display name is already taken.');
        return;
      }

      await onSaveProfile({
        avatarUrl: draftAvatarUrl,
        bio,
        username: nextUsername,
      });
      await onSavePrivacy({
        allowMessagesFrom: draftPrivacy.allowMessagesFrom,
        allowMentionsFrom: draftPrivacy.allowMentionsFrom,
        showOnlineStatus: draftPrivacy.showOnlineStatus,
      });
      await onSaveNotificationSettings(draftNotificationSettings);
      setStatus('Profile settings saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Profile update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-5">
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
                  {(showSettings ? draftAvatarUrl : avatarUrl) ? (
                    <NextImage
                      src={(showSettings ? draftAvatarUrl : avatarUrl) as string}
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
                  onChange={handleImageChange}
                  className="sr-only"
                  aria-describedby={fieldErrors.avatar ? 'profile-avatar-error' : undefined}
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-white">{username}</p>
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
            onClick={() => setShowSettings((current) => !current)}
          >
            {showSettings ? 'View Public Profile' : 'Settings'}
          </Button>
        </div>
      </Card>

      {!showSettings && (
        <>
          <Card className="space-y-5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Network</h2>
                <p className="mt-1 text-sm text-slate-400">
                  People connected to this profile.
                </p>
              </div>

              <div className="flex rounded-full border border-white/[0.06] bg-white/[0.03] p-1">
                {[
                  ['followers', 'Followers', followers.length || followersCount],
                  ['following', 'Following', following.length || followingCount],
                ].map(([id, label, count]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSocialTab(id as 'followers' | 'following')}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                      socialTab === id
                        ? 'bg-white text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {label} {count}
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

          <Card className="space-y-5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Posts</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Public posts from this profile.
                </p>
              </div>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
                {posts.length}
              </span>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-3">
                {posts.map((post) => (
                  <ProfilePostCard
                    key={post.id}
                    post={post}
                    onDeletePost={onDeletePost}
                    onEditPost={onEditPost}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
                <p className="text-sm font-medium text-slate-300">No posts yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Posts you publish will appear on your public profile.
                </p>
              </div>
            )}
          </Card>
        </>
      )}

      {showSettings && (
        <form className="space-y-5" onSubmit={saveProfile}>
          <Card className="space-y-5 p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Photo
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setDraftAvatarUrl(null)}
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
            <p id="profile-display-name-error" className="mt-2 text-xs text-rose-400">
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
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {option.helper}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">Accent Color</p>
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

          <Card className="space-y-5 p-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Privacy Controls</h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose who can contact or mention you. These controls reduce
            unwanted interactions without changing your existing posts.
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

          <Card className="space-y-5 p-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Notifications</h2>
          <p className="mt-1 text-sm text-slate-400">
            Control which actions create notifications. Disabling a category
            does not delete older notifications.
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
                checked={draftNotificationSettings[key as keyof NotificationSettings]}
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
      )}
    </div>
  );
}
