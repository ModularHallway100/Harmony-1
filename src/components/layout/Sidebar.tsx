import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bot, Library, Search, PlusCircle, ListPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreatePlaylistDialog from '@/components/shared/CreatePlaylistDialog';
import { Button } from '@/components/ui/button';
const Sidebar: React.FC = () => {
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const navItems = [
    { to: '/', icon: Home, label: 'Home', glow: 'shadow-glow-magenta' },
    { to: '/search', icon: Search, label: 'Search', glow: 'shadow-glow-magenta' },
    { to: '/library', icon: Library, label: 'Your Library', glow: 'shadow-glow-magenta' },
  ];
  const toolItems = [
    { to: '/prompt-rewriter', icon: Bot, label: 'Prompt Rewriter', glow: 'shadow-glow-cyan' },
    { to: '/create-artist', icon: PlusCircle, label: 'Create Artist', glow: 'shadow-glow-cyan' },
  ];
  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-black/50 border-r border-magenta/20 p-6">
        <div className="flex items-center space-x-2 mb-8">
          <h1 className="text-2xl font-mono font-bold text-glow-magenta">RetroWave AI</h1>
        </div>
        <div className="flex flex-col justify-between flex-1">
          <nav className="space-y-8">
            <div>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center space-x-3 px-4 py-2 rounded-md transition-all duration-200 font-semibold',
                          isActive
                            ? 'bg-magenta/20 text-white text-glow-magenta'
                            : 'text-gray-400 hover:bg-neutral-800/50 hover:text-white'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={cn('w-5 h-5', isActive && item.glow)} />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="px-4 text-sm font-semibold text-gray-500 font-mono tracking-wider uppercase mb-2">Tools</h2>
              <ul className="space-y-2">
                {toolItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center space-x-3 px-4 py-2 rounded-md transition-all duration-200 font-semibold',
                          isActive
                            ? 'bg-cyan/20 text-white text-glow-cyan'
                            : 'text-gray-400 hover:bg-neutral-800/50 hover:text-white'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={cn('w-5 h-5', isActive && item.glow)} />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <Button
                    onClick={() => setIsPlaylistDialogOpen(true)}
                    className="w-full justify-start flex items-center space-x-3 px-4 py-2 rounded-md transition-all duration-200 font-semibold text-gray-400 hover:bg-neutral-800/50 hover:text-white"
                    variant="ghost"
                  >
                    <ListPlus className="w-5 h-5" />
                    <span>Create Playlist</span>
                  </Button>
                </li>
              </ul>
            </div>
          </nav>
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Built with ❤️ at Cloudflare</p>
          </div>
        </div>
      </aside>
      <CreatePlaylistDialog isOpen={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen} />
    </>
  );
};
export default Sidebar;