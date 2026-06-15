type StorageLike = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

const legacySupportSessionStorageKey = 'support-session-id';

export function getSupportSessionStorageKey(userId: string | null) {
  return userId ? `${legacySupportSessionStorageKey}:${userId}` : null;
}

export function clearLegacySupportSession(storage: Pick<Storage, 'removeItem'>) {
  storage.removeItem(legacySupportSessionStorageKey);
}

export function readSupportSession(
  storage: Pick<Storage, 'getItem'>,
  userId: string | null,
) {
  const storageKey = getSupportSessionStorageKey(userId);
  return storageKey ? storage.getItem(storageKey) : null;
}

export function writeSupportSession(
  storage: StorageLike,
  userId: string | null,
  sessionId: string,
) {
  const storageKey = getSupportSessionStorageKey(userId);
  if (storageKey) storage.setItem(storageKey, sessionId);
}

export function clearSupportSession(
  storage: Pick<Storage, 'removeItem'>,
  userId: string | null,
) {
  const storageKey = getSupportSessionStorageKey(userId);
  if (storageKey) storage.removeItem(storageKey);
}
