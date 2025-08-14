import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
};

export type ThemeState = {
  isDark: boolean;
  colors: ThemeColors;
  setDark: (val: boolean) => Promise<void>;
  toggle: () => Promise<void>;
};

export const [ThemeProvider, useTheme] = createContextHook<ThemeState>(() => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('theme');
        setIsDark(stored === 'dark');
      } catch (e) {
        console.log('[Theme] load error', e);
      }
    })();
  }, []);

  const setDark = React.useCallback(async (val: boolean) => {
    try {
      setIsDark(val);
      await AsyncStorage.setItem('theme', val ? 'dark' : 'light');
    } catch (e) {
      console.log('[Theme] persist error', e);
    }
  }, []);

  const toggle = React.useCallback(async () => {
    await setDark(!isDark);
  }, [isDark, setDark]);

  const colors: ThemeColors = useMemo(() => {
    return isDark
      ? {
          background: '#0b0f14',
          card: '#141a21',
          text: '#e6e6e6',
          muted: '#93a1ad',
          border: '#22303c',
          primary: '#FFA500',
        }
      : {
          background: '#f6f8ff',
          card: '#ffffff',
          text: '#0F172A',
          muted: '#475569',
          border: '#E6ECFF',
          primary: '#FFA500',
        };
  }, [isDark]);

  return React.useMemo(() => ({ isDark, colors, setDark, toggle }), [isDark, colors, setDark, toggle]);
});
