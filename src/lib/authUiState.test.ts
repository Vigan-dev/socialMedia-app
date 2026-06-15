import { describe, expect, it, vi } from 'vitest';
import {
  cookieConsentStorageKey,
  loginSuccessStorageKey,
  markLoginSuccess,
} from './authUiState';

describe('auth UI state', () => {
  it('marks a login as successful and forces the cookie notice to show again', () => {
    const localStorageRef = {
      removeItem: vi.fn(),
      setItem: vi.fn(),
    };
    const sessionStorageRef = {
      removeItem: vi.fn(),
      setItem: vi.fn(),
    };

    markLoginSuccess(localStorageRef, sessionStorageRef);

    expect(localStorageRef.removeItem).toHaveBeenCalledWith(cookieConsentStorageKey);
    expect(sessionStorageRef.setItem).toHaveBeenCalledWith(loginSuccessStorageKey, 'true');
  });
});
