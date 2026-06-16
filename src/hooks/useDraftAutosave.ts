'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type DraftStatus = 'idle' | 'restored' | 'saved';

type UseDraftAutosaveInput = {
  storageKey: string;
  saveDelay?: number;
};

type UseDraftAutosaveResult = {
  clearDraft: () => void;
  draftStatus: DraftStatus;
  resetValue: (nextValue?: string) => void;
  setValue: Dispatch<SetStateAction<string>>;
  value: string;
};

export function useDraftAutosave({
  storageKey,
  saveDelay = 700,
}: UseDraftAutosaveInput): UseDraftAutosaveResult {
  const [value, setStoredValue] = useState('');
  const [draftStatus, setDraftStatus] = useState<DraftStatus>('idle');
  const hasLoadedDraft = useRef(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(storageKey);
    hasLoadedDraft.current = true;

    if (!savedDraft) {
      setStoredValue('');
      setDraftStatus('idle');
      return;
    }

    setStoredValue(savedDraft);
    setDraftStatus('restored');
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoadedDraft.current) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const draft = value.trim();

      if (!draft) {
        window.localStorage.removeItem(storageKey);
        setDraftStatus('idle');
        return;
      }

      window.localStorage.setItem(storageKey, value);
      setDraftStatus('saved');
    }, saveDelay);

    return () => window.clearTimeout(timeoutId);
  }, [saveDelay, storageKey, value]);

  const setValue: Dispatch<SetStateAction<string>> = useCallback((nextValue) => {
    setStoredValue((currentValue) =>
      typeof nextValue === 'function' ? nextValue(currentValue) : nextValue,
    );
  }, []);

  const resetValue = useCallback((nextValue = '') => {
    skipNextSave.current = true;
    setStoredValue(nextValue);
    setDraftStatus('idle');
  }, []);

  const clearDraft = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setDraftStatus('idle');
  }, [storageKey]);

  return {
    clearDraft,
    draftStatus,
    resetValue,
    setValue,
    value,
  };
}
