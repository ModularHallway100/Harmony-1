import React, { useState, useMemo, useEffect } from 'react';
import { Comment, getCommentsByContentId } from '@/lib/mock-data';
import { useLibraryStore } from '@/store/library-store';
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  Trash2,
  Heart,
  Share2,
  Flag,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  UserPlus,
  BookMark,
  Eye,
  Send,
  Edit,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Save,
  Pin,
  Unpin,
  Ban,
  Shield,
  AlertTriangle,
  Info,
  Hash,
  TrendingUp,
  Award,
  Zap,
  Star,
  Crown,
  Gift,
  Calendar,
  Users,
  User,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Upload
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

// Extended interfaces for enhanced comment system
interface CommentReaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: string;
}

interface EmojiReaction {
  id: string;
  commentId: string;
  emoji: string;
  count: number;
  users: string[];
}

interface EmojiUserReaction {
  id: string;
  userId: string;
  commentId: string;
  emoji: string;
  timestamp: string;
}

interface CommentThread {
  id: string;
  commentId: string;
  depth: number;
  expanded: boolean;
}

interface AiCommentAnalysis {
  id: string;
  commentId: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  topics: string[];
  summary: string;
  toxicity: number;
  spamScore: number;
  authenticity: number;
  engagement: number;
  reach: number;
  impact: number;
  roi: number;
  value: number;
}

interface TrendingTopic {
  id: string;
  topic: string;
  count: number;
  growth: number;
  comments: string[];
}

interface CommentStats {
  totalComments: number;
  totalReactions: number;
  totalReports: number;
  averageSentiment: number;
  topEmojis: string[];
  topUsers: string[];
  trendingTopics: string[];
  engagementRate: number;
  moderationStats: {
    approved: number;
    pending: number;
    flagged: number;
    removed: number;
  };
}

interface CommentTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface TranslationHistory {
  id: string;
  commentId: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: string;
}

interface CommentVote {
  id: string;
  commentId: string;
  userId: string;
  vote: 'up' | 'down';
  timestamp: string;
}

interface CommentPin {
  id: string;
  commentId: string;
  userId: string;
  reason: string;
  timestamp: string;
  expiresAt?: string;
}

interface CommentMention {
  id: string;
  commentId: string;
  mentionedUserId: string;
  mentionedByUserId: string;
  timestamp: string;
}

interface MentionSuggestion {
  id: string;
  name: string;
  avatar: string;
  username: string;
}

interface CommentHistory {
  id: string;
  commentId: string;
  content: string;
  timestamp: string;
  userId: string;
}

interface Entity {
  id: string;
  name: string;
  type: 'person' | 'organization' | 'location' | 'event' | 'other';
  confidence: number;
}

interface EmotionScore {
  emotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust';
  score: number;
}

interface CommentInsights {
  totalComments: number;
  totalReactions: number;
  totalReports: number;
  averageSentiment: number;
  topEmojis: string[];
  topUsers: string[];
  trendingTopics: string[];
  engagementRate: number;
  moderationStats: {
    approved: number;
    pending: number;
    flagged: number;
    removed: number;
  };
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topCommenters: Array<{
    userId: string;
    userName: string;
    commentCount: number;
  }>;
  timeBasedStats: {
    byHour: Array<{
      hour: number;
      commentCount: number;
    }>;
    byDay: Array<{
      day: string;
      commentCount: number;
    }>;
  };
}

interface CommentTrend {
  id: string;
  topic: string;
  count: number;
  growth: number;
  sentiment: number;
  timeframe: 'day' | 'week' | 'month';
}

interface CommentPrediction {
  id: string;
  commentId: string;
  predictedEngagement: number;
  predictedSentiment: number;
  predictedToxicity: number;
  confidence: number;
  timestamp: string;
}

interface CommentCluster {
  id: string;
  comments: string[];
  centroid: string;
  size: number;
  similarity: number;
}

interface PerformanceMetrics {
  engagement: number;
  reach: number;
  impact: number;
  roi: number;
  value: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'content' | 'timing' | 'engagement' | 'moderation';
  suggestion: string;
  impact: number;
  priority: 'low' | 'medium' | 'high';
}

interface ABTestResult {
  id: string;
  testId: string;
  variant: string;
  engagement: number;
  conversion: number;
  confidence: number;
  winner: string;
}

interface PersonalizationScore {
  userId: string;
  score: number;
  factors: string[];
}

interface TargetingInfo {
  audience: string[];
  demographics: Record<string, any>;
  interests: string[];
  behavior: Record<string, any>;
}

interface AnalyticsHistory {
  id: string;
  timestamp: string;
  metrics: PerformanceMetrics;
}

interface ForecastData {
  id: string;
  timeframe: string;
  predictions: Array<{
    metric: string;
    value: number;
    confidence: number;
  }>;
}

interface ScenarioAnalysis {
  id: string;
  scenario: string;
  impact: number;
  likelihood: number;
  recommendations: string[];
}

interface SimulationResult {
  id: string;
  scenario: string;
  outcomes: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
}

interface LearningData {
  id: string;
  model: string;
  accuracy: number;
  improvements: string[];
}

interface ModelData {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  lastTrained: string;
}

interface PredictionHistory {
  id: string;
  timestamp: string;
  prediction: CommentPrediction;
  actual: number;
  accuracy: number;
}

interface RecommendationHistory {
  id: string;
  timestamp: string;
  recommendation: string;
  outcome: number;
  effectiveness: number;
}

interface InsightsHistory {
  id: string;
  timestamp: string;
  insights: CommentInsights;
  actions: string[];
}

interface TrendsHistory {
  id: string;
  timestamp: string;
  trends: CommentTrend[];
}

interface ClustersHistory {
  id: string;
  timestamp: string;
  clusters: CommentCluster[];
}

interface KeywordsHistory {
  id: string;
  timestamp: string;
  keywords: Record<string, string[]>;
}

interface EntitiesHistory {
  id: string;
  timestamp: string;
  entities: Record<string, Entity[]>;
}

interface EmotionsHistory {
  id: string;
  timestamp: string;
  emotions: Record<string, EmotionScore[]>;
}

interface LanguageHistory {
  id: string;
  timestamp: string;
  languages: Record<string, string>;
}

interface ToxicityHistory {
  id: string;
  timestamp: string;
  toxicity: Record<string, number>;
}

interface SpamHistory {
  id: string;
  timestamp: string;
  spam: Record<string, boolean>;
}

interface BotsHistory {
  id: string;
  timestamp: string;
  bots: Record<string, boolean>;
}

interface AuthenticityHistory {
  id: string;
  timestamp: string;
  authenticity: Record<string, number>;
}

interface EngagementHistory {
  id: string;
  timestamp: string;
  engagement: Record<string, number>;
}

interface ReachHistory {
  id: string;
  timestamp: string;
  reach: Record<string, number>;
}

interface ImpactHistory {
  id: string;
  timestamp: string;
  impact: Record<string, number>;
}

interface ROIHistory {
  id: string;
  timestamp: string;
  roi: Record<string, number>;
}

