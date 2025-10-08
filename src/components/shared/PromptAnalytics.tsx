import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Calendar,
  Music,
  Users,
  Download,
  Share2,
  Filter,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';
import { usePromptStore } from '@/store/prompt-store';

interface PromptAnalyticsProps {
  promptId?: string;
  onClose?: () => void;
}

interface AnalyticsData {
  id: string;
  platform: string;
  generationSuccess: boolean;
  generationQuality?: number;
  generationTime?: number;
  feedbackText?: string;
  rating?: number;
  createdAt: string;
}

interface PlatformStats {
  platform: string;
  totalUses: number;
  successRate: number;
  averageQuality: number;
  averageTime: number;
  bestPrompt: string;
}

interface TrendData {
  date: string;
  uses: number;
  successRate: number;
  averageQuality: number;
}

const PromptAnalytics: React.FC<PromptAnalyticsProps> = ({ promptId, onClose }) => {
  const {
    prompts,
    currentPrompt,
    isLoading,
    error,
    
    // Actions
    fetchPrompt,
    fetchAnalytics,
    addAnalytics,
    setError,
    setLoading
  } = usePromptStore();

  // Local state
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'quality'>('date');

  // Get the current prompt
  const prompt = promptId 
    ? prompts.find(p => p.id === promptId) 
    : currentPrompt;

  // Load analytics when prompt changes
  useEffect(() => {
    if (prompt) {
      loadAnalytics(prompt.id);
    }
  }, [prompt, selectedPlatform, timeRange, sortBy]);

  // Load analytics (simulated - in real app this would come from API)
  const loadAnalytics = async (promptId: string) => {
    try {
      setLoading(true);
      
      // Simulate loading analytics
      // In a real app, this would fetch from the API
      const mockAnalytics: AnalyticsData[] = [
        {
          id: '1',
          platform: 'suno',
          generationSuccess: true,
          generationQuality: 0.85,
          generationTime: 45,
          feedbackText: 'Great results! The emotional depth was perfect.',
          rating: 5,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          platform: 'udio',
          generationSuccess: true,
          generationQuality: 0.78,
          generationTime: 52,
          feedbackText: 'Good quality but could use more instrumentation.',
          rating: 4,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          platform: 'suno',
          generationSuccess: false,
          generationQuality: 0.3,
          generationTime: 120,
          feedbackText: 'The generation failed to capture the mood properly.',
          rating: 2,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          platform: 'stable-audio',
          generationSuccess: true,
          generationQuality: 0.92,
          generationTime: 38,
          feedbackText: 'Excellent production quality and emotional impact.',
          rating: 5,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          platform: 'suno',
          generationSuccess: true,
          generationQuality: 0.88,
          generationTime: 41,
          feedbackText: 'Very close to the desired outcome.',
          rating: 4,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Filter by platform and time range
      let filtered = mockAnalytics;
      if (selectedPlatform !== 'all') {
        filtered = filtered.filter(a => a.platform === selectedPlatform);
      }

      // Filter by time range (simplified)
      const days = parseInt(timeRange.replace('d', ''));
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(a => new Date(a.createdAt) >= cutoffDate);

      // Sort
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'quality':
            return (b.generationQuality || 0) - (a.generationQuality || 0);
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });

      setAnalytics(filtered);

      // Calculate platform stats
      const platforms = ['suno', 'udio', 'stable-audio', 'meta-music-gen'];
      const stats = platforms.map(platform => {
        const platformAnalytics = mockAnalytics.filter(a => a.platform === platform);
        const totalUses = platformAnalytics.length;
        const successfulUses = platformAnalytics.filter(a => a.generationSuccess).length;
        const successRate = totalUses > 0 ? successfulUses / totalUses : 0;
        const averageQuality = platformAnalytics.length > 0 
          ? platformAnalytics.reduce((sum, a) => sum + (a.generationQuality || 0), 0) / platformAnalytics.length 
          : 0;
        const averageTime = platformAnalytics.length > 0 
          ? platformAnalytics.reduce((sum, a) => sum + (a.generationTime || 0), 0) / platformAnalytics.length 
          : 0;
        
        return {
          platform,
          totalUses,
          successRate: Math.round(successRate * 100),
          averageQuality: Math.round(averageQuality * 100) / 100,
          averageTime: Math.round(averageTime),
          bestPrompt: platformAnalytics.length > 0 
            ? platformAnalytics.reduce((best, current) => 
                (current.generationQuality || 0) > (best.generationQuality || 0) ? current : best
              ).feedbackText || 'No feedback'
            : 'No data'
        };
      });

      setPlatformStats(stats);

      // Generate trend data (simplified)
      const trendDays = Math.min(parseInt(timeRange.replace('d', '')), 30);
      const trends: TrendData[] = [];
      for (let i = trendDays - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayAnalytics = mockAnalytics.filter(a => {
          const analyticsDate = new Date(a.createdAt);
          return analyticsDate.toDateString() === date.toDateString();
        });
        
        trends.push({
          date: date.toISOString().split('T')[0],
          uses: dayAnalytics.length,
          successRate: dayAnalytics.length > 0 
            ? Math.round((dayAnalytics.filter(a => a.generationSuccess).length / dayAnalytics.length) * 100)
            : 0,
          averageQuality: dayAnalytics.length > 0 
            ? Math.round((dayAnalytics.reduce((sum, a) => sum + (a.generationQuality || 0), 0) / dayAnalytics.length) * 100) / 100
            : 0
        });
      }

      setTrendData(trends);
      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics');
      setLoading(false);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedback: string, rating: number, platform: string) => {
    if (!prompt) return;
    
    try {
      await addAnalytics(prompt.id, {
        platform,
        generationSuccess: true,
        generationQuality: rating / 5,
        feedbackText: feedback,
        rating,
        createdAt: new Date().toISOString()
      });

      // Refresh analytics
      await loadAnalytics(prompt.id);
      setShowFeedbackDialog(false);
      setError(null);
    } catch (err) {
      setError('Failed to submit feedback');
    }
  };

  // Get color based on value
  const getColor = (value: number, type: 'quality' | 'success' | 'rating') => {
    if (type === 'quality' || type === 'rating') {
      if (value >= 0.8) return 'text-green-400';
      if (value >= 0.6) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (value >= 80) return 'text-green-400';
      if (value >= 60) return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'suno': return '🎵';
      case 'udio': return '🎶';
      case 'stable-audio': return '🎼';
      case 'meta-music-gen': return '🎹';
      default: return '🎵';
    }
  };

  // Calculate overall stats
  const totalUses = analytics.length;
  const successfulUses = analytics.filter(a => a.generationSuccess).length;
  const successRate = totalUses > 0 ? Math.round((successfulUses / totalUses) * 100) : 0;
  const averageQuality = totalUses > 0 
    ? Math.round((analytics.reduce((sum, a) => sum + (a.generationQuality || 0), 0) / totalUses) * 100) / 100
    : 0;
  const averageRating = totalUses > 0 
    ? Math.round((analytics.reduce((sum, a) => sum + (a.rating || 0), 0) / totalUses) * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Prompt Analytics</h1>
            <p className="text-gray-400">
              {prompt ? `Track performance for "${prompt.title}"` : 'Select a prompt to view analytics'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadAnalytics(prompt?.id || '')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
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
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Overall Score</div>
                  <div className="text-3xl font-bold text-cyan-400">
                    {prompt.effectivenessScore ? Math.round(prompt.effectivenessScore * 100) : '--'}%
                  </div>
                  {prompt.effectivenessScore && (
                    <div className="text-sm text-gray-400">
                      Based on {analytics.length} generations
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Platform Filter */}
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Platform</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform('all')}
                    className={selectedPlatform === 'all' ? 'bg-cyan-600' : 'border-gray-700'}
                  >
                    All Platforms
                  </Button>
                  {platformStats.map((stat) => (
                    <Button
                      key={stat.platform}
                      variant={selectedPlatform === stat.platform ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPlatform(stat.platform)}
                      className={selectedPlatform === stat.platform ? 'bg-cyan-600' : 'border-gray-700'}
                    >
                      {getPlatformIcon(stat.platform)} {stat.platform}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Time Range</label>
                <div className="flex gap-2">
                  {['7d', '30d', '90d'].map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange(range)}
                      className={timeRange === range ? 'bg-purple-600' : 'border-gray-700'}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {prompt ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-gray-700">
              <TabsTrigger value="overview" className="text-green-400 data-[state=active]:bg-green-500/20">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="platforms" className="text-cyan-400 data-[state=active]:bg-cyan-500/20">
                <Target className="w-4 h-4 mr-2" />
                Platforms
              </TabsTrigger>
              <TabsTrigger value="feedback" className="text-purple-400 data-[state=active]:bg-purple-500/20">
                <Star className="w-4 h-4 mr-2" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="trends" className="text-yellow-400 data-[state=active]:bg-yellow-500/20">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{totalUses}</div>
                        <div className="text-sm text-gray-400">Total Uses</div>
                      </div>
                      <Music className="w-8 h-8 text-cyan-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${getColor(successRate / 100, 'success')}`}>
                          {successRate}%
                        </div>
                        <div className="text-sm text-gray-400">Success Rate</div>
                      </div>
                      {successRate >= 80 ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : successRate >= 60 ? (
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${getColor(averageQuality, 'quality')}`}>
                          {averageQuality}
                        </div>
                        <div className="text-sm text-gray-400">Avg Quality</div>
                      </div>
                      <Award className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${getColor(averageRating / 5, 'rating')}`}>
                          {averageRating}
                        </div>
                        <div className="text-sm text-gray-400">Avg Rating</div>
                      </div>
                      <Star className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {analytics.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No analytics data available</p>
                      </div>
                    ) : (
                      analytics.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                              <span className="text-lg">{getPlatformIcon(item.platform)}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium capitalize">{item.platform}</span>
                              {item.generationSuccess ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              )}
                              {item.rating && (
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                              {item.feedbackText || 'No feedback provided'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              {item.generationTime && (
                                <span>{item.generationTime}s</span>
                              )}
                              {item.generationQuality && (
                                <span className={`font-medium ${getColor(item.generationQuality, 'quality')}`}>
                                  {Math.round(item.generationQuality * 100)}% quality
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFeedbackDialog(true)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {platformStats.map((stat) => (
                  <Card key={stat.platform} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-xl">
                            {getPlatformIcon(stat.platform)}
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">{stat.platform}</h3>
                            <p className="text-sm text-gray-400">{stat.totalUses} uses</p>
                          </div>
                        </div>
                        {stat.successRate >= 80 ? (
                          <TrendingUp className="w-6 h-6 text-green-400" />
                        ) : stat.successRate >= 60 ? (
                          <TrendingUp className="w-6 h-6 text-yellow-400" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Success Rate</span>
                            <span className={`font-medium ${getColor(stat.successRate, 'success')}`}>
                              {stat.successRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                stat.successRate >= 80 ? 'bg-green-500' :
                                stat.successRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${stat.successRate}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Quality</span>
                            <span className={`font-medium ${getColor(stat.averageQuality, 'quality')}`}>
                              {stat.averageQuality}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                stat.averageQuality >= 0.8 ? 'bg-green-500' :
                                stat.averageQuality >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${stat.averageQuality * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Time</span>
                            <span className="font-medium">{stat.averageTime}s</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-cyan-500"
                              style={{ width: `${Math.min(stat.averageTime / 120 * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                          <span className="font-medium">Best result:</span> {stat.bestPrompt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      User Feedback
                    </span>
                    <Button onClick={() => setShowFeedbackDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                      <Zap className="w-4 h-4 mr-2" />
                      Add Feedback
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.filter(a => a.feedbackText).length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No feedback available</p>
                        <p className="text-sm mt-2">Be the first to provide feedback!</p>
                      </div>
                    ) : (
                      analytics
                        .filter(a => a.feedbackText)
                        .map((item) => (
                          <div key={item.id} className="p-4 bg-gray-900/50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                                  <span className="text-sm">{getPlatformIcon(item.platform)}</span>
                                </div>
                                <div>
                                  <span className="font-medium capitalize">{item.platform}</span>
                                  <span className="text-gray-400 text-sm ml-2">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {item.rating && (
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-300">{item.feedbackText}</p>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Usage Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trendData.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No trend data available</p>
                        </div>
                      ) : (
                        trendData.map((trend, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                            <span className="text-sm">{trend.date}</span>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold">{trend.uses}</div>
                                <div className="text-xs text-gray-400">uses</div>
                              </div>
                              <div className="text-center">
                                <div className={`text-lg font-bold ${getColor(trend.successRate / 100, 'success')}`}>
                                  {trend.successRate}%
                                </div>
                                <div className="text-xs text-gray-400">success</div>
                              </div>
                              <div className="text-center">
                                <div className={`text-lg font-bold ${getColor(trend.averageQuality, 'quality')}`}>
                                  {trend.averageQuality}
                                </div>
                                <div className="text-xs text-gray-400">quality</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Performance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {totalUses === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No performance data available</p>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 bg-gray-900/50 rounded-lg">
                            <h4 className="font-medium mb-2">Best Performing Platform</h4>
                            {platformStats.length > 0 ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                                  {getPlatformIcon(platformStats.reduce((best, current) => 
                                    current.successRate > best.successRate ? current : best
                                  ).platform)}
                                </div>
                                <div>
                                  <div className="font-medium capitalize">
                                    {platformStats.reduce((best, current) => 
                                      current.successRate > best.successRate ? current : best
                                    ).platform}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {platformStats.reduce((best, current) => 
                                      current.successRate > best.successRate ? current : best
                                    ).successRate}% success rate
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-400">No platform data available</p>
                            )}
                          </div>

                          <div className="p-4 bg-gray-900/50 rounded-lg">
                            <h4 className="font-medium mb-2">Quality Insights</h4>
                            {averageQuality >= 0.8 ? (
                              <div className="text-green-400">
                                <CheckCircle className="w-5 h-5 inline mr-2" />
                                Excellent prompt quality! Keep up the great work.
                              </div>
                            ) : averageQuality >= 0.6 ? (
                              <div className="text-yellow-400">
                                <AlertCircle className="w-5 h-5 inline mr-2" />
                                Good quality room for improvement in prompt details.
                              </div>
                            ) : (
                              <div className="text-red-400">
                                <AlertCircle className="w-5 h-5 inline mr-2" />
                                Consider enhancing prompt details for better results.
                              </div>
                            )}
                          </div>

                          <div className="p-4 bg-gray-900/50 rounded-lg">
                            <h4 className="font-medium mb-2">Recommendations</h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                              {successRate < 70 && (
                                <li className="flex items-start gap-2">
                                  <span className="text-yellow-400">•</span>
                                  <span>Try adding more specific details to improve success rate</span>
                                </li>
                              )}
                              {averageQuality < 0.7 && (
                                <li className="flex items-start gap-2">
                                  <span className="text-yellow-400">•</span>
                                  <span>Include more emotional descriptors and instrumentation</span>
                                </li>
                              )}
                              {platformStats.some(p => p.averageTime > 60) && (
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400">•</span>
                                  <span>Some platforms are taking longer - consider optimizing for speed</span>
                                </li>
                              )}
                              <li className="flex items-start gap-2">
                                <span className="text-green-400">•</span>
                                <span>Continue tracking performance to identify improvement opportunities</span>
                              </li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-12 pb-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No Prompt Selected</h3>
              <p className="text-gray-400">Select a prompt to view its analytics</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add Feedback</DialogTitle>
            <DialogDescription>
              Share your experience with this prompt's performance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <Select>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platformStats.map((stat) => (
                    <SelectItem key={stat.platform} value={stat.platform}>
                      {getPlatformIcon(stat.platform)} {stat.platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    size="icon"
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <Star className={`w-6 h-6 ${rating >= 4 ? 'fill-current' : ''}`} />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Feedback</label>
              <textarea
                className="w-full bg-gray-900 border-gray-700 rounded-md p-3 text-white"
                rows={3}
                placeholder="Share your experience with this prompt..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowFeedbackDialog(false)} className="bg-purple-600 hover:bg-purple-700">
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptAnalytics;