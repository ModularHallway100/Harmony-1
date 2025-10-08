# Theme Integration and Persistence Enhancement Plan

## Overview
This plan outlines the steps needed to enhance theme integration and persistence across the Harmony application, particularly for the settings page.

## Current Issues
1. Theme switcher exists but has limited integration
2. Theme persistence works but needs improvement
3. No theme preview functionality
4. Custom theme options are missing
5. Theme transitions could be smoother
6. Theme state management could be more robust

## Current Theme Implementation Analysis

### Existing Components:
- `useTheme` hook in `Harmony-1/src/hooks/use-theme.ts`
- `ThemeSwitcher` component in `Harmony-1/src/components/ThemeSwitcher.tsx`
- Theme CSS variables in `Harmony-1/src/index.css`

### Current Functionality:
- Basic light/dark/system theme switching
- LocalStorage persistence
- System preference detection
- Basic CSS variable implementation

## Implementation Plan

### 1. Enhance Theme Hook

#### File: `Harmony-1/src/hooks/use-theme.ts`

**Current Implementation:**
```typescript
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
```

**Enhanced Implementation:**
```typescript
import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
type CustomTheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedCustomTheme = localStorage.getItem('custom-theme');
    
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    
    if (savedCustomTheme) {
      try {
        setCustomTheme(JSON.parse(savedCustomTheme));
      } catch (error) {
        console.error('Failed to parse custom theme:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      
      if (theme === 'dark') {
        isDark = true;
        setIsSystemTheme(false);
      } else if (theme === 'light') {
        isDark = false;
        setIsSystemTheme(false);
      } else {
        // System theme
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsSystemTheme(true);
      }

      // Apply theme class
      document.documentElement.classList.toggle('dark', isDark);

      // Apply custom theme if exists
      if (customTheme) {
        applyCustomTheme(customTheme, isDark);
      } else {
        applyDefaultTheme(isDark);
      }
    };

    applyTheme();
  }, [theme, customTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const isDark = mediaQuery.matches;
        document.documentElement.classList.toggle('dark', isDark);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  }, []);

  const setCustomThemeColors = useCallback((colors: CustomTheme) => {
    setCustomTheme(colors);
    localStorage.setItem('custom-theme', JSON.stringify(colors));
  }, []);

  const resetToDefault = useCallback(() => {
    setCustomTheme(null);
    localStorage.removeItem('custom-theme');
  }, []);

  const getSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  return {
    theme,
    setTheme,
    customTheme,
    setCustomThemeColors,
    resetToDefault,
    isSystemTheme,
    getSystemTheme,
  };
}

function applyCustomTheme(theme: CustomTheme, isDark: boolean) {
  const root = document.documentElement;
  
  // Custom theme colors
  root.style.setProperty('--custom-primary', theme.primary);
  root.style.setProperty('--custom-secondary', theme.secondary);
  root.style.setProperty('--custom-accent', theme.accent);
  root.style.setProperty('--custom-background', theme.background);
  root.style.setProperty('--custom-foreground', theme.foreground);
}

function applyDefaultTheme(isDark: boolean) {
  const root = document.documentElement;
  
  // Remove custom theme properties
  root.style.removeProperty('--custom-primary');
  root.style.removeProperty('--custom-secondary');
  root.style.removeProperty('--custom-accent');
  root.style.removeProperty('--custom-background');
  root.style.removeProperty('--custom-foreground');
}
```

### 2. Enhanced Theme Switcher Component

#### File: `Harmony-1/src/components/ThemeSwitcher.tsx`

