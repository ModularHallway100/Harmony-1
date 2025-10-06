import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const themes = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Laptop },
  ] as const;
  return (
    <div className="flex items-center space-x-2 rounded-lg bg-neutral-800 p-1">
      {themes.map((item) => (
        <Button
          key={item.value}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(item.value)}
          className={cn(
            'w-full flex items-center justify-center gap-2 transition-colors duration-200',
            theme === item.value
              ? 'bg-neutral-600 text-white'
              : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
          )}
        >
          <item.icon className="w-4 h-4" />
          {item.name}
        </Button>
      ))}
    </div>
  );
};
export default ThemeSwitcher;