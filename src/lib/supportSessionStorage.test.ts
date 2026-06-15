import { describe, expect, it, vi } from 'vitest';
import {
  clearLegacySupportSession,
  clearSupportSession,
  getSupportSessionStorageKey,
  readSupportSession,
  writeSupportSession,
} from './supportSessionStorage';

describe('support session storage', () => {
  it('stores each support chat session under the current user id', () => {
    expect(getSupportSessionStorageKey('user-a')).toBe('support-session-id:user-a');
    expect(getSupportSessionStorageKey('user-b')).toBe('support-session-id:user-b');
    expect(getSupportSessionStorageKey(null)).toBeNull();
  });

  it('reads and writes only the active user support session', () => {
    const storage = {
      getItem: vi.fn((key: string) => (key === 'support-session-id:user-a' ? 'session-a' : null)),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    };

    expect(readSupportSession(storage, 'user-a')).toBe('session-a');
    expect(readSupportSession(storage, 'user-b')).toBeNull();

    writeSupportSession(storage, 'user-b', 'session-b');
    clearSupportSession(storage, 'user-a');

    expect(storage.setItem).toHaveBeenCalledWith('support-session-id:user-b', 'session-b');
    expect(storage.removeItem).toHaveBeenCalledWith('support-session-id:user-a');
  });

  it('clears the legacy shared support chat key so users do not inherit old chats', () => {
    const storage = {
      removeItem: vi.fn(),
    };

    clearLegacySupportSession(storage);

    expect(storage.removeItem).toHaveBeenCalledWith('support-session-id');
  });
});
