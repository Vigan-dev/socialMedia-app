import { describe, expect, it } from 'vitest';
import { appConfig } from './config';
import { resolveMediaUrl } from './mediaUrls';

describe('resolveMediaUrl', () => {
  it('prefixes root-relative upload paths with the API base URL', () => {
    expect(resolveMediaUrl('/uploads/post-media/photo.png')).toBe(
      `${appConfig.apiBaseUrl.replace(/\/$/, '')}/uploads/post-media/photo.png`,
    );
  });

  it('leaves absolute and inline URLs unchanged', () => {
    expect(resolveMediaUrl('https://api.example.com/uploads/avatar.png')).toBe(
      'https://api.example.com/uploads/avatar.png',
    );
    expect(resolveMediaUrl('data:image/png;base64,abc')).toBe(
      'data:image/png;base64,abc',
    );
    expect(resolveMediaUrl('blob:https://app.example.com/id')).toBe(
      'blob:https://app.example.com/id',
    );
  });

  it('returns null for empty values', () => {
    expect(resolveMediaUrl(null)).toBeNull();
    expect(resolveMediaUrl(undefined)).toBeNull();
    expect(resolveMediaUrl('')).toBeNull();
  });
});
