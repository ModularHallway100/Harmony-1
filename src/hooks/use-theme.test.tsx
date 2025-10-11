import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { useTheme } from './use-theme';
import { theme } from '../styles/theme';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock window.matchMedia
const matchMediaMock = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // Deprecated
  removeListener: jest.fn(), // Deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

describe('useTheme Hook', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup localStorage mock
    (global as any).localStorage = localStorageMock;
    
    // Setup window.matchMedia mock
    (global as any).matchMedia = matchMediaMock;
    
    // Default theme
    localStorageMock.getItem.mockReturnValue('light');
  });

  afterEach(() => {
    // Clean up
    localStorageMock.clear();
    matchMediaMock.mockClear();
  });

  it('should initialize with theme from localStorage', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should initialize with dark theme if localStorage has dark theme', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should initialize with system theme if localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    // Test with dark mode system preference
    matchMediaMock.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should toggle theme when toggleTheme is called', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    // Initial state is light theme
    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);

    // Toggle to dark theme
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Toggle back to light theme
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('should set theme when setTheme is called', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    // Set to dark theme
    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Set to light theme
    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');

    // Set to invalid theme (should default to light)
    act(() => {
      result.current.setTheme('invalid' as any);
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should handle system theme changes', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    // Initial state follows system preference
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);

    // Simulate system theme change
    act(() => {
      const mediaQueryList = matchMediaMock('(prefers-color-scheme: dark)');
      mediaQueryList.matches = false;
      mediaQueryList.dispatchEvent(new Event('change'));
    });

    // Theme should change to light
    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should not update theme when system theme changes if user has set explicit theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    // User explicitly sets theme to light
    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);

    // Simulate system theme change
    act(() => {
      const mediaQueryList = matchMediaMock('(prefers-color-scheme: dark)');
      mediaQueryList.matches = true;
      mediaQueryList.dispatchEvent(new Event('change'));
    });

    // Theme should remain light (user preference takes precedence)
    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should update theme when system theme changes if user has not set explicit theme', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    // Initial state follows system preference
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);

    // Simulate system theme change
    act(() => {
      const mediaQueryList = matchMediaMock('(prefers-color-scheme: dark)');
      mediaQueryList.matches = false;
      mediaQueryList.dispatchEvent(new Event('change'));
    });

    // Theme should change to light
    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);

    // Simulate system theme change back to dark
    act(() => {
      const mediaQueryList = matchMediaMock('(prefers-color-scheme: dark)');
      mediaQueryList.matches = true;
      mediaQueryList.dispatchEvent(new Event('change'));
    });

    // Theme should change back to dark
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage access denied');
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    // Should default to light theme
    expect(result.current.theme).toBe('light');
    expect(result.current.isDarkMode).toBe(false);

    // Should still be able to toggle theme
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should persist theme changes across component re-renders', () => {
    const { result, rerender } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    // Toggle theme
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);

    // Rerender component
    rerender();

    // Theme should persist
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should provide theme colors based on current theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    // Test light theme colors
    expect(result.current.colors.background).toBe(theme.colors.light.background);
    expect(result.current.colors.text).toBe(theme.colors.light.text);
    expect(result.current.colors.primary).toBe(theme.colors.light.primary);
    expect(result.current.colors.secondary).toBe(theme.colors.light.secondary);

    // Toggle to dark theme
    act(() => {
      result.current.toggleTheme();
    });

    // Test dark theme colors
    expect(result.current.colors.background).toBe(theme.colors.dark.background);
    expect(result.current.colors.text).toBe(theme.colors.dark.text);
    expect(result.current.colors.primary).toBe(theme.colors.dark.primary);
    expect(result.current.colors.secondary).toBe(theme.colors.dark.secondary);
  });

  it('should provide theme breakpoints', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    expect(result.current.breakpoints).toBe(theme.breakpoints);
  });

  it('should provide theme spacing', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    expect(result.current.spacing).toBe(theme.spacing);
  });

  it('should provide theme fonts', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    expect(result.current.fonts).toBe(theme.fonts);
  });

  it('should provide theme shadows', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    expect(result.current.shadows).toBe(theme.shadows);
  });

  it('should provide theme transitions', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    expect(result.current.transitions).toBe(theme.transitions);
  });

  it('should provide theme borderRadius', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      )
    });

    expect(result.current.borderRadius).toBe(theme.borderRadius);
  });
});