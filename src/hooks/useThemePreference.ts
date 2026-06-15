'use client';

import { useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export function useThemePreference() {
  const [accentColor, setAccentColor] = useState('indigo');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('versatile-theme');

    if (savedTheme === 'light') {
      setThemeMode('light');
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('versatile-theme', themeMode);
  }, [themeMode]);

  const themeAccentIndicator =
    accentColor === 'indigo' ? 'bg-indigo-400' : accentColor === 'emerald' ? 'bg-emerald-400' : 'bg-rose-400';

  const themeAccent =
    accentColor === 'indigo'
      ? 'bg-indigo-600 hover:bg-indigo-500 text-indigo-400'
      : accentColor === 'emerald'
        ? 'bg-emerald-600 hover:bg-emerald-500 text-emerald-400'
        : 'bg-rose-600 hover:bg-rose-500 text-rose-400';

  return {
    accentColor,
    setAccentColor,
    setThemeMode,
    themeAccent,
    themeAccentIndicator,
    themeMode,
  };
}
