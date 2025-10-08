import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  GitBranch, 
  FileText, 
  Eye,
  RotateCcw,
  Trash2,
  Download,
  Share2,
  Tag,
  Calendar,
  User,
  Star,
  Filter,
  Search,
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { usePromptStore } from '@/store/prompt-store';

interface PromptHistoryProps {
  promptId?: string;
  onClose?: () => void;
}

interface Version {
  id: string;
  versionNumber: number;
  basePrompt: string;
  refinedPrompt: string;
  genre: string;
  mood: string;
  tempo?: number;
  instrumentation?: string[];
  style?: string;
  optimizationLevel: string;
  targetPlatforms: string[];
  tags: string[];
  changelog: string;
  createdAt: string;
  effectivenessScore?: number;
}

const PromptHistory: React.FC<PromptHistoryProps> = ({ promptId, onClose }) => {
  const {
    prompts,
    currentPrompt,
    isLoading,
    error,
    
    // Actions
    fetchPrompt,
    fetchPrompts,
    updatePrompt,
    setError,
    setLoading
  } = usePromptStore();

  // Local state
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'version'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get the current prompt
  const prompt = promptId 
    ? prompts.find(p => p.id === promptId) 
    : currentPrompt;

  // Load versions when prompt changes
  useEffect(() => {
    if (prompt) {
      loadVersions(prompt.id);
    }
  }, [prompt]);

  // Load versions (simulated - in real app this would come from API)
  const loadVersions = async (promptId: string) => {
    try {
      setLoading(true);
      
      // Simulate loading versions
      // In a real app, this would fetch from the API
      const mockVersions: Version[] = [
        {
          id: `v1-${promptId}`,
          versionNumber: 1,
          basePrompt: prompt?.basePrompt || '',
          refinedPrompt: prompt?.refinedPrompt || '',
          genre: prompt?.genre || '',
          mood: prompt?.mood || '',
          tempo: prompt?.tempo,
          instrumentation: prompt?.instrumentation,
          style: prompt?.style,
          optimizationLevel: prompt?.optimizationLevel || 'standard',
          targetPlatforms: prompt?.targetPlatforms || ['suno'],
          tags: prompt?.tags || [],
          changelog: 'Initial version',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          effectivenessScore: 0.75
        },
        {
          id: `v2-${promptId}`,
          versionNumber: 2,
          basePrompt: prompt?.basePrompt || '',
          refinedPrompt: prompt?.refinedPrompt || '',
          genre: prompt?.genre || '',
          mood: prompt?.mood || '',
          tempo: prompt?.tempo,
          instrumentation: prompt?.instrumentation,
          style: prompt?.style,
          optimizationLevel: prompt?.optimizationLevel || 'standard',
          targetPlatforms: prompt?.targetPlatforms || ['suno'],
          tags: prompt?.tags || [],
          changelog: 'Enhanced emotional depth and added instrumentation details',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          effectivenessScore: 0.82
        },
        {
          id: `v3-${promptId}`,
          versionNumber: 3,
          basePrompt: prompt?.basePrompt || '',
          refinedPrompt: prompt?.refinedPrompt || '',
          genre: prompt?.genre || '',
          mood: prompt?.mood || '',
          tempo: prompt?.tempo,
          instrumentation: prompt?.instrumentation,
          style: prompt?.style,
          optimizationLevel: prompt?.optimizationLevel || 'standard',
          targetPlatforms: prompt?.targetPlatforms || ['suno'],
          tags: prompt?.tags || [],
          changelog: 'Optimized for Suno AI platform with better structure',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          effectivenessScore: 0.91
        }
      ];

      setVersions(mockVersions);
      setSelectedVersion(mockVersions[mockVersions.length - 1]);
      setLoading(false);
    } catch (err) {
      setError('Failed to load version history');
      setLoading(false);
    }
  };

  // Filter and sort versions
  const filteredVersions = React.useMemo(() => {
    let filtered = [...versions];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(version =>
        version.changelog.toLowerCase().includes(searchQuery.toLowerCase()) ||
        version.refinedPrompt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else {
        return sortOrder === 'asc' 
          ? a.versionNumber - b.versionNumber 
          : b.versionNumber - a.versionNumber;
      }
    });

    return filtered;
  }, [versions, searchQuery, sortBy, sortOrder]);

  // Handle version actions
  const handleCompare = (version: Version) => {
    if (compareVersion && compareVersion.id !== version.id) {
      setShowCompareDialog(true);
    } else {
      setCompareVersion(version);
    }
  };

  const handleRestore = async (version: Version) => {
    if (!prompt) return;
    
    try {
      // Update prompt with version data
      await updatePrompt(prompt.id, {
        basePrompt: version.basePrompt,
        refinedPrompt: version.refinedPrompt,
        genre: version.genre,
        mood: version.mood,
        tempo: version.tempo,
        instrumentation: version.instrumentation,
        style: version.style,
        optimizationLevel: version.optimizationLevel,
        targetPlatforms: version.targetPlatforms,
        tags: version.tags,
        changelog: `Restored from version ${version.versionNumber}`
      });

      // Reload versions
      await loadVersions(prompt.id);
      setShowRestoreDialog(false);
      setError(null);
    } catch (err) {
      setError('Failed to restore version');
    }
  };

  const handleExportVersion = async (version: Version) => {
    // Create and download file
    const content = `Version ${version.versionNumber} - ${new Date(version.createdAt).toLocaleDateString()}\n\n` +
                   `Changelog: ${version.changelog}\n\n` +
                   `Base Prompt: ${version.basePrompt}\n\n` +
                   `Refined Prompt: ${version.refinedPrompt}\n\n` +
                   `Genre: ${version.genre}\n` +
                   `Mood: ${version.mood}\n` +
                   `Tempo: ${version.tempo || 'Not specified'}\n` +
                   `Optimization Level: ${version.optimizationLevel}\n` +
                   `Target Platforms: ${version.targetPlatforms.join(', ')}\n` +
                   `Tags: ${version.tags.join(', ')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-version-${version.versionNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getEffectivenessColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEffectivenessLabel = (score?: number) => {
    if (!score) return 'No rating';
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Very Good';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Version History</h1>
            <p className="text-gray-400">
              {prompt ? `Track changes for "${prompt.title}"` : 'Select a prompt to view version history'}
            </p>
          </div>
          <div className="flex gap-2">
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

        {/* Current Prompt Info */}
        {prompt && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{prompt.title}</h2>
                  <p className="text-gray-400 mb-3 line-clamp-2">{prompt.refinedPrompt}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-cyan-900/30 text-cyan-300">
                      {prompt.genre}
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-900/30 text-purple-300">
                      {prompt.mood}
                    </Badge>
                    {prompt.tempo && (
                      <Badge variant="secondary" className="bg-lime-900/30 text-lime-300">
                        {prompt.tempo} BPM
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-pink-900/30 text-pink-300">
                      {prompt.optimizationLevel}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Current Version</div>
                  <div className="text-2xl font-bold text-cyan-400">v{prompt.version}</div>
                  {prompt.effectivenessScore && (
                    <div className={`text-sm ${getEffectivenessColor(prompt.effectivenessScore)}`}>
                      {getEffectivenessLabel(prompt.effectivenessScore)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search versions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-900 border-gray-700 pl-10"
                />
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sort by:</span>
                <div className="flex bg-gray-900 rounded-lg border border-gray-700">
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSortBy('date')}
                    className={sortBy === 'date' ? 'bg-cyan-600' : 'border-transparent'}
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={sortBy === 'version' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSortBy('version')}
                    className={sortBy === 'version' ? 'bg-cyan-600' : 'border-transparent'}
                  >
                    <GitBranch className="w-4 h-4" />
                  </Button>
                </div>
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
        {prompt ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Version List */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Version History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredVersions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No versions found</p>
                    </div>
                  ) : (
                    filteredVersions.map((version) => (
                      <Card 
                        key={version.id} 
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedVersion?.id === version.id 
                            ? 'border-cyan-500 bg-cyan-500/10' 
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedVersion(version)}
                      >
                        <CardContent className="pt-3 pb-2">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-cyan-900/30 flex items-center justify-center text-xs font-bold text-cyan-300">
                                {version.versionNumber}
                              </div>
                              <span className="text-sm font-medium">
                                v{version.versionNumber}
                              </span>
                            </div>
                            {version.effectivenessScore && (
                              <div className={`text-xs ${getEffectivenessColor(version.effectivenessScore)}`}>
                                {Math.round(version.effectivenessScore * 100)}%
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                            {version.changelog}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                            <div className="flex gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCompare(version);
                                      }}
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Compare with current</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowRestoreDialog(true);
                                        setSelectedVersion(version);
                                      }}
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Restore this version</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Version Details */}
            <div className="lg:col-span-2 space-y-4">
              {selectedVersion ? (
                <>
                  {/* Version Header */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5" />
                            Version {selectedVersion.versionNumber}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(selectedVersion.createdAt).toLocaleDateString()}
                            </span>
                            {selectedVersion.effectivenessScore && (
                              <span className={`flex items-center gap-1 ${getEffectivenessColor(selectedVersion.effectivenessScore)}`}>
                                <BarChart3 className="w-4 h-4" />
                                {Math.round(selectedVersion.effectivenessScore * 100)}% effective
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleExportVersion(selectedVersion)}
                            className="border-gray-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="border-gray-700">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem onClick={() => handleCompare(selectedVersion)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Compare
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShowRestoreDialog(true)}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportVersion(selectedVersion)}>
                                <Download className="w-4 h-4 mr-2" />
                                Export Version
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-1">Changelog</h4>
                          <p className="text-sm text-gray-400">{selectedVersion.changelog}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <div className="text-xs text-gray-500">Genre</div>
                            <div className="text-sm font-medium">{selectedVersion.genre}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Mood</div>
                            <div className="text-sm font-medium">{selectedVersion.mood}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Level</div>
                            <div className="text-sm font-medium">{selectedVersion.optimizationLevel}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Platforms</div>
                            <div className="text-sm font-medium">
                              {selectedVersion.targetPlatforms.join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prompts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Base Prompt
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {selectedVersion.basePrompt}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Refined Prompt
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {selectedVersion.refinedPrompt}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Details */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-base">Version Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedVersion.tempo && (
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Tempo: {selectedVersion.tempo} BPM</span>
                          </div>
                        )}
                        
                        {selectedVersion.instrumentation && selectedVersion.instrumentation.length > 0 && (
                          <div className="flex items-start gap-3">
                            <Music className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium mb-1">Instrumentation</div>
                              <div className="flex flex-wrap gap-1">
                                {selectedVersion.instrumentation.map((instrument) => (
                                  <Badge key={instrument} variant="secondary" className="text-xs">
                                    {instrument}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedVersion.style && (
                          <div className="flex items-center gap-3">
                            <Palette className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Style: {selectedVersion.style}</span>
                          </div>
                        )}

                        {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                          <div className="flex items-start gap-3">
                            <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium mb-1">Tags</div>
                              <div className="flex flex-wrap gap-1">
                                {selectedVersion.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs border-gray-600">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-12 pb-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-2">Select a Version</h3>
                    <p className="text-gray-400">Choose a version from the history to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-12 pb-12 text-center">
              <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No Prompt Selected</h3>
              <p className="text-gray-400">Select a prompt to view its version history</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Compare Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
            <DialogDescription>
              Compare the selected version with the current version.
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && compareVersion && (
            <div className="space-y-6">
              {/* Version Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-cyan-400" />
                    Version {compareVersion.versionNumber}
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">{compareVersion.changelog}</p>
                  <div className="text-xs text-gray-500">
                    {new Date(compareVersion.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Current (v{prompt?.version})
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">{prompt?.changelog || 'Current version'}</p>
                  <div className="text-xs text-gray-500">
                    {new Date(prompt?.updatedAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Base Prompt</h4>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {compareVersion.basePrompt === prompt?.basePrompt 
                        ? 'No changes' 
                        : `-${compareVersion.basePrompt}\n+${prompt?.basePrompt}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Refined Prompt</h4>
                  <div className="bg-gray-900 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {compareVersion.refinedPrompt === prompt?.refinedPrompt 
                        ? 'No changes' 
                        : `-${compareVersion.refinedPrompt}\n+${prompt?.refinedPrompt}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this version? This will replace your current prompt.
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Version {selectedVersion.versionNumber}</h4>
                <p className="text-sm text-gray-400 mb-2">{selectedVersion.changelog}</p>
                <div className="text-xs text-gray-500">
                  {new Date(selectedVersion.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-amber-400">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                This action cannot be undone.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedVersion && handleRestore(selectedVersion)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptHistory;