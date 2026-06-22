'use client';

import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/mediaUrls';

type UserAvatarProps = {
  size?: string;
  avatarUrl: string | null;
  username: string;
};

export function UserAvatar({ size = 'h-9 w-9', avatarUrl, username }: UserAvatarProps) {
  const resolvedAvatarUrl = resolveMediaUrl(avatarUrl);

  return resolvedAvatarUrl ? (
    <div className={`relative overflow-hidden rounded-full border border-white/[0.1] shadow-sm ${size}`}>
      <Image src={resolvedAvatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
    </div>
  ) : (
    <div
      className={`${size} flex items-center justify-center rounded-full border border-white/[0.08] bg-slate-800 text-xs font-bold text-slate-300 shadow-sm`}
    >
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}
