'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useRef, useState } from 'react';
import { ProfileHeader } from '@/components/sections/profile/ProfileHeader';
import { ProfileNetworkSection } from '@/components/sections/profile/ProfileNetworkSection';
import { ProfilePostsSection } from '@/components/sections/profile/ProfilePostsSection';
import { ProfileSettingsForm } from '@/components/sections/profile/ProfileSettingsForm';
import type {
  MessagePrivacy,
  NotificationSettings,
  ProfileData,
  ProfilePrivacySettings,
  ProfileSocialTab,
  ThemeMode,
} from '@/components/sections/profile/profileTypes';
import { apiJsonData } from '@/lib/apiClient';
import { decodeAvailability } from '@/lib/apiSchemas';
import { validateBio, validateUsername } from '@/lib/formValidation';
import type { NetworkUser, Post, ReportReason } from '@/types/feed';

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
  profile: ProfileData;
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
  const [draftPrivacy, setDraftPrivacy] = useState<ProfilePrivacySettings>({
    allowMessagesFrom: profile?.privacy.allowMessagesFrom ?? 'everyone',
    allowMentionsFrom: profile?.privacy.allowMentionsFrom ?? 'everyone',
    showOnlineStatus: profile?.showOnlineStatus ?? true,
  });
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [socialTab, setSocialTab] = useState<ProfileSocialTab>('followers');
  const [fieldErrors, setFieldErrors] = useState({
    avatar: '',
    bio: '',
    username: '',
  });

  const savedBio = profile?.bio?.trim() ?? '';
  const presence = profile?.status ?? 'available';

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

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
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

  const saveProfile = async (event?: FormEvent<HTMLFormElement>) => {
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
      const availability = await apiJsonData(
        `/users/username-availability?username=${encodeURIComponent(nextUsername)}`,
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
      <ProfileHeader
        avatarUrl={avatarUrl}
        draftAvatarUrl={draftAvatarUrl}
        fieldErrors={fieldErrors}
        fileInputRef={fileInputRef}
        followersCount={followersCount}
        followingCount={followingCount}
        onImageChange={handleImageChange}
        onToggleSettings={() => setShowSettings((current) => !current)}
        postsCount={postsCount}
        presence={presence}
        savedBio={savedBio}
        showSettings={showSettings}
        username={username}
      />

      {!showSettings && (
        <>
          <ProfileNetworkSection
            followers={followers}
            followersCount={followersCount}
            following={following}
            followingCount={followingCount}
            onBlockUser={onBlockUser}
            onMuteUser={onMuteUser}
            onReportUser={onReportUser}
            onSocialTabChange={setSocialTab}
            onStartConversation={onStartConversation}
            onToggleFollow={onToggleFollow}
            socialTab={socialTab}
          />

          <ProfilePostsSection
            posts={posts}
            onDeletePost={onDeletePost}
            onEditPost={onEditPost}
          />
        </>
      )}

      {showSettings && (
        <ProfileSettingsForm
          accentColor={accentColor}
          bio={bio}
          draftAvatarUrl={draftAvatarUrl}
          draftNotificationSettings={draftNotificationSettings}
          draftPrivacy={draftPrivacy}
          draftUsername={draftUsername}
          fieldErrors={fieldErrors}
          isSaving={isSaving}
          onChangePhoto={() => fileInputRef.current?.click()}
          onLogout={onLogout}
          onRemovePhoto={() => setDraftAvatarUrl(null)}
          onSubmit={saveProfile}
          setAccentColor={setAccentColor}
          setBio={setBio}
          setDraftNotificationSettings={setDraftNotificationSettings}
          setDraftPrivacy={setDraftPrivacy}
          setDraftUsername={setDraftUsername}
          setFieldErrors={setFieldErrors}
          setThemeMode={setThemeMode}
          status={status}
          themeMode={themeMode}
        />
      )}
    </div>
  );
}