**Enhanced Implementation:**
```typescript
import React, { useState } from 'react';
import { Sun, Moon, Laptop, Palette, Settings, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export const ThemeSwitcher: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    customTheme, 
    setCustomThemeColors, 
    resetToDefault,
    isSystemTheme,
    getSystemTheme 
  } = useTheme();
  
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme>(theme);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const themes = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Laptop },
  ] as const;

  const presetThemes = [
    { name: 'Default', colors: null },
    { name: 'Ocean', colors: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#14b8a6', background: '#f0f9ff', foreground: '#0c4a6e' } },
    { name: 'Sunset', colors: { primary: '#f97316', secondary: '#f59e0b', accent: '#ef4444', background: '#fff7ed', foreground: '#7c2d12' } },
    { name: 'Forest', colors: { primary: '#22c55e', secondary: '#16a34a', accent: '#84cc16', background: '#f0fdf4', foreground: '#14532d' } },
    { name: 'Royal', colors: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a855f7', background: '#faf5ff', foreground: '#4c1d95' } },
  ];

  const handleThemePreview = (newTheme: Theme) => {
    setPreviewTheme(newTheme);
    setIsPreviewing(true);
    
    // Apply preview theme
    let isDark = false;
    if (newTheme === 'dark') isDark = true;
    else if (newTheme === 'light') isDark = false;
    else isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    document.documentElement.classList.toggle('dark', isDark);
  };

  const applyPreviewTheme = () => {
    setTheme(previewTheme);
    setIsPreviewing(false);
  };

  const cancelPreviewTheme = () => {
    setTheme(theme);
    setIsPreviewing(false);
  };

  const handlePresetSelect = (colors: any) => {
    if (colors) {
      setCustomThemeColors(colors);
    } else {
      resetToDefault();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Theme</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCustomizer(!showCustomizer)}
        >
          <Palette className="w-4 h-4" />
        </Button>
      </div>

      {/* Theme Selection */}
      <div className="flex items-center space-x-2 rounded-lg bg-neutral-800 p-1">
        {themes.map((item) => (
          <Button
            key={item.value}
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isPreviewing) {
                setPreviewTheme(item.value);
              } else {
                setTheme(item.value);
              }
            }}
            className={cn(
              'w-full flex items-center justify-center gap-2 transition-colors duration-200',
              (isPreviewing ? previewTheme === item.value : theme === item.value)
                ? 'bg-neutral-600 text-white'
                : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
            {isSystemTheme && item.value === 'system' && (
              <span className="text-xs text-gray-500">
                ({getSystemTheme()})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Theme Preview */}
      {isPreviewing && (
        <Card className="bg-neutral-900/50 border-cyan-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400 mb-3">Previewing theme changes</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={applyPreviewTheme}>
                Apply
              </Button>
              <Button size="sm" variant="outline" onClick={cancelPreviewTheme}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Theme Customizer */}
      {showCustomizer && (
        <Card className="bg-neutral-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="font-mono text-lg text-glow-purple flex items-center gap-2">
              <Palette /> Custom Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Themes */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Preset Themes</h4>
              <div className="grid grid-cols-3 gap-2">
                {presetThemes.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(preset.colors)}
                    className="h-8 text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            {customTheme && (
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">Custom Colors</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: customTheme.primary }}
                    />
                    <span>Primary: {customTheme.primary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: customTheme.secondary }}
                    />
                    <span>Secondary: {customTheme.secondary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: customTheme.accent }}
                    />
                    <span>Accent: {customTheme.accent}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetToDefault}
                  className="mt-2"
                >
                  Reset to Default
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

### 3. Update CSS Variables for Enhanced Theming

#### File: `Harmony-1/src/index.css`

**Enhanced CSS Variables:**
```css
@layer base {
  :root {
    /* Existing variables */
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 300 100% 50%; /* Magenta */
    --primary-foreground: 0 0% 98%;
    --secondary: 180 100% 50%; /* Cyan */
    --secondary-foreground: 240 10% 3.9%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 80 95% 55%; /* Lime */
    --accent-foreground: 240 10% 3.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 300 100% 50%;
    --radius: 0.5rem;

    /* Custom theme variables */
    --custom-primary: var(--primary);
    --custom-secondary: var(--secondary);
    --custom-accent: var(--accent);
    --custom-background: var(--background);
    --custom-foreground: var(--foreground);
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 300 100% 50%;
    --primary-foreground: 0 0% 98%;
    --secondary: 180 100% 50%;
    --secondary-foreground: 240 10% 3.9%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 80 95% 55%;
    --accent-foreground: 240 10% 3.9%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 300 100% 50%;

    /* Custom theme variables for dark mode */
    --custom-primary: var(--primary);
    --custom-secondary: var(--secondary);
    --custom-accent: var(--accent);
    --custom-background: var(--background);
    --custom-foreground: var(--foreground);
  }
}

/* Smooth theme transitions */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

### 4. Add Theme Persistence API

#### File: `Harmony-1/worker/userRoutes.ts`

**New Theme API Endpoints:**
```typescript
// Get user theme preferences
app.get('/api/user/theme', async (c) => {
  try {
    const theme = c.env.THEME_PREFERENCES?.get(c.req.raw.headers.get('Authorization') || '');
    return c.json({ success: true, data: theme });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get theme' }, 500);
  }
});

// Update user theme preferences
app.put('/api/user/theme', async (c) => {
  try {
    const { theme, customTheme } = await c.req.json();
    // Save theme preferences to database
    // For now, just return success
    return c.json({ success: true, data: { theme, customTheme } });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to update theme' }, 500);
  }
});
```

## Implementation Steps

### Phase 1: Enhance Theme Hook
1. Upgrade useTheme hook with new features
2. Add custom theme support
3. Implement system theme detection
4. Add theme persistence improvements

### Phase 2: Enhanced Theme Switcher
1. Upgrade ThemeSwitcher component
2. Add theme preview functionality
3. Implement preset themes
4. Add custom color picker

### Phase 3: CSS Enhancements
1. Update CSS variables
2. Add smooth transitions
3. Implement custom theme support
4. Add responsive design considerations

### Phase 4: API Integration
1. Create theme API endpoints
2. Add theme persistence
3. Implement user-specific themes
4. Add error handling

## Expected Outcome
- Enhanced theme system with custom colors
- Theme preview functionality before applying
- Preset themes for quick customization
- Smooth theme transitions
- Improved persistence across sessions
- User-specific theme preferences
- Better system integration

## Dependencies
- Existing CSS variables system
- React hooks and state management
- LocalStorage API
- Media queries for system detection
- Hono API framework for backend

## Timeline
- Phase 1: 20-30 minutes
- Phase 2: 25-35 minutes
- Phase 3: 15-20 minutes
- Phase 4: 15-20 minutes
- Total: 75-105 minutes