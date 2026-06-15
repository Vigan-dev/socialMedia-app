export const cookieConsentStorageKey = 'versatile-cookie-consent';
export const loginSuccessStorageKey = 'versatile-login-success';

type StorageLike = Pick<Storage, 'removeItem' | 'setItem'>;

export function markLoginSuccess(
  localStorageRef: StorageLike,
  sessionStorageRef: StorageLike,
) {
  localStorageRef.removeItem(cookieConsentStorageKey);
  sessionStorageRef.setItem(loginSuccessStorageKey, 'true');
}
