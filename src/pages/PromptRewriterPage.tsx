import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Clipboard, 
  Check, 
  Save, 
  FolderOpen, 
  Heart, 
  Share2,
  Download,
  Settings,
  History,
  BarChart3,
  FileText,
  Music,
  Clock,
  Users,
  Trash2,
  Edit3,
  Eye,
  Filter,
  Search,
  Plus,
  X,
  Tag,
  Sliders,
  Zap,
  Target,
  BookOpen,
  Palette,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';
import { usePromptStore } from '@/store/prompt-store';
import { useUserStore } from '@/store/user-store';

// Genre options
const GENRES = [
  'Electronic', 'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 
  'Ambient', 'Lo-fi', 'Synthwave', 'Cyberpunk', 'Vaporwave', 
  'Dance', 'House', 'Techno', 'Trance', 'Dubstep', 'Trap',
  'R&B', 'Soul', 'Funk', 'Blues', 'Country', 'Folk'
];

// Mood options
const MOODS = [
  'Energetic', 'Calm', 'Melancholic', 'Happy', 'Sad', 'Mysterious',
  'Romantic', 'Dark', 'Light', 'Uplifting', 'Dramatic', 'Peaceful',
  'Nostalgic', 'Futuristic', 'Organic', 'Mechanical', 'Dreamy', 'Intense'
];

// Instrumentation options
const INSTRUMENTATION_OPTIONS = [
  'Piano', 'Guitar', 'Drums', 'Bass', 'Strings', 'Synth',
  'Violin', 'Cello', 'Trumpet', 'Saxophone', 'Flute', 'Clarinet',
  'Vocals', 'Choir', 'Percussion', 'Keys', 'Bass Guitar', 'Electric Guitar',
  'Acoustic Guitar', 'Drum Machine', 'Sampler', 'Sequencer'
];

// Optimization levels
const OPTIMIZATION_LEVELS = [
  { value: 'basic', label: 'Basic Enhancement', description: 'Simple improvements' },
  { value: 'standard', label: 'Standard Enhancement', description: 'Good balance of detail' },
  { value: 'advanced', label: 'Advanced Enhancement', description: 'Detailed professional prompt' },
  { value: 'expert', label: 'Expert Enhancement', description: 'Comprehensive technical prompt' }
];

// Target platforms
const PLATFORMS = [
  { value: 'suno', label: 'Suno AI', icon: '🎵' },
  { value: 'udio', label: 'Udio', icon: '🎶' },
  { value: 'stable-audio', label: 'Stable Audio', icon: '🎼' },
  { value: 'meta-music-gen', label: 'Meta MusicGen', icon: '🎹' }
];

