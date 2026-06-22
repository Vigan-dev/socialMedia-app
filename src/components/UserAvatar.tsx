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
    <div className={`relative overflow-hidden rounded-full border border-white/[0.14] shadow-[0_10px_24px_rgba(0,0,0,0.2)] ring-2 ring-cyan-300/10 ${size}`}>
      <Image src={resolvedAvatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
    </div>
  ) : (
    <div
      className={`${size} flex items-center justify-center rounded-full border border-white/[0.1] bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-slate-200 shadow-[0_10px_24px_rgba(0,0,0,0.2)] ring-2 ring-cyan-300/10`}
    >
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}
