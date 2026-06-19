import { appConfig } from '@/lib/config';
import {
  decodePost,
  decodePosts,
  decodePublicProfile,
  type PublicProfile,
} from '@/lib/apiSchemas';
import type { Post } from '@/types/feed';

function buildApiUrl(path: string) {
  return `${appConfig.apiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function fetchPublicJson(path: string) {
  const response = await fetch(buildApiUrl(path), {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<unknown>;
}

export async function getPublicProfile(
  username: string,
): Promise<PublicProfile | null> {
  const data = await fetchPublicJson(
    `/public/users/${encodeURIComponent(username)}`,
  );
  if (!data) return null;

  return decodePublicProfile(data);
}

export async function getPublicPostsByUsername(
  username: string,
): Promise<Post[] | null> {
  const data = await fetchPublicJson(
    `/posts/by-user/${encodeURIComponent(username)}`,
  );
  if (!data) return null;

  return decodePosts(data);
}

export async function getPublicPost(id: string): Promise<Post | null> {
  const data = await fetchPublicJson(`/posts/${encodeURIComponent(id)}`);
  if (!data) return null;

  return decodePost(data);
}
