import { appConfig } from '@/lib/config';

export function resolveMediaUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${appConfig.apiBaseUrl.replace(/\/$/, '')}${url}`;
  }

  return url;
}
