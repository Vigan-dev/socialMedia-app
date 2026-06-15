import { describe, expect, it } from 'vitest';
import {
  buildHomeTabsForRole,
  canAccessAdmin,
  canAccessModeration,
} from './roleNavigation';

describe('role navigation', () => {
  it('keeps regular users out of moderation and admin tabs', () => {
    expect(canAccessModeration('user')).toBe(false);
    expect(canAccessAdmin('user')).toBe(false);
    expect(buildHomeTabsForRole('user')).not.toContain('Moderation');
    expect(buildHomeTabsForRole('user')).not.toContain('Admin');
  });

  it('allows moderators to see moderation but not admin', () => {
    expect(canAccessModeration('moderator')).toBe(true);
    expect(canAccessAdmin('moderator')).toBe(false);
    expect(buildHomeTabsForRole('moderator')).toContain('Moderation');
    expect(buildHomeTabsForRole('moderator')).not.toContain('Admin');
  });

  it('allows admins to see moderation and admin tabs', () => {
    expect(canAccessModeration('admin')).toBe(true);
    expect(canAccessAdmin('admin')).toBe(true);
    expect(buildHomeTabsForRole('admin')).toContain('Moderation');
    expect(buildHomeTabsForRole('admin')).toContain('Admin');
  });
});
