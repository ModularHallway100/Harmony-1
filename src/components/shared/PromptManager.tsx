import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Share2, 
  Download,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  Star,
  Eye,
  Users,
  Tag,
  Music,
  Target,
  Calendar,
  BarChart3,
  Copy,
  Heart,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';
import { usePromptStore } from '@/store/prompt-store';

interface PromptManagerProps {
  onClose?: () => void;
}

const PromptManager: React.FC<PromptManagerProps> = ({ onClose }) => {
  const {
    prompts,
    collections,
    templates,
    isLoading,
    error,
    currentPrompt,
    uiState,
    
    // Actions
    fetchPrompts,
    fetchCollections,
    fetchTemplates,
    deletePrompt,
    toggleFavorite,
    toggleLike,
    updatePrompt,
    setActiveTab,
    setSelectedPrompt,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    setFilter,
    clearFilters,
    exportPrompt,
    setError,
    setLoading
  } = usePromptStore();

  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedPromptForAction, setSelectedPromptForAction] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [sortBy, setSortBy] = useState(uiState.sortBy);
  const [sortOrder, setSortOrder] = useState(uiState.sortOrder);

  // Initialize data
  useEffect(() => {
    fetchPrompts();
    fetchCollections();
    fetchTemplates();
  }, []);

  // Handle prompt actions
  const handleDeletePrompt = async (promptId: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deletePrompt(promptId);
        setError(null);
      } catch (err) {
        setError('Failed to delete prompt');
      }
    }
  };

  const handleToggleFavorite = async (promptId: string) => {
    try {
      await toggleFavorite(promptId);
    } catch (err) {
      setError('Failed to toggle favorite');
    }
  };

  const handleExportPrompt = async (promptId: string, platform: string) => {
    try {
      const exportedContent = await exportPrompt(promptId, platform);
      
      // Create and download file
      const blob = new Blob([exportedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const prompt = prompts.find(p => p.id === promptId);
      a.download = `${prompt?.title || 'prompt'}-${platform}-prompt.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export prompt');
    }
  };

  const handleCopyPrompt = async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      try {
        await navigator.clipboard.writeText(prompt.refinedPrompt);
        setError('Prompt copied to clipboard!');
      } catch (err) {
        setError('Failed to copy prompt');
      }
    }
  };

  // Filter and sort prompts
  const filteredPrompts = React.useMemo(() => {
    let filtered = [...prompts];

    // Apply search
    if (uiState.searchQuery) {
      filtered = filtered.filter(prompt => 
        prompt.title.toLowerCase().includes(uiState.searchQuery.toLowerCase()) ||
        prompt.basePrompt.toLowerCase().includes(uiState.searchQuery.toLowerCase()) ||
        prompt.refinedPrompt.toLowerCase().includes(uiState.searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(uiState.searchQuery.toLowerCase()))
      );
    }

    // Apply filters
    if (uiState.filters.genre) {
      filtered = filtered.filter(prompt => prompt.genre === uiState.filters.genre);
    }
    if (uiState.filters.mood) {
      filtered = filtered.filter(prompt => prompt.mood === uiState.filters.mood);
    }
    if (uiState.filters.optimizationLevel) {
      filtered = filtered.filter(prompt => prompt.optimizationLevel === uiState.filters.optimizationLevel);
    }
    if (uiState.filters.collectionId) {
      filtered = filtered.filter(prompt => prompt.collectionId === uiState.filters.collectionId);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updated_at':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'effectiveness_score':
          aValue = a.effectivenessScore || 0;
          bValue = b.effectivenessScore || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'like_count':
          aValue = a.likeCount;
          bValue = b.likeCount;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [prompts, uiState.searchQuery, uiState.filters, sortBy, sortOrder]);

  // Get unique values for filters
  const uniqueGenres = [...new Set(prompts.map(p => p.genre))];
  const uniqueMoods = [...new Set(prompts.map(p => p.mood))];
  const uniqueOptimizationLevels = [...new Set(prompts.map(p => p.optimizationLevel))];

  // Platform options for export
  const exportPlatforms = [
    { value: 'suno', label: 'Suno AI', icon: '🎵' },
    { value: 'udio', label: 'Udio', icon: '🎶' },
    { value: 'stable-audio', label: 'Stable Audio', icon: '🎼' },
    { value: 'meta-music-gen', label: 'Meta MusicGen', icon: '🎹' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Prompt Manager</h1>
            <p className="text-gray-400">Manage your saved prompts and collections</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="border-gray-700"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Prompt
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search prompts..."
                  value={uiState.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-900 border-gray-700 pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={uiState.filters.genre} onValueChange={(value) => setFilter('genre', value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 w-32">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genres</SelectItem>
                    {uniqueGenres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={uiState.filters.mood} onValueChange={(value) => setFilter('mood', value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 w-32">
                    <SelectValue placeholder="Mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Moods</SelectItem>
                    {uniqueMoods.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={uiState.filters.optimizationLevel} onValueChange={(value) => setFilter('optimizationLevel', value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 w-40">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {uniqueOptimizationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Results count and sort */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <span className="text-sm text-gray-400">
                {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="effectiveness_score">Quality</SelectItem>
                    <SelectItem value="like_count">Likes</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="border-gray-700"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={uiState.activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border-gray-700">
            <TabsTrigger value="manage" className="text-cyan-400 data-[state=active]:bg-cyan-500/20">
              <Music className="w-4 h-4 mr-2" />
              Prompts ({prompts.length})
            </TabsTrigger>
            <TabsTrigger value="collections" className="text-purple-400 data-[state=active]:bg-purple-500/20">
              <FolderOpen className="w-4 h-4 mr-2" />
              Collections ({collections.length})
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-pink-400 data-[state=active]:bg-pink-500/20">
              <Target className="w-4 h-4 mr-2" />
              Templates ({templates.length})
            </TabsTrigger>
          </TabsList>

          {/* Prompts Tab */}
          <TabsContent value="manage" className="space-y-6">
            {filteredPrompts.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-12 pb-12 text-center">
                  <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
                  <p className="text-gray-400 mb-6">
                    {prompts.length === 0 
                      ? 'Create your first prompt to get started!' 
                      : 'Try adjusting your filters or search terms.'
                    }
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Prompt
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }>
                {filteredPrompts.map((prompt) => (
                  <Card 
                    key={prompt.id} 
                    className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer group"
                    onClick={() => setSelectedPrompt(prompt.id)}
                  >
                    <CardContent className="pt-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate mb-1">
                            {prompt.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(prompt.createdAt).toLocaleDateString()}
                            </span>
                            {prompt.likeCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-red-400" />
                                {prompt.likeCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                            <DropdownMenuItem onClick={() => handleCopyPrompt(prompt.id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Prompt
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFavorite(prompt.id)}>
                              <Star className={`w-4 h-4 mr-2 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              {prompt.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedPromptForAction(prompt.id)}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Preview */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                          {prompt.refinedPrompt}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs bg-cyan-900/30 text-cyan-300">
                            {prompt.genre}
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-purple-900/30 text-purple-300">
                            {prompt.mood}
                          </Badge>
                          {prompt.tempo && (
                            <Badge variant="secondary" className="text-xs bg-lime-900/30 text-lime-300">
                              {prompt.tempo} BPM
                            </Badge>
                          )}
                          {prompt.optimizationLevel && (
                            <Badge variant="secondary" className="text-xs bg-pink-900/30 text-pink-300">
                              {prompt.optimizationLevel}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {prompt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {prompt.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {tag}
                            </Badge>
                          ))}
                          {prompt.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              +{prompt.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                          {prompt.isFavorite && (
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          )}
                          {prompt.isPublic && (
                            <Eye className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="flex gap-1">
                          {exportPlatforms.slice(0, 2).map((platform) => (
                            <TooltipProvider key={platform.value}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExportPrompt(prompt.id, platform.value);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    {platform.icon}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Export to {platform.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePrompt(prompt.id);
                            }}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id} className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white">{collection.name}</h3>
                      <Button variant="ghost" size="icon">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FolderOpen className="w-3 h-3" />
                        <span>{collection.promptCount} prompts</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {collection.isPublic && (
                          <>
                            <Eye className="w-3 h-3 text-green-400" />
                            <span>Public</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="bg-gray-800/50 border-gray-700 hover:border-pink-500/50 transition-colors">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Badge variant="secondary" className="bg-cyan-900/30 text-cyan-300">
                        {template.genre}
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-900/30 text-purple-300">
                        {template.mood}
                      </Badge>
                    </div>
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>
              Create a new music prompt from scratch or use a template.
            </DialogDescription>
          </DialogHeader>
          {/* This would contain the form for creating prompts */}
          <div className="space-y-4">
            <p className="text-gray-400">Prompt creation form would be implemented here...</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)} className="bg-cyan-600 hover:bg-cyan-700">
              Create Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Share Prompt</DialogTitle>
            <DialogDescription>
              Share your prompt with other users or make it public.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                <span>Make prompt public</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                <span>Allow others to copy and modify</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Share Link</label>
              <Input 
                value="https://harmony.app/prompt/abc123" 
                readOnly 
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowShareDialog(false)} className="bg-purple-600 hover:bg-purple-700">
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptManager;