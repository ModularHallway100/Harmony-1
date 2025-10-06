import { useState, useEffect } from 'react';
type Theme = 'light' | 'dark' | 'system';
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'system';
    }
    return (localStorage.getItem('theme') as Theme) || 'system';
  });
  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };
  return { theme, setTheme };
}