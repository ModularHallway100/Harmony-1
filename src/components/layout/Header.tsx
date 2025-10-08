import React, { useState, useEffect } from 'react';
import { Search, User, Library, Settings, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { UserButton } from '@clerk/clerk-sdk-react';
const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const { user, signOut } = useClerkUser();
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/search');
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="flex items-center justify-between p-4 sm:px-6 lg:px-8 bg-neutral-950/50 backdrop-blur-sm border-b border-cyan/20">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <Input
          type="search"
          placeholder="Search for artists, tracks, or playlists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 bg-neutral-900 border-neutral-700 focus:ring-cyan-500 focus:border-cyan-500 rounded-md"
        />
      </form>
      <div className="ml-4 flex items-center space-x-2">
        {user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-800">
                  <User className="w-5 h-5 text-gray-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-700 text-white" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-700" />
                <DropdownMenuItem asChild>
                  <Link to="/library" className="cursor-pointer">
                    <Library className="mr-2 h-4 w-4" />
                    <span>Your Library</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-700" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/sign-in')}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/sign-up')}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;