const PromptRewriterPage: React.FC = () => {
  const { 
    user 
  } = useUserStore();
  
  const {
    // State
    prompts,
    collections,
    templates,
    currentPrompt,
    isLoading,
    error,
    isRewriting,
    rewriteHistory,
    formState,
    uiState,
    
    // Actions
    updateFormState,
    resetForm,
    fetchPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    toggleLike,
    rewritePrompt,
    saveRewrite,
    fetchCollections,
    fetchTemplates,
    setActiveTab,
    setSelectedPrompt,
    setSelectedCollection,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    setFilter,
    clearFilters,
    setError,
    setLoading,
    setRewriting
  } = usePromptStore();

  // Local state
  const [copied, setCopied] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('suno');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [selectedInstrumentation, setSelectedInstrumentation] = useState<string[]>([]);
  const [showInstrumentationDialog, setShowInstrumentationDialog] = useState(false);

  // Initialize data
  useEffect(() => {
    fetchPrompts();
    fetchCollections();
    fetchTemplates();
  }, []);

  // Handle form changes
  const handleBasePromptChange = (value: string) => {
    updateFormState({ basePrompt: value });
  };

  const handleGenreChange = (value: string) => {
    updateFormState({ genre: value });
  };

  const handleMoodChange = (value: string) => {
    updateFormState({ mood: value });
  };

  const handleTempoChange = (value: string) => {
    updateFormState({ tempo: value });
  };

  const handleStyleChange = (value: string) => {
    updateFormState({ style: value });
  };

  const handleOptimizationLevelChange = (value: string) => {
    updateFormState({ optimizationLevel: value });
  };

  const handlePlatformToggle = (platform: string) => {
    const currentPlatforms = formState.targetPlatforms;
    const updatedPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    updateFormState({ targetPlatforms: updatedPlatforms });
  };

  const handleTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      updateFormState({ tags: updatedTags });
    }
  };

  const handleTagRemove = (tag: string) => {
    const updatedTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(updatedTags);
    updateFormState({ tags: updatedTags });
  };

  const handleCustomTagAdd = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      handleTagAdd(customTag.trim());
      setCustomTag('');
    }
  };

  const handleInstrumentationToggle = (instrument: string) => {
    const currentInstrumentation = selectedInstrumentation;
    const updatedInstrumentation = currentInstrumentation.includes(instrument)
      ? currentInstrumentation.filter(i => i !== instrument)
      : [...currentInstrumentation, instrument];
    setSelectedInstrumentation(updatedInstrumentation);
    updateFormState({ instrumentation: updatedInstrumentation });
  };

  // Rewrite prompt
  const handleRewrite = async () => {
    if (!formState.basePrompt.trim()) {
      setError('Please enter a base prompt.');
      return;
    }
    
    await rewritePrompt();
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const text = formState.refinedPrompt || formState.basePrompt;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Save prompt
  const handleSave = async (title: string, collectionId?: string) => {
    if (!title.trim()) {
      setError('Please enter a title for your prompt.');
      return;
    }
    
    await saveRewrite(title, collectionId);
    setShowSaveDialog(false);
  };

  // Export prompt
  const handleExport = async () => {
    if (!currentPrompt) return;
    
    try {
      const exportedContent = await usePromptStore.getState().exportPrompt(
        currentPrompt.id, 
        selectedPlatform
      );
      
      // Create and download file
      const blob = new Blob([exportedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentPrompt.title}-${selectedPlatform}-prompt.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportDialog(false);
    } catch (err) {
      setError('Failed to export prompt.');
    }
  };

  // Character count
  const basePromptLength = formState.basePrompt.length;
  const refinedPromptLength = formState.refinedPrompt.length;
  const maxPromptLength = 2000;

  // Check if form is valid for saving
  const isFormValid = formState.basePrompt.trim() && formState.refinedPrompt.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center py-8">
          <motion.h1 
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            AI Prompt Rewriter
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Transform your simple ideas into detailed, creative prompts for AI music generation across multiple platforms
          </motion.p>
        </header>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive" className="border-red-500/50 bg-red-900/20">
                <Bot className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800/50 border-cyan-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-400">
                  <Settings className="w-5 h-5" />
                  Your Idea
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base Prompt */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">Base Prompt</Label>
                  <Textarea
                    placeholder="e.g., A chill lo-fi beat with piano and rain sounds"
                    value={formState.basePrompt}
                    onChange={(e) => handleBasePromptChange(e.target.value)}
                    className="min-h-[120px] bg-gray-900 border-gray-700 focus:border-cyan-500 focus:ring-cyan-500 text-white resize-none"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{basePromptLength}/{maxPromptLength} characters</span>
                    {basePromptLength > maxPromptLength * 0.9 && (
                      <span className="text-red-400">Getting long!</span>
                    )}
                  </div>
                </div>

                {/* Genre and Mood */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Genre</Label>
                    <Select value={formState.genre} onValueChange={handleGenreChange}>
                      <SelectTrigger className="bg-gray-900 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Mood</Label>
                    <Select value={formState.mood} onValueChange={handleMoodChange}>
                      <SelectTrigger className="bg-gray-900 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOODS.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tempo */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">Tempo (BPM)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 120"
                    value={formState.tempo}
                    onChange={(e) => handleTempoChange(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>

                {/* Instrumentation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 font-medium">Instrumentation</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInstrumentationDialog(true)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstrumentation.map((instrument) => (
                      <Badge
                        key={instrument}
                        variant="secondary"
                        className="bg-cyan-900/30 text-cyan-300 hover:bg-cyan-900/50 cursor-pointer"
                        onClick={() => handleInstrumentationToggle(instrument)}
                      >
                        {instrument}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">Style/Description</Label>
                  <Input
                    placeholder="e.g., Modern pop with electronic elements"
                    value={formState.style}
                    onChange={(e) => handleStyleChange(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>

                {/* Optimization Level */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">Optimization Level</Label>
                  <Select value={formState.optimizationLevel} onValueChange={handleOptimizationLevelChange}>
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPTIMIZATION_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-gray-400">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Platforms */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">Target Platforms</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((platform) => (
                      <TooltipProvider key={platform.value}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={formState.targetPlatforms.includes(platform.value) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePlatformToggle(platform.value)}
                              className={formState.targetPlatforms.includes(platform.value) 
                                ? "bg-cyan-600 hover:bg-cyan-700" 
                                : "bg-gray-900 border-gray-700 hover:bg-gray-800"
                              }
                            >
                              <span className="mr-2">{platform.icon}</span>
                              {platform.label}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Optimize prompt for {platform.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 cursor-pointer"
                        onClick={() => handleTagRemove(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom tag"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomTagAdd()}
                      className="bg-gray-900 border-gray-700"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCustomTagAdd}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleRewrite}
                    disabled={isRewriting || !formState.basePrompt.trim()}
                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold py-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                  >
                    {isRewriting ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Rewriting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Rewrite Prompt
                      </>
                    )}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveDialog(true)}
                      disabled={!isFormValid}
                      className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopy}
                      className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates Card */}
            <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <BookOpen className="w-5 h-5" />
                  Quick Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.slice(0, 3).map((template) => (
                    <Button
                      key={template.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateFormState({
                          genre: template.genre,
                          mood: template.mood,
                          style: template.name,
                          instrumentation: template.templateStructure.instruments || []
                        });
                      }}
                      className="w-full justify-start text-left text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                    >
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-400">{template.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Output and Management */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={uiState.activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-gray-700">
                <TabsTrigger value="rewrite" className="text-cyan-400 data-[state=active]:bg-cyan-500/20">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Rewrite
                </TabsTrigger>
                <TabsTrigger value="manage" className="text-purple-400 data-[state=active]:bg-purple-500/20">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Manage
                </TabsTrigger>
                <TabsTrigger value="templates" className="text-pink-400 data-[state=active]:bg-pink-500/20">
                  <Target className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-green-400 data-[state=active]:bg-green-500/20">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Rewrite Tab */}
              <TabsContent value="rewrite" className="space-y-6">
                <Card className="bg-gray-800/50 border-lime-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lime-400">
                        <Bot className="w-5 h-5" />
                        AI Enhanced Prompt
                      </CardTitle>
                      {formState.refinedPrompt && (
                        <Button variant="ghost" size="icon" onClick={handleCopy}>
                          {copied ? (
                            <Check className="w-5 h-5 text-lime-400" />
                          ) : (
                            <Clipboard className="w-5 h-5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence mode="wait">
                      {isRewriting && !formState.refinedPrompt && (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400"
                        >
                          <Bot className="w-12 h-12 animate-pulse text-cyan-400" />
                          <p className="mt-4 font-semibold">AI is enhancing your prompt...</p>
                        </motion.div>
                      )}
                      
                      {!isRewriting && !formState.refinedPrompt && (
                        <motion.div
                          key="initial"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500"
                        >
                          <p>Your enhanced prompt will appear here after rewriting.</p>
                        </motion.div>
                      )}
                      
                      {formState.refinedPrompt && (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="prose prose-invert prose-p:text-gray-300 prose-strong:text-lime-400 bg-gray-900 p-4 rounded-md min-h-[200px] max-h-96 overflow-y-auto"
                        >
                          <p>{formState.refinedPrompt}</p>
                          {isRewriting && <span className="animate-pulse">|</span>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Character Count */}
                {formState.refinedPrompt && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Enhanced: {refinedPromptLength} characters</span>
                    <span>
                      Enhancement: {Math.round(((refinedPromptLength - basePromptLength) / basePromptLength) * 100)}% longer
                    </span>
                  </div>
                )}
              </TabsContent>

              {/* Manage Tab */}
              <TabsContent value="manage" className="space-y-6">
                {/* Search and Filters */}
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search prompts..."
                            value={uiState.searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-900 border-gray-700 pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select value={uiState.sortBy} onValueChange={(value) => setSortBy(value as any)}>
                          <SelectTrigger className="bg-gray-900 border-gray-700 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created_at">Date</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="effectiveness_score">Quality</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOrder = uiState.sortOrder === 'asc' ? 'desc' : 'asc';
                            setSortOrder(newOrder as any);
                          }}
                          className="border-gray-700"
                        >
                          {uiState.sortOrder === 'asc' ? '↑' : '↓'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prompts List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {prompts.length === 0 ? (
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="pt-6 text-center text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No prompts saved yet. Create your first prompt to get started!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    prompts.map((prompt) => (
                      <Card 
                        key={prompt.id} 
                        className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedPrompt(prompt.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1">{prompt.title}</h3>
                              <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                {prompt.refinedPrompt}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded">
                                  {prompt.genre}
                                </span>
                                <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                                  {prompt.mood}
                                </span>
                                {prompt.tempo && (
                                  <span className="bg-lime-900/30 text-lime-300 px-2 py-1 rounded">
                                    {prompt.tempo} BPM
                                  </span>
                                )}
                                {prompt.isFavorite && (
                                  <Heart className="w-3 h-3 text-red-400 fill-current" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(prompt.id);
                                }}
                                className={prompt.isFavorite ? "text-red-400" : "text-gray-400"}
                              >
                                <Heart className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowExportDialog(true);
                                  setSelectedPrompt(prompt.id);
                                }}
                                className="text-gray-400"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePrompt(prompt.id);
                                }}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors">
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-white mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span className="bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded">
                            {template.genre}
                          </span>
                          <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                            {template.mood}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateFormState({
                              genre: template.genre,
                              mood: template.mood,
                              style: template.name,
                              instrumentation: template.templateStructure.instruments || []
                            });
                          }}
                          className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Analytics features coming soon!</p>
                      <p className="text-sm mt-2">Track prompt effectiveness and generation success rates.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Save Your Prompt</DialogTitle>
              <DialogDescription>
                Give your enhanced prompt a title and optionally save it to a collection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt-title">Title</Label>
                <Input
                  id="prompt-title"
                  placeholder="Enter a title for your prompt..."
                  className="bg-gray-900 border-gray-700 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="collection-select">Collection (Optional)</Label>
                <Select>
                  <SelectTrigger className="bg-gray-900 border-gray-700 mt-1">
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Collection</SelectItem>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSave("Untitled Prompt")} className="bg-cyan-600 hover:bg-cyan-700">
                Save Prompt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Export Prompt</DialogTitle>
              <DialogDescription>
                Export your prompt for use with different AI music generation platforms.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform-select">Platform</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <span className="mr-2">{platform.icon}</span>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-gray-900 p-4 rounded-md">
                <h4 className="font-medium mb-2">Preview:</h4>
                <p className="text-sm text-gray-400 line-clamp-4">
                  {currentPrompt?.refinedPrompt || 'Select a prompt to preview...'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} className="bg-purple-600 hover:bg-purple-700">
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Instrumentation Selection Dialog */}
        <Dialog open={showInstrumentationDialog} onOpenChange={setShowInstrumentationDialog}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Select Instruments</DialogTitle>
              <DialogDescription>
                Choose the instruments you want to include in your prompt.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {INSTRUMENTATION_OPTIONS.map((instrument) => (
                <label key={instrument} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedInstrumentation.includes(instrument)}
                    onChange={() => handleInstrumentationToggle(instrument)}
                    className="rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>{instrument}</span>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInstrumentationDialog(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PromptRewriterPage;