interface ValueHistory {
  id: string;
  timestamp: string;
  value: Record<string, number>;
}

interface PerformanceHistory {
  id: string;
  timestamp: string;
  performance: Record<string, PerformanceMetrics>;
}

interface OptimizationHistory {
  id: string;
  timestamp: string;
  optimizations: Record<string, OptimizationSuggestion>;
}

interface ABTestHistory {
  id: string;
  timestamp: string;
  tests: Record<string, ABTestResult>;
}

interface PersonalizationHistory {
  id: string;
  timestamp: string;
  personalization: Record<string, PersonalizationScore>;
}

interface SegmentationHistory {
  id: string;
  timestamp: string;
  segmentation: Record<string, string>;
}

interface TargetingHistory {
  id: string;
  timestamp: string;
  targeting: Record<string, TargetingInfo>;
}

interface CommentReport {
  id: string;
  commentId: string;
  userId: string;
  reason: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  reviewedBy?: string;
  reviewedAt?: string;
  resolution?: string;
}

interface CommentNotification {
  id: string;
  userId: string;
  type: 'reply' | 'reaction' | 'mention' | 'moderation';
  commentId: string;
  read: boolean;
  timestamp: string;
  message: string;
}

interface CommentThread {
  id: string;
  commentId: string;
  depth: number;
  expanded: boolean;
}

interface EnhancedComment extends Comment {
  replies: EnhancedComment[];
  reactionCounts: Record<string, number>;
  userReactions: Record<string, string>; // userId -> emoji
  isLiked: boolean;
  isDisliked: boolean;
  isBookmarked: boolean;
  isReported: boolean;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  isEdited: boolean;
  isHidden: boolean;
  isPinned: boolean;
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'removed';
  editHistory: Array<{
    timestamp: string;
    content: string;
  }>;
  reportedCount: number;
  lastActivity: string;
  sentimentScore?: number; // For AI-powered sentiment analysis
  aiSummary?: string; // AI-generated summary of the comment
  trendingScore?: number; // For trending comments
  badges?: string[]; // Comment badges
  media?: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
  }>;
  // Threaded discussions properties
  threadId?: string; // For threaded discussions
  threadDepth?: number; // Depth in the thread hierarchy
  isThreadExpanded?: boolean; // Whether the thread is expanded
  // Emoji reactions properties
  emojiReactions?: EmojiReaction[]; // Emoji reactions for the comment
  userEmojiReactions?: EmojiUserReaction[]; // User's emoji reactions
  // AI analysis properties
  aiAnalysis?: AiCommentAnalysis; // AI analysis of the comment
  // Tag properties
  tags?: CommentTag[]; // Tags associated with the comment
  // Vote properties
  votes?: CommentVote[]; // Votes on the comment
  // Pin properties
  pins?: CommentPin[]; // Pins on the comment
  // Mention properties
  mentions?: CommentMention[]; // Mentions in the comment
  // History properties
  history?: CommentHistory[]; // Edit history of the comment
  // Analysis properties
  confidence?: number; // Confidence score
  sentiment?: 'positive' | 'negative' | 'neutral'; // Sentiment analysis
  topics?: string[]; // Topics extracted from the comment
  summary?: string; // Summary of the comment
  insights?: CommentInsights; // Insights about the comment
  trends?: CommentTrend[]; // Trends related to the comment
  predictions?: CommentPrediction[]; // Predictions about the comment
  recommendations?: string[]; // Recommendations for the comment
  similarity?: number; // Similarity to other comments
  cluster?: CommentCluster; // Cluster the comment belongs to
  keywords?: string[]; // Keywords extracted from the comment
  entities?: Entity[]; // Entities mentioned in the comment
  emotions?: EmotionScore[]; // Emotions detected in the comment
  language?: string; // Language detected in the comment
  toxicity?: number; // Toxicity score
  spam?: boolean; // Whether the comment is spam
  bot?: boolean; // Whether the comment is from a bot
  authenticity?: number; // Authenticity score
  engagement?: number; // Engagement score
  reach?: number; // Reach score
  impact?: number; // Impact score
  roi?: number; // ROI score
  value?: number; // Value score
  performance?: PerformanceMetrics; // Performance metrics
  optimization?: OptimizationSuggestion; // Optimization suggestions
  abTest?: ABTestResult; // A/B test results
  personalization?: PersonalizationScore; // Personalization score
  segmentation?: string; // Segmentation
  targeting?: TargetingInfo; // Targeting information
  // History tracking properties
  analyticsHistory?: AnalyticsHistory[]; // Analytics history
  forecast?: ForecastData; // Forecast data
  scenario?: ScenarioAnalysis; // Scenario analysis
  simulation?: SimulationResult; // Simulation results
  learning?: LearningData; // Learning data
  model?: ModelData; // Model data
  predictionHistory?: PredictionHistory[]; // Prediction history
  recommendationHistory?: RecommendationHistory[]; // Recommendation history
  insightsHistory?: InsightsHistory[]; // Insights history
  trendsHistory?: TrendsHistory[]; // Trends history
  clustersHistory?: ClustersHistory[]; // Clusters history
  keywordsHistory?: KeywordsHistory[]; // Keywords history
  entitiesHistory?: EntitiesHistory[]; // Entities history
  emotionsHistory?: EmotionsHistory[]; // Emotions history
  languageHistory?: LanguageHistory[]; // Language history
  toxicityHistory?: ToxicityHistory[]; // Toxicity history
  spamHistory?: SpamHistory[]; // Spam history
  botsHistory?: BotsHistory[]; // Bots history
  authenticityHistory?: AuthenticityHistory[]; // Authenticity history
  engagementHistory?: EngagementHistory[]; // Engagement history
  reachHistory?: ReachHistory[]; // Reach history
  impactHistory?: ImpactHistory[]; // Impact history
  roiHistory?: ROIHistory[]; // ROI history
  valueHistory?: ValueHistory[]; // Value history
  performanceHistory?: PerformanceHistory[]; // Performance history
  optimizationHistory?: OptimizationHistory[]; // Optimization history
  abTestHistory?: ABTestHistory[]; // A/B test history
  personalizationHistory?: PersonalizationHistory[]; // Personalization history
  segmentationHistory?: SegmentationHistory[]; // Segmentation history
  targetingHistory?: TargetingHistory[]; // Targeting history
}

