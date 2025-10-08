import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { artists, tracks, playlists, getArtistById, getTracksByArtistId } from '@/lib/mock-data';
import ContentCard from '@/components/shared/ContentCard';
import TrackList from '@/components/shared/TrackList';
import {
  Search as SearchIcon,
  Filter,
  Clock,
  TrendingUp,
  Heart,
  X,
  SlidersHorizontal,
  Music,
  User,
  ListMusic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock search history
const searchHistory = [
  'cyberpunk',
  'synthwave',
  'neon',
  'glitchard',
  'midnight drive',
  'electronic',
  'ai music',
  'retrowave'
];

// Mock search suggestions
const searchSuggestions = [
  'cyberpunk essentials',
  'cybernetic sunrise',
  'data diva',
  'digital ghost',
  'dusty circuits',
  'forgotten protocol',
  'glitchard',
  'hologram heart',
  'midnight drive',
  'neon gridlock',
  'neon nomad',
  'pixelated dreams',
  'wasteland wanderer'
];

// Available filters
const availableFilters = {
  genre: ['All', 'Synthwave', 'Cyberpunk Pop', 'Chillwave', 'Electronic', 'Ambient', 'Industrial'],
  mood: ['All', 'Energetic', 'Chill', 'Melancholic', 'Uplifting', 'Dark', 'Dreamy'],
  tempo: ['All', 'Slow', 'Medium', 'Fast'],
  year: ['All', '2024', '2023', '2022', '2021']
};

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    genre: 'All',
    mood: 'All',
    tempo: 'All',
    year: 'All'
  });
  const [searchHistoryList, setSearchHistoryList] = useState<string[]>(searchHistory);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setInputValue(query);
  }, [query]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Add to search history
      if (!searchHistoryList.includes(inputValue.trim())) {
        setSearchHistoryList(prev => [inputValue.trim(), ...prev.slice(0, 9)]);
      }
      
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
      setShowSuggestions(false);
    } else {
      navigate('/search');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Show suggestions when typing
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    
    // Add to search history
    if (!searchHistoryList.includes(suggestion)) {
      setSearchHistoryList(prev => [suggestion, ...prev.slice(0, 9)]);
    }
    
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };
  
  const handleSearchHistoryClick = (historyItem: string) => {
    setInputValue(historyItem);
    navigate(`/search?q=${encodeURIComponent(historyItem)}`);
  };
  
  const clearSearchHistory = () => {
    setSearchHistoryList([]);
  };
  
  const handleFilterChange = (filterType: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  const clearFilters = () => {
    setSelectedFilters({
      genre: 'All',
      mood: 'All',
      tempo: 'All',
      year: 'All'
    });
  };
  
  const getFilteredResults = (results: any[]) => {
    if (selectedFilters.genre === 'All' &&
        selectedFilters.mood === 'All' &&
        selectedFilters.tempo === 'All' &&
        selectedFilters.year === 'All') {
      return results;
    }
    
    return results.filter(item => {
      // This is a mock filtering logic - in a real app, this would be more sophisticated
      return true;
    });
  };
  
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return { artists: [], playlists: [], tracks: [] };
    }
    
    const lowerCaseQuery = query.toLowerCase();
    
    // Filter results
    const filteredArtists = artists.filter(a =>
      a.name.toLowerCase().includes(lowerCaseQuery) ||
      a.bio.toLowerCase().includes(lowerCaseQuery) ||
      a.genre.toLowerCase().includes(lowerCaseQuery)
    );
    
    const filteredPlaylists = playlists.filter(p =>
      p.title.toLowerCase().includes(lowerCaseQuery) ||
      p.description.toLowerCase().includes(lowerCaseQuery)
    );
    
    const filteredTracks = tracks.filter(t =>
      t.title.toLowerCase().includes(lowerCaseQuery) ||
      getArtistById(t.artistId)?.name.toLowerCase().includes(lowerCaseQuery)
    );
    
    // Apply additional filters
    return {
      artists: getFilteredResults(filteredArtists),
      playlists: getFilteredResults(filteredPlaylists),
      tracks: getFilteredResults(filteredTracks)
    };
  }, [query, selectedFilters]);
  
  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return searchSuggestions;
    
    const lowerCaseInput = inputValue.toLowerCase();
    return searchSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(lowerCaseInput)
    );
  }, [inputValue]);
  
  const hasResults = filteredResults.artists.length > 0 ||
                    filteredResults.playlists.length > 0 ||
                    filteredResults.tracks.length > 0;
  
  const activeFiltersCount = Object.values(selectedFilters).filter(
    value => value !== 'All'
  ).length;
  
  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
          <Input
            type="search"
            placeholder="What do you want to listen to?"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
            className="w-full pl-14 pr-20 p-6 text-lg bg-neutral-900 border-neutral-700 focus:ring-cyan-500 focus:border-cyan-500 rounded-md"
          />
          
          {/* Search Actions */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setInputValue('')}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
            
            <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-neutral-800 border-neutral-700 text-white">
                <DropdownMenuItem className="font-semibold">Filters</DropdownMenuItem>
                <DropdownMenuSeparator />
                
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Genre</label>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.genre.map(genre => (
                        <Badge
                          key={genre}
                          variant={selectedFilters.genre === genre ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleFilterChange('genre', genre)}
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.mood.map(mood => (
                        <Badge
                          key={mood}
                          variant={selectedFilters.mood === mood ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleFilterChange('mood', mood)}
                        >
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Tempo</label>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.tempo.map(tempo => (
                        <Badge
                          key={tempo}
                          variant={selectedFilters.tempo === tempo ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleFilterChange('tempo', tempo)}
                        >
                          {tempo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Year</label>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.year.map(year => (
                        <Badge
                          key={year}
                          variant={selectedFilters.year === year ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleFilterChange('year', year)}
                        >
                          {year}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {filteredSuggestions.length > 0 ? (
                <div className="p-2">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 rounded hover:bg-neutral-700 transition-colors flex items-center gap-3"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <SearchIcon className="w-4 h-4 text-gray-500" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </form>
        
        {/* Search History */}
        {searchHistoryList.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Recent searches</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearchHistory}
              className="text-gray-500 hover:text-white text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
        
        {searchHistoryList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {searchHistoryList.map((historyItem, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-neutral-800"
                onClick={() => handleSearchHistoryClick(historyItem)}
              >
                {historyItem}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Search Results */}
      {query && !hasResults && (
        <div className="text-center py-16">
          <h3 className="text-2xl font-bold">No results found for "{query}"</h3>
          <p className="text-neutral-400 mt-2">Please check your spelling or try another search.</p>
          <div className="mt-6">
            <p className="text-gray-500 mb-4">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {searchSuggestions.slice(0, 8).map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-neutral-800"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {hasResults && (
        <div className="space-y-12">
          {filteredResults.tracks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-mono font-bold text-glow-cyan flex items-center gap-2">
                  <Music className="w-6 h-6" />
                  Tracks
                  <span className="text-sm font-normal text-gray-500">({filteredResults.tracks.length})</span>
                </h2>
              </div>
              <TrackList tracks={filteredResults.tracks} />
            </section>
          )}
          
          {filteredResults.artists.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-mono font-bold text-glow-lime flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Artists
                  <span className="text-sm font-normal text-gray-500">({filteredResults.artists.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredResults.artists.map((artist) => (
                  <ContentCard key={artist.id} item={artist} type="artist" />
                ))}
              </div>
            </section>
          )}
          
          {filteredResults.playlists.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-mono font-bold text-glow-magenta flex items-center gap-2">
                  <ListMusic className="w-6 h-6" />
                  Playlists
                  <span className="text-sm font-normal text-gray-500">({filteredResults.playlists.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredResults.playlists.map((playlist) => (
                  <ContentCard key={playlist.id} item={playlist} type="playlist" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};