interface CommentSectionProps {
  contentId: string;
  contentType?: 'track' | 'playlist' | 'artist';
  allowReplies?: boolean;
  allowReactions?: boolean;
  allowModeration?: boolean;
  maxReplies?: number;
  showStats?: boolean;
  currentUserRole?: 'user' | 'moderator' | 'admin';
  enableNotifications?: boolean;
  enableMentions?: boolean;
  maxCommentLength?: number;
  enableAutoModeration?: boolean;
  enableThreading?: boolean;
  enableEmojiReactions?: boolean;
  enableAIAnalysis?: boolean;
  enableTrending?: boolean;
  maxThreadDepth?: number;
  collapseRepliesByDefault?: boolean;
  showCommentAnalytics?: boolean;
  enableCommentMedia?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  contentId,
  contentType = 'track',
  allowReplies = true,
  allowReactions = true,
  allowModeration = true,
  maxReplies = 10,
  showStats = true,
  currentUserRole = 'user',
  enableNotifications = true,
  enableMentions = true,
  maxCommentLength = 1000,
  enableAutoModeration = true,
  enableThreading = true,
  enableEmojiReactions = true,
  enableAIAnalysis = true,
  enableTrending = true,
  maxThreadDepth = 5,
  collapseRepliesByDefault = false,
  showCommentAnalytics = false,
  enableCommentMedia = true
}) => {
  const { user } = useClerkUser();
  const mockComments = getCommentsByContentId(contentId);
  const userComments = useLibraryStore((state) => state.commentsByContentId[contentId] || []);
  const addComment = useLibraryStore((state) => state.addComment);
  const deleteComment = useLibraryStore((state) => state.deleteComment);
  
  // State management
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'following' | 'mine' | 'reported'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<CommentReaction[]>([]);
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [notifications, setNotifications] = useState<CommentNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedCommentForReport, setSelectedCommentForReport] = useState<string | null>(null);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [moderationAction, setModerationAction] = useState('');
  const [selectedCommentForModeration, setSelectedCommentForModeration] = useState<string | null>(null);
  
  // Enhanced reporting state
  const [severityLevel, setSeverityLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isAnonymousReport, setIsAnonymousReport] = useState(false);
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  
  // Threaded discussions state
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set());
  const [threadDepth, setThreadDepth] = useState<Record<string, number>>({});
  const [maxThreadDepth, setMaxThreadDepth] = useState(5);
  const [threadedComments, setThreadedComments] = useState<Record<string, EnhancedComment[]>>({});
  
  // Emoji reactions state
  const [emojiReactions, setEmojiReactions] = useState<EmojiReaction[]>([]);
  const [userEmojiReactions, setUserEmojiReactions] = useState<EmojiUserReaction[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedCommentForEmoji, setSelectedCommentForEmoji] = useState<string | null>(null);
  const [availableEmojis, setAvailableEmojis] = useState(['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🔥', '💯', '🎉', '👏', '🙌', '😍', '🤔', '😎', '🤩', '😭', '🤗', '🤯', '👾']);
  
  // Additional state for enhanced features
  const [aiAnalysis, setAiAnalysis] = useState<AiCommentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [commentStats, setCommentStats] = useState<CommentStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [highlightedComment, setHighlightedComment] = useState<string | null>(null);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#fbbf24');
  const [commentTags, setCommentTags] = useState<CommentTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagColor, setTagColor] = useState('#3b82f6');
  const [commentTranslations, setCommentTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translationHistory, setTranslationHistory] = useState<TranslationHistory[]>([]);
  const [commentVotes, setCommentVotes] = useState<CommentVote[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [voteWeight, setVoteWeight] = useState(1);
  const [isVoting, setIsVoting] = useState(false);
  const [commentPins, setCommentPins] = useState<CommentPin[]>([]);
  const [isPinning, setIsPinning] = useState(false);
  const [pinReason, setPinReason] = useState('');
  const [commentMentions, setCommentMentions] = useState<CommentMention[]>([]);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [commentHistory, setCommentHistory] = useState<CommentHistory[]>([]);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [selectedCommentForHistory, setSelectedCommentForHistory] = useState<string | null>(null);
  const [commentConfidence, setCommentConfidence] = useState<Record<string, number>>({});
  const [isCalculatingConfidence, setIsCalculatingConfidence] = useState(false);
  const [commentSentiment, setCommentSentiment] = useState<Record<string, 'positive' | 'negative' | 'neutral'>>({});
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [commentTopics, setCommentTopics] = useState<Record<string, string[]>>({});
  const [isExtractingTopics, setIsExtractingTopics] = useState(false);
  const [commentSummary, setCommentSummary] = useState<Record<string, string>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [commentInsights, setCommentInsights] = useState<CommentInsights | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [commentTrends, setCommentTrends] = useState<CommentTrend[]>([]);
  const [isAnalyzingTrends, setIsAnalyzingTrends] = useState(false);
  const [commentPredictions, setCommentPredictions] = useState<CommentPrediction[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [commentRecommendations, setCommentRecommendations] = useState<string[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [commentSimilarity, setCommentSimilarity] = useState<Record<string, number>>({});
  const [isCalculatingSimilarity, setIsCalculatingSimilarity] = useState(false);
  const [commentClusters, setCommentClusters] = useState<CommentCluster[]>([]);
  const [isClustering, setIsClustering] = useState(false);
  const [commentKeywords, setCommentKeywords] = useState<Record<string, string[]>>({});
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);
  const [commentEntities, setCommentEntities] = useState<Record<string, Entity[]>>({});
  const [isExtractingEntities, setIsExtractingEntities] = useState(false);
  const [commentEmotions, setCommentEmotions] = useState<Record<string, EmotionScore[]>>({});
  const [isAnalyzingEmotions, setIsAnalyzingEmotions] = useState(false);
  const [commentLanguage, setCommentLanguage] = useState<Record<string, string>>({});
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(false);
  const [commentToxicity, setCommentToxicity] = useState<Record<string, number>>({});
  const [isDetectingToxicity, setIsDetectingToxicity] = useState(false);
  const [commentSpam, setCommentSpam] = useState<Record<string, boolean>>({});
  const [isDetectingSpam, setIsDetectingSpam] = useState(false);
  const [commentBots, setCommentBots] = useState<Record<string, boolean>>({});
  const [isDetectingBots, setIsDetectingBots] = useState(false);
  const [commentAuthenticity, setCommentAuthenticity] = useState<Record<string, number>>({});
  const [isCheckingAuthenticity, setIsCheckingAuthenticity] = useState(false);
  const [commentEngagement, setCommentEngagement] = useState<Record<string, number>>({});
  const [isCalculatingEngagement, setIsCalculatingEngagement] = useState(false);
  const [commentReach, setCommentReach] = useState<Record<string, number>>({});
  const [isCalculatingReach, setIsCalculatingReach] = useState(false);
  const [commentImpact, setCommentImpact] = useState<Record<string, number>>({});
  const [isCalculatingImpact, setIsCalculatingImpact] = useState(false);
  const [commentROI, setCommentROI] = useState<Record<string, number>>({});
  const [isCalculatingROI, setIsCalculatingROI] = useState(false);
  const [commentValue, setCommentValue] = useState<Record<string, number>>({});
  const [isCalculatingValue, setIsCalculatingValue] = useState(false);
  
  // Available emojis for reactions
  const availableEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🔥', '💯', '🎉'];
  
  // Report reasons
  const reportReasons = [
    'Spam or misleading',
    'Hate speech or harassment',
    'Nudity or sexual content',
    'Violent or graphic content',
    'Copyright infringement',
    'Child abuse',
    'Other'
  ];
  
  // Moderation actions
  const moderationActions = [
    { id: 'approve', label: 'Approve', icon: CheckCircle, color: 'text-green-400' },
    { id: 'flag', label: 'Flag for review', icon: AlertTriangle, color: 'text-yellow-400' },
    { id: 'hide', label: 'Hide comment', icon: Eye, color: 'text-gray-400' },
    { id: 'pin', label: 'Pin comment', icon: Pin, color: 'text-cyan-400' },
    { id: 'unpin', label: 'Unpin comment', icon: Unpin, color: 'text-cyan-400' },
    { id: 'remove', label: 'Remove comment', icon: Ban, color: 'text-red-400' }
  ];
  
  // Auto-moderation keywords
  const moderationKeywords = [
    'spam', 'scam', 'fake', 'hate', 'violence', 'explicit', 'nude', 'nsfw'
  ];
  
  // Simulated real-time notifications
  useEffect(() => {
    if (!enableNotifications) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance to simulate a new notification
        const newNotification: CommentNotification = {
          id: `notification-${crypto.randomUUID()}`,
          userId: user?.id || '',
          type: ['reply', 'reaction', 'mention'][Math.floor(Math.random() * 3)] as 'reply' | 'reaction' | 'mention',
          commentId: `comment-${crypto.randomUUID()}`,
          read: false,
          timestamp: new Date().toISOString(),
          message: 'Someone interacted with your comment'
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only latest 10
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [user?.id, enableNotifications]);
  
  // Combine and enhance comments
  const enhancedComments = useMemo(() => {
    const combined = [...mockComments, ...userComments];
    
    return combined.map(comment => {
      // Apply auto-moderation
      let moderationStatus: EnhancedComment['moderationStatus'] = 'approved';
      let reportedCount = 0;
      
      if (enableAutoModeration) {
        const hasInappropriateContent = moderationKeywords.some(keyword =>
          comment.text.toLowerCase().includes(keyword)
        );
        
        if (hasInappropriateContent) {
          moderationStatus = 'pending';
        }
      }
      
      // Calculate reports count
      const commentReports = reports.filter(r => r.commentId === comment.id);
      reportedCount = commentReports.length;
      
      if (reportedCount > 2) {
        moderationStatus = 'flagged';
      }
      
      return {
        ...comment,
        replies: [],
        reactionCounts: {},
        userReactions: {},
        isLiked: false,
        isDisliked: false,
        isBookmarked: false,
        isReported: reports.some(r => r.commentId === comment.id && r.userId === user?.id),
        likeCount: Math.floor(Math.random() * 50),
        dislikeCount: Math.floor(Math.random() * 10),
        replyCount: Math.floor(Math.random() * 20),
        isEdited: false,
        isHidden: moderationStatus === 'removed',
        isPinned: false,
        moderationStatus,
        editHistory: [],
        reportedCount,
        lastActivity: comment.timestamp
      };
    }) as EnhancedComment[];
  }, [mockComments, userComments, reports, user?.id, enableAutoModeration]);
  
  // Sort and filter comments
  const processedComments = useMemo(() => {
    let filtered = enhancedComments;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(comment =>
        comment.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply user filter
    if (filterBy === 'mine' && user) {
      filtered = filtered.filter(comment => comment.userId === user.id);
    }
    
    // Apply reported filter
    if (filterBy === 'reported' && currentUserRole !== 'user') {
      filtered = filtered.filter(comment => comment.reportedCount > 0);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'popular':
          return (b.likeCount + b.replyCount) - (a.likeCount + a.replyCount);
        case 'newest':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });
  }, [enhancedComments, sortBy, filterBy, searchQuery, user, currentUserRole]);
  
  // Handle comment submission
  const handleSubmit = (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const text = parentId ? replyText : newComment;
    
    if (!text.trim()) return;
    
    // Check comment length
    if (text.length > maxCommentLength) {
      alert(`Comment exceeds maximum length of ${maxCommentLength} characters`);
      return;
    }
    
    setIsLoading(true);
    
    const newCommentObject: Comment = {
      id: `comment-${crypto.randomUUID()}`,
      contentId: contentId,
      userId: user?.id || 'user-current',
      userName: user?.fullName || 'You',
      userAvatar: user?.imageUrl || 'https://i.pravatar.cc/150?u=currentuser',
      text: text,
      timestamp: new Date().toISOString(),
    };
    
    // Add comment to store
    addComment(newCommentObject);
    
    // Send notification for reply
    if (parentId) {
      handleReplyNotification(parentId, newCommentObject.id);
    }
    
    // Reset form
    if (parentId) {
      setReplyText('');
      setReplyingTo(null);
    } else {
      setNewComment('');
    }
    
    setIsLoading(false);
  };
  
  // Handle reaction to comment
  const handleReaction = (commentId: string, emoji: string) => {
    if (!user) return;
    
    setReactions(prev => {
      const existingReaction = prev.find(r => r.userId === user.id && r.commentId === commentId);
      
      if (existingReaction) {
        // Remove existing reaction if clicking the same emoji
        if (existingReaction.emoji === emoji) {
          return prev.filter(r => !(r.userId === user.id && r.commentId === commentId));
        }
        // Update reaction to new emoji
        return prev.map(r =>
          r.userId === user.id && r.commentId === commentId
            ? { ...r, emoji, timestamp: new Date().toISOString() }
            : r
        );
      } else {
        // Add new reaction
        const newReaction = {
          id: `reaction-${crypto.randomUUID()}`,
          userId: user.id,
          userName: user.fullName || '',
          emoji,
          timestamp: new Date().toISOString(),
          commentId
        };
        
        // Add notification if reaction is on someone else's comment
        const comment = enhancedComments.find(c => c.id === commentId);
        if (comment && comment.userId !== user.id) {
          const notification: CommentNotification = {
            id: `notification-${crypto.randomUUID()}`,
            userId: comment.userId,
            type: 'reaction',
            commentId,
            read: false,
            timestamp: new Date().toISOString(),
            message: `${user.fullName || 'Someone'} reacted to your comment with ${emoji}`
          };
          setNotifications(prev => [notification, ...prev.slice(0, 9)]);
        }
        
        return [...prev, newReaction];
      }
    });
  };
  
  // Handle report comment
  const handleReport = (commentId: string, reason: string, description: string) => {
    if (!user) return;
    
    const newReport: CommentReport = {
      id: `report-${crypto.randomUUID()}`,
      commentId,
      userId: user.id,
      reason,
      description,
      timestamp: new Date().toISOString(),
      status: 'pending',
      severity: severityLevel
    };
    
    setReports(prev => [...prev, newReport]);
    
    // Add notification to moderators
    if (currentUserRole === 'user') {
      const notification: CommentNotification = {
        id: `notification-${crypto.randomUUID()}`,
        userId: 'moderator', // This would be the system or moderator user
        type: 'moderation',
        commentId,
        read: false,
        timestamp: new Date().toISOString(),
        message: `New report for comment: ${reason}`
      };
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    }
    
    // Close report dialog
    setShowReportDialog(false);
    setReportReason('');
    setReportDescription('');
    setSelectedCommentForReport(null);
  };
  
  // Handle comment reply notification
  const handleReplyNotification = (commentId: string, replyId: string) => {
    if (!user) return;
    
    const originalComment = enhancedComments.find(c => c.id === commentId);
    if (!originalComment || originalComment.userId === user.id) return;
    
    const notification: CommentNotification = {
      id: `notification-${crypto.randomUUID()}`,
      userId: originalComment.userId,
      type: 'reply',
      commentId: replyId,
      read: false,
      timestamp: new Date().toISOString(),
      message: `${user.fullName || 'Someone'} replied to your comment`
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };
  
  // Handle comment reaction notification
  const handleReactionNotification = (commentId: string, reactionType: string) => {
    if (!user) return;
    
    const originalComment = enhancedComments.find(c => c.id === commentId);
    if (!originalComment || originalComment.userId === user.id) return;
    
    const notification: CommentNotification = {
      id: `notification-${crypto.randomUUID()}`,
      userId: originalComment.userId,
      type: 'reaction',
      commentId,
      read: false,
      timestamp: new Date().toISOString(),
      message: `${user.fullName || 'Someone'} reacted to your comment with ${reactionType}`
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };
  
  // Handle comment mention notification
  const handleMentionNotification = (commentId: string, mentionedUserId: string) => {
    if (!user || mentionedUserId === user.id) return;
    
    const notification: CommentNotification = {
      id: `notification-${crypto.randomUUID()}`,
      userId: mentionedUserId,
      type: 'mention',
      commentId,
      read: false,
      timestamp: new Date().toISOString(),
      message: `${user.fullName || 'Someone'} mentioned you in a comment`
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };
  
  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };
  
  // Get unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  
  // Handle reply submission with notification
  const handleReplyWithNotification = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setIsLoading(true);
    
    const newReply: Comment = {
      id: `comment-${crypto.randomUUID()}`,
      contentId: contentId,
      userId: user?.id || 'user-current',
      userName: user?.fullName || 'You',
      userAvatar: user?.imageUrl || 'https://i.pravatar.cc/150?u=currentuser',
      text: replyText,
      timestamp: new Date().toISOString(),
    };
    
    // Add reply to store
    addComment(newReply);
    
    // Send notification
    handleReplyNotification(commentId, newReply.id);
    
    // Reset form
    setReplyText('');
    setReplyingTo(null);
    
    setIsLoading(false);
  };
  
  // Handle delete comment
  const handleDeleteComment = (commentId: string) => {
    deleteComment(contentId, commentId);
    
    // Add notification to user if they're deleting someone else's comment
    const comment = enhancedComments.find(c => c.id === commentId);
    if (comment && comment.userId !== user?.id && currentUserRole !== 'user') {
      const notification: CommentNotification = {
        id: `notification-${crypto.randomUUID()}`,
        userId: comment.userId,
        type: 'moderation',
        commentId,
        read: false,
        timestamp: new Date().toISOString(),
        message: 'Your comment was removed by a moderator'
      };
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    }
  };
  
  // Handle reply to comment
  const handleReply = (commentId: string) => {
    if (commentId === replyingTo) {
      setReplyingTo(null);
      setReplyText('');
    } else {
      setReplyingTo(commentId);
      setReplyText('');
      
      // Add notification to comment author
      const comment = enhancedComments.find(c => c.id === commentId);
      if (comment && comment.userId !== user?.id) {
        const notification: CommentNotification = {
          id: `notification-${crypto.randomUUID()}`,
          userId: comment.userId,
          type: 'reply',
          commentId,
          read: false,
          timestamp: new Date().toISOString(),
          message: `${user?.fullName || 'Someone'} replied to your comment`
        };
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      }
    }
  };
  
  // Get user's reaction to a comment
  const getUserReaction = (commentId: string) => {
    if (!user) return null;
    const userReaction = reactions.find(r => r.userId === user.id && r.commentId === commentId);
    return userReaction?.emoji || null;
  };
  
  // Get reaction count for a specific emoji
  const getReactionCount = (commentId: string, emoji: string) => {
    return reactions.filter(r => r.commentId === commentId && r.emoji === emoji).length;
  };
  
  // Handle edit comment
  const handleEditComment = (commentId: string) => {
    const comment = enhancedComments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditText(comment.text);
    }
  };
  
  // Save edited comment
  const handleSaveEdit = (commentId: string) => {
    const comment = enhancedComments.find(c => c.id === commentId);
    if (comment) {
      // Update comment in store (this would be an API call in a real app)
      const updatedComment = {
        ...comment,
        text: editText,
        isEdited: true,
        editHistory: [
          ...comment.editHistory,
          { timestamp: new Date().toISOString(), content: comment.text }
        ],
        lastActivity: new Date().toISOString()
      };
      
      // Update UI state
      setEditingCommentId(null);
      setEditText('');
      
      // In a real app, this would update the database
      console.log('Updated comment:', updatedComment);
    }
  };
  
  // Cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };
  
  // Handle moderation action
  const handleModerationAction = (commentId: string, action: string) => {
    const comment = enhancedComments.find(c => c.id === commentId);
    if (!comment) return;
    
    let updatedStatus = comment.moderationStatus;
    
    switch (action) {
      case 'approve':
        updatedStatus = 'approved';
        break;
      case 'flag':
        updatedStatus = 'flagged';
        break;
      case 'hide':
        updatedStatus = 'pending';
        break;
      case 'pin':
        updatedStatus = 'approved';
        // Add pin logic here
        break;
      case 'unpin':
        updatedStatus = 'approved';
        // Remove pin logic here
        break;
      case 'remove':
        updatedStatus = 'removed';
        break;
    }
    
    // Update comment status
    const updatedComment = {
      ...comment,
      moderationStatus: updatedStatus,
      lastActivity: new Date().toISOString()
    };
    
    // Close moderation panel
    setShowModerationPanel(false);
    setModerationAction('');
    setSelectedCommentForModeration(null);
    
    // In a real app, this would update the database
    console.log('Moderation action applied:', { commentId, action, updatedStatus });
  };
  
  // Threaded discussions functions
  const toggleThread = (commentId: string) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };
  
  const expandAllThreads = () => {
    const allCommentIds = processedComments.map(c => c.id);
    setExpandedThreads(new Set(allCommentIds));
  };
  
  const collapseAllThreads = () => {
    setExpandedThreads(new Set());
  };
  
  const getThreadDepth = (commentId: string): number => {
    return threadDepth[commentId] || 0;
  };
  
  
  const buildThreadedComments = (comments: EnhancedComment[], parentId: string | null = null, depth: number = 0): EnhancedComment[] => {
    return comments
      .filter(comment => {
        if (parentId === null) {
          return !comment.threadId || comment.threadDepth === 0;
        }
        return comment.threadId === parentId;
      })
      .map(comment => {
        const newComment = {
          ...comment,
          threadDepth: depth,
          isThreadExpanded: expandedThreads.has(comment.id)
        };
        
        if (newComment.replies && newComment.replies.length > 0) {
          newComment.replies = buildThreadedComments(newComment.replies, comment.id, depth + 1);
        }
        
        return newComment;
      });
  };
  
  // Emoji reactions functions
  const handleEmojiReaction = (commentId: string, emoji: string) => {
    if (!user) return;
    
    setEmojiReactions(prev => {
      const existingReaction = prev.find(r => r.commentId === commentId && r.emoji === emoji);
      
      if (existingReaction) {
        // Remove reaction if user already reacted with this emoji
        return prev.filter(r => !(r.commentId === commentId && r.emoji === emoji));
      } else {
        // Add or increment reaction
        return prev.map(r =>
          r.commentId === commentId && r.emoji === emoji
            ? { ...r, count: r.count + 1, users: [...r.users, user.id] }
            : r
        ).concat({
          id: `emoji-${crypto.randomUUID()}`,
          commentId,
          emoji,
          count: 1,
          users: [user.id]
        });
      }
    });
    
    // Add user emoji reaction
    setUserEmojiReactions(prev => {
      const existingUserReaction = prev.find(r => r.userId === user.id && r.commentId === commentId);
      
      if (existingUserReaction) {
        // Update existing reaction
        return prev.map(r =>
          r.userId === user.id && r.commentId === commentId
            ? { ...r, emoji, timestamp: new Date().toISOString() }
            : r
        );
      } else {
        // Add new reaction
        return [...prev, {
          id: `user-emoji-${crypto.randomUUID()}`,
          userId: user.id,
          commentId,
          emoji,
          timestamp: new Date().toISOString()
        }];
      }
    });
    
    // Add notification if reaction is on someone else's comment
    const comment = enhancedComments.find(c => c.id === commentId);
    if (comment && comment.userId !== user.id) {
      const notification: CommentNotification = {
        id: `notification-${crypto.randomUUID()}`,
        userId: comment.userId,
        type: 'reaction',
        commentId,
        read: false,
        timestamp: new Date().toISOString(),
        message: `${user.fullName || 'Someone'} reacted to your comment with ${emoji}`
      };
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    }
  };
  
  const getEmojiReactionCount = (commentId: string, emoji: string): number => {
    const reaction = emojiReactions.find(r => r.commentId === commentId && r.emoji === emoji);
    return reaction ? reaction.count : 0;
  };
  
  const getUserEmojiReaction = (commentId: string): string | null => {
    if (!user) return null;
    const userReaction = userEmojiReactions.find(r => r.userId === user.id && r.commentId === commentId);
    return userReaction?.emoji || null;
  };
  
  const openEmojiPicker = (commentId: string) => {
    setSelectedCommentForEmoji(commentId);
    setIsEmojiPickerOpen(true);
  };
  
  const closeEmojiPicker = () => {
    setIsEmojiPickerOpen(false);
    setSelectedCommentForEmoji(null);
  };
  
  // AI analysis functions
  const analyzeComment = async (commentId: string) => {
    if (!enableAIAnalysis) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const comment = enhancedComments.find(c => c.id === commentId);
      if (comment) {
        const analysis: AiCommentAnalysis = {
          id: `analysis-${crypto.randomUUID()}`,
          commentId,
          sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
          confidence: Math.random(),
          topics: ['music', 'art', 'technology'],
          summary: comment.text.substring(0, 100) + '...',
          toxicity: Math.random(),
          spamScore: Math.random(),
          authenticity: Math.random(),
          engagement: Math.random(),
          reach: Math.random(),
          impact: Math.random(),
          roi: Math.random(),
          value: Math.random()
        };
        
        setAiAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error analyzing comment:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral'): string => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      case 'neutral': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };
  
  const getSentimentIcon = (sentiment: 'positive' | 'negative' | 'neutral'): React.ReactNode => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-4 w-4" />;
      case 'negative': return <ThumbsDown className="h-4 w-4" />;
      case 'neutral': return <Minus className="h-4 w-4" />;
      default: return null;
    }
  };
  
  // Trending topics functions
  const fetchTrendingTopics = async () => {
    if (!enableTrending) return;
    
    setIsTrendingLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const topics: TrendingTopic[] = [
        { id: '1', topic: 'New Music Release', count: 150, growth: 25, comments: ['comment1', 'comment2'] },
        { id: '2', topic: 'Artist Collaboration', count: 120, growth: 15, comments: ['comment3', 'comment4'] },
        { id: '3', topic: 'Music Festival', count: 90, growth: 30, comments: ['comment5', 'comment6'] }
      ];
      
      setTrendingTopics(topics);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setIsTrendingLoading(false);
    }
  };
  
  // Comment stats functions
  const fetchCommentStats = async () => {
    if (!showCommentAnalytics) return;
    
    setIsStatsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stats: CommentStats = {
        totalComments: processedComments.length,
        totalReactions: reactions.length,
        totalReports: reports.length,
        averageSentiment: 0.7,
        topEmojis: ['👍', '❤️', '😂'],
        topUsers: ['user1', 'user2', 'user3'],
        trendingTopics: ['music', 'art', 'technology'],
        engagementRate: 0.85,
        moderationStats: {
          approved: processedComments.filter(c => c.moderationStatus === 'approved').length,
          pending: processedComments.filter(c => c.moderationStatus === 'pending').length,
          flagged: processedComments.filter(c => c.moderationStatus === 'flagged').length,
          removed: processedComments.filter(c => c.moderationStatus === 'removed').length
        }
      };
      
      setCommentStats(stats);
    } catch (error) {
      console.error('Error fetching comment stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };
  
  // Initialize threaded comments
  useEffect(() => {
    const threaded = buildThreadedComments(processedComments);
    setThreadedComments(prev => ({
      ...prev,
      [contentId]: threaded
    }));
  }, [processedComments, expandedThreads, contentId]);
  
  // Fetch trending topics on mount
  useEffect(() => {
    fetchTrendingTopics();
  }, [enableTrending]);
  
  // Fetch comment stats on mount
  useEffect(() => {
    fetchCommentStats();
  }, [showCommentAnalytics, processedComments.length, reactions.length, reports.length]);
  
  // Open report dialog
  const openReportDialog = (commentId: string) => {
    setSelectedCommentForReport(commentId);
    setShowReportDialog(true);
  };
  
  // Open moderation panel
  const openModerationPanel = (commentId: string) => {
    setSelectedCommentForModeration(commentId);
    setShowModerationPanel(true);
  };
  
  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };
  
  // Get moderation status icon
  const getModerationStatusIcon = (status: EnhancedComment['moderationStatus']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'removed':
        return <X className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };
  
  // Get moderation status text
  const getModerationStatusText = (status: EnhancedComment['moderationStatus']) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Review';
      case 'flagged':
        return 'Flagged';
      case 'removed':
        return 'Removed';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className="mt-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-lime-400 h-6 w-6" />
          <h2 className="text-3xl font-mono font-bold text-glow-lime">Comments</h2>
          <Badge variant="secondary" className="bg-cyan-600/20 text-cyan-400">
            {processedComments.length}
          </Badge>
        </div>
        
        {/* Stats */}
        {showStats && (
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{Math.floor(Math.random() * 1000)} views</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{processedComments.length} comments</span>
            </div>
            {enableNotifications && notifications.length > 0 && (
              <div className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                <span>{notifications.filter(n => !n.read).length} notifications</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Notification Panel */}
      {enableNotifications && notifications.length > 0 && (
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-lime-400 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications([])}
              className="text-gray-400 hover:text-red-400"
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                  notification.read ? 'bg-neutral-900/30' : 'bg-lime-600/10 border border-lime-600/20'
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {notification.type === 'reply' && <Reply className="h-4 w-4 text-cyan-400" />}
                  {notification.type === 'reaction' && <Heart className="h-4 w-4 text-pink-400" />}
                  {notification.type === 'mention' && <UserPlus className="h-4 w-4 text-purple-400" />}
                  {notification.type === 'moderation' && <Shield className="h-4 w-4 text-orange-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-lime-400 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-neutral-900 border-neutral-700"
            />
          </div>
          
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-40 bg-neutral-900 border-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Comments</SelectItem>
              <SelectItem value="following">Following</SelectItem>
              <SelectItem value="mine">My Comments</SelectItem>
              {currentUserRole !== 'user' && (
                <SelectItem value="reported">Reported</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40 bg-neutral-900 border-neutral-700">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
          
          {enableThreading && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAllThreads}
                className="border-neutral-700 text-gray-400 hover:text-lime-400 hover:border-lime-400"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAllThreads}
                className="border-neutral-700 text-gray-400 hover:text-lime-400 hover:border-lime-400"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse All
              </Button>
            </div>
          )}
          
          {currentUserRole !== 'user' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModerationPanel(!showModerationPanel)}
              className="border-neutral-700 text-gray-400 hover:text-lime-400 hover:border-lime-400"
            >
              <Shield className="h-4 w-4 mr-2" />
              Moderation
            </Button>
          )}
        </div>
      </div>
      
      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lime-400">Report Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Comment Preview */}
            {selectedCommentForReport && (
              <div className="p-3 bg-neutral-900/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={enhancedComments.find(c => c.id === selectedCommentForReport)?.userAvatar} />
                    <AvatarFallback>{enhancedComments.find(c => c.id === selectedCommentForReport)?.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-lime-400">
                    {enhancedComments.find(c => c.id === selectedCommentForReport)?.userName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(enhancedComments.find(c => c.id === selectedCommentForReport)?.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  {enhancedComments.find(c => c.id === selectedCommentForReport)?.text}
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Report Reason</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map(reason => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Severity Level</label>
              <Select value={severityLevel} onValueChange={(value: any) => setSeverityLevel(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Minor issue</SelectItem>
                  <SelectItem value="medium">Medium - Policy violation</SelectItem>
                  <SelectItem value="high">High - Harmful content</SelectItem>
                  <SelectItem value="critical">Critical - Immediate danger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Description (Optional)</label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide additional context or examples..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific and include examples if possible. This helps moderators understand the issue.
              </p>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Evidence (Optional)</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEvidenceUpload(!showEvidenceUpload)}
                  className="border-neutral-700 text-gray-400 hover:text-lime-400"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Evidence
                </Button>
                {showEvidenceUpload && (
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*,video/*,audio/*"
                      multiple
                      className="bg-neutral-900 border-neutral-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can upload images, videos, or audio files as evidence.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymousReport"
                  checked={isAnonymousReport}
                  onChange={(e) => setIsAnonymousReport(e.target.checked)}
                  className="rounded border-gray-600"
                />
                <label htmlFor="anonymousReport" className="text-sm text-gray-400">
                  Submit anonymously
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportReason('');
                    setReportDescription('');
                    setSeverityLevel('medium');
                    setIsAnonymousReport(false);
                    setShowEvidenceUpload(false);
                    setSelectedCommentForReport(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedCommentForReport && handleReport(selectedCommentForReport, reportReason, reportDescription)}
                  disabled={!reportReason}
                  className="bg-lime-600 hover:bg-lime-700"
                >
                  Submit Report
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Emoji Picker Dialog */}
      <Dialog open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-lime-400">Choose an Emoji</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
            {availableEmojis.map(emoji => (
              <Button
                key={emoji}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedCommentForEmoji) {
                    handleEmojiReaction(selectedCommentForEmoji, emoji);
                  }
                  closeEmojiPicker();
                }}
                className="text-2xl hover:bg-neutral-800"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Moderation Panel */}
      {showModerationPanel && selectedCommentForModeration && (
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-lime-400">Moderation Panel</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModerationPanel(false)}
              className="text-gray-400 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Comment Preview */}
          <div className="mb-4 p-3 bg-neutral-900/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={enhancedComments.find(c => c.id === selectedCommentForModeration)?.userAvatar} />
                <AvatarFallback>{enhancedComments.find(c => c.id === selectedCommentForModeration)?.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-lime-400">
                {enhancedComments.find(c => c.id === selectedCommentForModeration)?.userName}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(enhancedComments.find(c => c.id === selectedCommentForModeration)?.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-300">
              {enhancedComments.find(c => c.id === selectedCommentForModeration)?.text}
            </p>
          </div>
          
          {/* Moderation Actions */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {moderationActions.map(action => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerationAction(selectedCommentForModeration, action.id)}
                    className={`border-neutral-700 text-gray-400 hover:text-${action.color.split('-')[1]}-400 hover:border-${action.color.split('-')[1]}-400`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Moderation Details */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Moderation Note</label>
              <Textarea
                value={moderationAction}
                onChange={(e) => setModerationAction(e.target.value)}
                placeholder="Add a note about this moderation action..."
                className="bg-neutral-900 border-neutral-700 focus:ring-lime-500"
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">User History</label>
              <div className="p-2 bg-neutral-900/30 rounded text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Previous Warnings:</span>
                  <span className="text-lime-400">{Math.floor(Math.random() * 3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Previous Bans:</span>
                  <span className="text-red-400">{Math.floor(Math.random() * 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Age:</span>
                  <span className="text-cyan-400">{Math.floor(Math.random() * 365)} days</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModerationPanel(false)}
                className="text-gray-400"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (selectedCommentForModeration && moderationAction.trim()) {
                    handleModerationAction(selectedCommentForModeration, 'moderate');
                  }
                }}
                disabled={!moderationAction.trim()}
                className="bg-lime-600 hover:bg-lime-700"
              >
                Apply Action
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Comment Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="flex items-start space-x-4 p-4 bg-neutral-900/50 rounded-lg">
        <Avatar>
          <AvatarImage src={user?.imageUrl || 'https://i.pravatar.cc/150?u=currentuser'} />
          <AvatarFallback>{user?.fullName?.charAt(0) || 'Y'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-neutral-900 border-neutral-700 focus:ring-lime-500 mb-3"
            rows={3}
            maxLength={maxCommentLength}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-lime-400"
              >
                <Smile className="h-4 w-4" />
              </Button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-0 bg-neutral-800 border border-neutral-700 rounded-lg p-2 shadow-lg z-10">
                  <div className="grid grid-cols-5 gap-1">
                    {availableEmojis.map(emoji => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewComment(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-lg hover:bg-neutral-700"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-lime-400"
              >
                <BookMark className="h-4 w-4" />
              </Button>
              
              {enableMentions && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-lime-400"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {newComment.length}/{maxCommentLength}
              </span>
              <Button
                type="submit"
                disabled={!newComment.trim() || isLoading}
                className="bg-lime-600 hover:bg-lime-700 text-white font-bold"
              >
                {isLoading ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Comments List */}
      <div className="space-y-4">
        {processedComments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            {/* Comment */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={comment.userAvatar} />
                  <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-baseline space-x-2">
                    <p className="font-bold text-lime-400">{comment.userName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </p>
                    {getModerationStatusIcon(comment.moderationStatus)}
                    <span className="text-xs text-gray-500">
                      {getModerationStatusText(comment.moderationStatus)}
                    </span>
                    {comment.isEdited && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        Edited
                      </Badge>
                    )}
                    {comment.isPinned && (
                      <Badge variant="outline" className="text-xs border-cyan-600 text-cyan-400">
                        Pinned
                      </Badge>
                    )}
                    {comment.reportedCount > 0 && (
                      <Badge variant="outline" className="text-xs border-orange-600 text-orange-400">
                        {comment.reportedCount} reports
                      </Badge>
                    )}
                    {comment.threadDepth !== undefined && comment.threadDepth > 0 && (
                      <Badge variant="outline" className="text-xs border-purple-600 text-purple-400">
                        Thread Level {comment.threadDepth + 1}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Edit Form */}
                  {editingCommentId === comment.id ? (
                    <div className="mt-3 p-3 bg-neutral-900/30 rounded-lg">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="bg-neutral-900 border-neutral-700 focus:ring-lime-500 mb-2"
                        rows={3}
                        maxLength={maxCommentLength}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {editText.length}/{maxCommentLength}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="text-gray-400"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={!editText.trim()}
                            className="bg-lime-600 hover:bg-lime-700"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-300 mt-1">{comment.text}</p>
                      
                      {/* Emoji Reactions */}
                      {enableEmojiReactions && comment.emojiReactions && comment.emojiReactions.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {comment.emojiReactions.map((reaction) => (
                            <Button
                              key={reaction.id}
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEmojiReaction(comment.id, reaction.emoji)}
                              className={`text-xs hover:bg-neutral-800 ${
                                getUserEmojiReaction(comment.id) === reaction.emoji
                                  ? 'bg-lime-600/20 text-lime-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              {reaction.emoji} {reaction.count}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Traditional Reactions */}
                      {allowReactions && (
                        <div className="flex items-center gap-2 mt-2">
                          {availableEmojis.slice(0, 5).map(emoji => (
                            <Button
                              key={emoji}
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(comment.id, emoji)}
                              className={`text-xs hover:bg-neutral-800 ${
                                getUserReaction(comment.id) === emoji
                                  ? 'bg-lime-600/20 text-lime-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              {emoji} {getReactionCount(comment.id, emoji)}
                            </Button>
                          ))}
                          
                          {comment.replyCount > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReply(comment.id)}
                              className="text-xs text-gray-400 hover:text-lime-400"
                            >
                              <Reply className="h-3 w-3 mr-1" />
                              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReply(comment.id)}
                          className="text-gray-400 hover:text-lime-400"
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        
                        {enableEmojiReactions && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEmojiPicker(comment.id)}
                            className="text-gray-400 hover:text-lime-400"
                          >
                            <Smile className="h-4 w-4 mr-1" />
                            Emoji
                          </Button>
                        )}
                        
                        {user?.id === comment.userId && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-blue-400"
                              onClick={() => handleEditComment(comment.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-400"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                        
                        {allowModeration && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-lime-400">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openReportDialog(comment.id)}>
                                <Flag className="h-4 w-4 mr-2" />
                                Report
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BookMark className="h-4 w-4 mr-2" />
                                Save
                              </DropdownMenuItem>
                              {enableThreading && comment.replies && comment.replies.length > 0 && (
                                <DropdownMenuItem onClick={() => toggleThread(comment.id)}>
                                  {expandedThreads.has(comment.id) ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-2" />
                                      Collapse Thread
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-2" />
                                      Expand Thread
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              {currentUserRole !== 'user' && (
                                <DropdownMenuItem onClick={() => openModerationPanel(comment.id)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Moderate
                                </DropdownMenuItem>
                              )}
                              {user?.id === comment.userId && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEditComment(comment.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-400" onClick={() => handleDeleteComment(comment.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleSubmit(e, comment.id)} className="flex items-start space-x-3 mt-3 p-3 bg-neutral-900/30 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl || 'https://i.pravatar.cc/150?u=currentuser'} />
                        <AvatarFallback>{user?.fullName?.charAt(0) || 'Y'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder={`Reply to ${comment.userName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="bg-neutral-900 border-neutral-700 focus:ring-lime-500 mb-2"
                          rows={2}
                        />
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="mr-2"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="bg-lime-600 hover:bg-lime-700 text-white text-sm"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              
              {/* Threaded Replies */}
              {enableThreading && comment.replies && comment.replies.length > 0 && (
                <div className={`ml-${(comment.threadDepth || 0) * 4} space-y-3 transition-all duration-300 ${expandedThreads.has(comment.id) ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3 p-3 bg-neutral-900/30 rounded-lg border-l-2 border-lime-600/30">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={reply.userAvatar} />
                        <AvatarFallback>{reply.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline space-x-2">
                          <p className="font-bold text-cyan-400 text-sm">{reply.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(reply.timestamp).toLocaleString()}
                          </p>
                          {reply.isEdited && (
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              Edited
                            </Badge>
                          )}
                          {reply.threadDepth !== undefined && reply.threadDepth > 0 && (
                            <Badge variant="outline" className="text-xs border-purple-600 text-purple-400">
                              Thread Level {reply.threadDepth + 1}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mt-1">{reply.text}</p>
                        
                        {/* Emoji Reactions for Replies */}
                        {enableEmojiReactions && reply.emojiReactions && reply.emojiReactions.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {reply.emojiReactions.map((reaction) => (
                              <Button
                                key={reaction.id}
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEmojiReaction(reply.id, reaction.emoji)}
                                className={`text-xs hover:bg-neutral-800 ${
                                  getUserEmojiReaction(reply.id) === reaction.emoji
                                    ? 'bg-lime-600/20 text-lime-400'
                                    : 'text-gray-400'
                                }`}
                              >
                                {reaction.emoji} {reaction.count}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Reply Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReply(reply.id)}
                            className="text-xs text-gray-400 hover:text-lime-400"
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                          
                          {enableEmojiReactions && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEmojiPicker(reply.id)}
                              className="text-xs text-gray-400 hover:text-lime-400"
                            >
                              <Smile className="h-3 w-3 mr-1" />
                              Emoji
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {processedComments.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;