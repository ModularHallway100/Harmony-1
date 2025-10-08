import React, { useState, useEffect, useMemo } from 'react';
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { useLibraryStore } from '@/store/library-store';
import { useUserStore } from '@/store/user-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Input, 
  Textarea, 
  Label 
} from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Search, 
  Plus, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Filter, 
  TrendingUp, 
  Clock, 
  Users, 
  Eye,
  Edit,
  Trash2,
  Flag,
  MoreHorizontal,
  Check,
  Star,
  Award,
  ThumbsUp,
  MessageCircle,
  Pin,
  Lock,
  Unlock,
  Bell,
  Zap,
  Calendar,
  Tag,
  Image,
  FileText,
  Link,
  User,
  Crown,
  Shield,
  Hash
} from 'lucide-react';

// Forum interfaces
interface ForumPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  replies: number;
  lastReply?: {
    author: User;
    createdAt: string;
  };
  images?: string[];
  attachments?: Attachment[];
  reactions: Reaction[];
  isLiked: boolean;
  isBookmarked: boolean;
}

interface User {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  isVerified: boolean;
  role: 'user' | 'moderator' | 'admin';
  stats: {
    posts: number;
    replies: number;
    likes: number;
    joinedAt: string;
  };
}

interface Reaction {
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  count: number;
  hasReacted: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video';
  size: string;
  url: string;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  isModerated: boolean;
}

interface ForumStats {
  totalPosts: number;
  totalUsers: number;
  totalReplies: number;
  activeToday: number;
  topCategories: CategoryStat[];
}

interface CategoryStat {
  category: string;
  posts: number;
  color: string;
}

interface ForumSearchFilters {
  query: string;
  category: string;
  tags: string[];
  sortBy: 'latest' | 'popular' | 'trending' | 'mostReplies';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  author: string;
  minLikes: number;
  hasImages: boolean;
  hasAttachments: boolean;
}

const CommunityForums: React.FC = () => {
  const { user: currentUser } = useClerkUser();
  const { setUser } = useUserStore();
  const { 
    aiArtists 
  } = useLibraryStore();
  
  // State management
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [activeTab, setActiveTab] = useState('discussions');
  const [isLoading, setIsLoading] = useState(true);
  
  // Post creation states
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isPinned: false,
    isLocked: false
  });
  
  // Search and filter states
  const [searchFilters, setSearchFilters] = useState<ForumSearchFilters>({
    query: '',
    category: '',
    tags: [],
    sortBy: 'latest',
    dateRange: 'all',
    author: '',
    minLikes: 0,
    hasImages: false,
    hasAttachments: false
  });
  
  // Post detail states
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<any[]>([]);
  
  // User states
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userStats, setUserStats] = useState({
    posts: 0,
    replies: 0,
    likes: 0,
    bookmarks: 0
  });
  
  // Mock data for demonstration
  const mockCategories: ForumCategory[] = [
    {
      id: 'cat-1',
      name: 'General Discussion',
      description: 'General chat about music and AI artists',
      icon: '💬',
      color: 'bg-blue-600',
      postCount: 1245,
      isModerated: true
    },
    {
      id: 'cat-2',
      name: 'Music Production',
      description: 'Tips, tricks, and techniques for music production',
      icon: '🎵',
      color: 'bg-purple-600',
      postCount: 892,
      isModerated: true
    },
    {
      id: 'cat-3',
      name: 'AI Artist Showcase',
      description: 'Showcase your AI-generated music and art',
      icon: '🤖',
      color: 'bg-cyan-600',
      postCount: 567,
      isModerated: true
    },
    {
      id: 'cat-4',
      name: 'Collaborations',
      description: 'Find collaborators for your music projects',
      icon: '🤝',
      color: 'bg-green-600',
      postCount: 423,
      isModerated: true
    },
    {
      id: 'cat-5',
      name: 'Feedback & Reviews',
      description: 'Get feedback on your tracks and give reviews',
      icon: '👀',
      color: 'bg-yellow-600',
      postCount: 389,
      isModerated: true
    },
    {
      id: 'cat-6',
      name: 'Technical Support',
      description: 'Get help with technical issues and questions',
      icon: '🔧',
      color: 'bg-red-600',
      postCount: 267,
      isModerated: true
    }
  ];
  
  const mockPosts: ForumPost[] = [
    {
      id: 'post-1',
      title: 'How to create authentic synthwave sounds with AI?',
      content: 'I\'ve been experimenting with AI music generation for synthwave, but I\'m struggling to get that authentic 80s vibe. Does anyone have tips on how to train the AI better or specific techniques to use? I\'ve tried using reference tracks but the results still feel a bit generic...',
      excerpt: 'Looking for tips on creating authentic synthwave sounds with AI music generation tools.',
      author: {
        id: 'user-1',
        username: 'synthwave_producer',
        fullName: 'Jamie Chen',
        avatarUrl: 'https://i.pravatar.cc/150?u=synthwave_producer',
        isVerified: true,
        role: 'user',
        stats: {
          posts: 45,
          replies: 234,
          likes: 1234,
          joinedAt: '2023-01-15'
        }
      },
      category: 'Music Production',
      tags: ['synthwave', 'ai', 'production', 'tips'],
      createdAt: '2023-10-05T14:30:00Z',
      updatedAt: '2023-10-05T14:30:00Z',
      isPinned: false,
      isLocked: false,
      isFeatured: true,
      views: 1245,
      likes: 89,
      replies: 23,
      lastReply: {
        author: {
          id: 'user-2',
          username: 'ai_musician',
          fullName: 'Alex Rivera',
          avatarUrl: 'https://i.pravatar.cc/150?u=ai_musician',
          isVerified: true,
          role: 'moderator',
          stats: {
            posts: 67,
            replies: 567,
            likes: 2345,
            joinedAt: '2022-11-20'
          }
        },
        createdAt: '2023-10-05T18:45:00Z'
      },
      images: ['https://picsum.photos/seed/post1/600/400'],
      reactions: [
        { type: 'like', count: 45, hasReacted: false },
        { type: 'love', count: 23, hasReacted: false },
        { type: 'wow', count: 12, hasReacted: false },
        { type: 'laugh', count: 8, hasReacted: false },
        { type: 'sad', count: 1, hasReacted: false }
      ],
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 'post-2',
      title: 'Check out my latest AI-generated track: Neon Dreams!',
      content: 'Hey everyone, I\'m excited to share my latest AI-generated synthwave track! I used a combination of MIDI generation and AI-assisted mixing to create this. Would love to hear your feedback and thoughts on the AI integration...',
      excerpt: 'Sharing my latest AI-generated synthwave track and looking for community feedback.',
      author: {
        id: 'user-3',
        username: 'neon_creator',
        fullName: 'Taylor Kim',
        avatarUrl: 'https://i.pravatar.cc/150?u=neon_creator',
        isVerified: false,
        role: 'user',
        stats: {
          posts: 12,
          replies: 67,
          likes: 234,
          joinedAt: '2023-05-20'
        }
      },
      category: 'AI Artist Showcase',
      tags: ['ai', 'music', 'synthwave', 'feedback'],
      createdAt: '2023-10-04T10:15:00Z',
      updatedAt: '2023-10-04T10:15:00Z',
      isPinned: false,
      isLocked: false,
      isFeatured: false,
      views: 892,
      likes: 67,
      replies: 34,
      lastReply: {
        author: {
          id: 'user-4',
          username: 'music_lover',
          fullName: 'Jordan Smith',
          avatarUrl: 'https://i.pravatar.cc/150?u=music_lover',
          isVerified: false,
          role: 'user',
          stats: {
            posts: 23,
            replies: 123,
            likes: 456,
            joinedAt: '2023-02-10'
          }
        },
        createdAt: '2023-10-04T15:30:00Z'
      },
      reactions: [
        { type: 'like', count: 34, hasReacted: false },
        { type: 'love', count: 28, hasReacted: false },
        { type: 'wow', count: 5, hasReacted: false }
      ],
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 'post-3',
      title: 'Collaboration wanted: Producer + AI Specialist',
      content: 'Looking for a producer to collaborate with on my AI music project. I\'m specializing in AI-generated melodies and need someone with production expertise to help with mixing and mastering. We\'ll split royalties 50/50...',
      excerpt: 'Seeking a producer for AI music collaboration with royalty sharing.',
      author: {
        id: 'user-5',
        username: 'ai_specialist',
        fullName: 'Morgan Lee',
        avatarUrl: 'https://i.pravatar.cc/150?u=ai_specialist',
        isVerified: true,
        role: 'user',
        stats: {
          posts: 8,
          replies: 45,
          likes: 123,
          joinedAt: '2023-03-15'
        }
      },
      category: 'Collaborations',
      tags: ['collaboration', 'producer', 'ai', 'royalties'],
      createdAt: '2023-10-03T16:45:00Z',
      updatedAt: '2023-10-03T16:45:00Z',
      isPinned: true,
      isLocked: false,
      isFeatured: false,
      views: 567,
      likes: 23,
      replies: 12,
      lastReply: {
        author: {
          id: 'user-6',
          username: 'producer_guru',
          fullName: 'Casey Brown',
          avatarUrl: 'https://i.pravatar.cc/150?u=producer_guru',
          isVerified: true,
          role: 'user',
          stats: {
            posts: 34,
            replies: 234,
            likes: 789,
            joinedAt: '2022-08-30'
          }
        },
        createdAt: '2023-10-03T20:15:00Z'
      },
      reactions: [
        { type: 'like', count: 12, hasReacted: false },
        { type: 'love', count: 8, hasReacted: false }
      ],
      isLiked: false,
      isBookmarked: false
    }
  ];
  
  const mockStats: ForumStats = {
    totalPosts: 3789,
    totalUsers: 12456,
    totalReplies: 23456,
    activeToday: 342,
    topCategories: [
      { category: 'General Discussion', posts: 1245, color: 'bg-blue-600' },
      { category: 'Music Production', posts: 892, color: 'bg-purple-600' },
      { category: 'AI Artist Showcase', posts: 567, color: 'bg-cyan-600' },
      { category: 'Collaborations', posts: 423, color: 'bg-green-600' },
      { category: 'Feedback & Reviews', posts: 389, color: 'bg-yellow-600' }
    ]
  };
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would fetch from an API
        setPosts(mockPosts);
        setCategories(mockCategories);
        setStats(mockStats);
        
        // Set current user profile
        if (currentUser) {
          setUserProfile({
            id: currentUser.id,
            username: currentUser.username || 'user',
            fullName: currentUser.fullName || currentUser.username || 'User',
            avatarUrl: currentUser.imageUrl || '',
            isVerified: false,
            role: 'user',
            stats: {
              posts: userStats.posts,
              replies: userStats.replies,
              likes: userStats.likes,
              joinedAt: new Date().toISOString()
            }
          });
        }
      } catch (error) {
        console.error('Error loading forum data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [currentUser, userStats]);
  
  // Handle creating a new post
  const handleCreatePost = async () => {
    if (!currentUser || !postForm.title.trim() || !postForm.content.trim()) return;
    
    try {
      // In a real app, this would call an API
      const newPost: ForumPost = {
        id: `post-${Date.now()}`,
        title: postForm.title,
        content: postForm.content,
        excerpt: postForm.content.substring(0, 150) + '...',
        author: {
          id: currentUser.id,
          username: currentUser.username || 'user',
          fullName: currentUser.fullName || currentUser.username || 'User',
          avatarUrl: currentUser.imageUrl || '',
          isVerified: false,
          role: 'user',
          stats: {
            posts: userStats.posts + 1,
            replies: userStats.replies,
            likes: userStats.likes,
            joinedAt: new Date().toISOString()
          }
        },
        category: postForm.category,
        tags: postForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: postForm.isPinned,
        isLocked: postForm.isLocked,
        isFeatured: false,
        views: 0,
        likes: 0,
        replies: 0,
        reactions: [
          { type: 'like', count: 0, hasReacted: false },
          { type: 'love', count: 0, hasReacted: false },
          { type: 'wow', count: 0, hasReacted: false }
        ],
        isLiked: false,
        isBookmarked: false
      };
      
      setPosts(prev => [newPost, ...prev]);
      setIsCreatePostOpen(false);
      setPostForm({
        title: '',
        content: '',
        category: '',
        tags: '',
        isPinned: false,
        isLocked: false
      });
      
      // Update user stats
      setUserStats(prev => ({
        ...prev,
        posts: prev.posts + 1
      }));
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  
  // Handle liking a post
  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };
  
  // Handle bookmarking a post
  const handleBookmarkPost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked
        };
      }
      return post;
    }));
  };
  
  // Handle opening a post
  const handleOpenPost = (post: ForumPost) => {
    setSelectedPost(post);
    setIsPostDetailOpen(true);
    
    // In a real app, this would fetch the post details and replies
    setReplies([
      {
        id: `reply-1`,
        content: 'This is a great question! I\'ve found that using specific training data from authentic 80s synthwave tracks really helps. Also, paying attention to the drum patterns and bass frequencies makes a big difference.',
        author: {
          id: 'user-2',
          username: 'ai_musician',
          fullName: 'Alex Rivera',
          avatarUrl: 'https://i.pravatar.cc/150?u=ai_musician',
          isVerified: true,
          role: 'moderator',
          stats: {
            posts: 67,
            replies: 567,
            likes: 2345,
            joinedAt: '2022-11-20'
          }
        },
        createdAt: '2023-10-05T15:30:00Z',
        likes: 23,
        isLiked: false
      },
      {
        id: `reply-2`,
        content: 'Another tip is to use vintage hardware emulation plugins. They can add that analog warmth that AI sometimes misses. I like to run my AI-generated tracks through a tape emulation plugin.',
        author: {
          id: 'user-7',
          username: 'vintage_sound',
          fullName: 'Sam Wilson',
          avatarUrl: 'https://i.pravatar.cc/150?u=vintage_sound',
          isVerified: false,
          role: 'user',
          stats: {
            posts: 34,
            replies: 234,
            likes: 567,
            joinedAt: '2023-04-12'
          }
        },
        createdAt: '2023-10-05T16:45:00Z',
        likes: 15,
        isLiked: false
      }
    ]);
  };
  
  // Handle submitting a reply
  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !selectedPost || !currentUser) return;
    
    try {
      // In a real app, this would call an API
      const newReply = {
        id: `reply-${Date.now()}`,
        content: replyContent,
        author: {
          id: currentUser.id,
          username: currentUser.username || 'user',
          fullName: currentUser.fullName || currentUser.username || 'User',
          avatarUrl: currentUser.imageUrl || '',
          isVerified: false,
          role: 'user',
          stats: {
            posts: userStats.posts,
            replies: userStats.replies + 1,
            likes: userStats.likes,
            joinedAt: new Date().toISOString()
          }
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };
      
      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
      
      // Update post reply count
      setPosts(prev => prev.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            replies: post.replies + 1,
            lastReply: {
              author: newReply.author,
              createdAt: newReply.createdAt
            }
          };
        }
        return post;
      }));
      
      // Update user stats
      setUserStats(prev => ({
        ...prev,
        replies: prev.replies + 1
      }));
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };
  
  // Handle search/filter change
  const handleSearchChange = (key: keyof ForumSearchFilters, value: any) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    // Apply search filters
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (searchFilters.category) {
      filtered = filtered.filter(post => post.category === searchFilters.category);
    }
    
    if (searchFilters.minLikes > 0) {
      filtered = filtered.filter(post => post.likes >= searchFilters.minLikes);
    }
    
    if (searchFilters.hasImages) {
      filtered = filtered.filter(post => post.images && post.images.length > 0);
    }
    
    if (searchFilters.hasAttachments) {
      filtered = filtered.filter(post => post.attachments && post.attachments.length > 0);
    }
    
    // Sort posts
    switch (searchFilters.sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'trending':
        // In a real app, this would consider more complex trending algorithms
        filtered.sort((a, b) => b.replies - a.replies);
        break;
      case 'mostReplies':
        filtered.sort((a, b) => b.replies - a.replies);
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    return filtered;
  }, [posts, searchFilters]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  // Get reaction icon
  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'laugh': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '👍';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-mono font-bold text-glow-cyan mb-2">
            Community Forums
          </h1>
          <p className="text-gray-400">
            Connect with other music lovers, producers, and AI artists
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreatePostOpen(true)}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Post</span>
        </Button>
      </div>
      
      {/* Forum Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{stats.totalPosts.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-lime-400">{stats.totalReplies.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Replies</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">{stats.activeToday}</div>
              <div className="text-sm text-gray-400">Active Today</div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-cyan-400" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <div 
                key={category.id}
                className="p-4 rounded-lg bg-black/30 border border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer"
                onClick={() => handleSearchChange('category', category.name)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.color} text-white`}>
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-sm">{category.name}</h3>
                </div>
                <p className="text-xs text-gray-400 mb-2">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{category.postCount} posts</span>
                  {category.isModerated && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Moderated
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts, tags, or authors..."
                  value={searchFilters.query}
                  onChange={(e) => handleSearchChange('query', e.target.value)}
                  className="pl-10 bg-black/30 border-gray-700"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={searchFilters.sortBy} onValueChange={(value) => handleSearchChange('sortBy', value)}>
                <SelectTrigger className="w-32 bg-black/30 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="mostReplies">Most Replies</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={searchFilters.dateRange} onValueChange={(value) => handleSearchChange('dateRange', value)}>
                <SelectTrigger className="w-32 bg-black/30 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Additional Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={searchFilters.hasImages ? "default" : "outline"}
              size="sm"
              onClick={() => handleSearchChange('hasImages', !searchFilters.hasImages)}
              className="text-xs"
            >
              <Image className="h-3 w-3 mr-1" />
              With Images
            </Button>
            <Button
              variant={searchFilters.hasAttachments ? "default" : "outline"}
              size="sm"
              onClick={() => handleSearchChange('hasAttachments', !searchFilters.hasAttachments)}
              className="text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              With Attachments
            </Button>
            <Button
              variant={searchFilters.minLikes > 0 ? "default" : "outline"}
              size="sm"
              onClick={() => handleSearchChange('minLikes', searchFilters.minLikes > 0 ? 0 : 10)}
              className="text-xs"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {searchFilters.minLikes > 0 ? `+${searchFilters.minLikes} Likes` : 'Min Likes'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-bold mb-2">No posts found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => setIsCreatePostOpen(true)}>
                Create the first post
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <Card 
              key={post.id} 
              className="hover:border-cyan-500/30 transition-all cursor-pointer"
              onClick={() => handleOpenPost(post)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Author Info */}
                  <div className="flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.author.avatarUrl} />
                      <AvatarFallback>{post.author.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-lg truncate">{post.title}</h3>
                          {post.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              <Pin className="h-3 w-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          {post.isLocked && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                          {post.isFeatured && (
                            <Badge variant="secondary" className="text-xs bg-yellow-600/20 text-yellow-400">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm text-gray-400">
                          <span>{post.author.fullName}</span>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Bookmark className="h-4 w-4 mr-2" />
                            {post.isBookmarked ? 'Unbookmark' : 'Bookmark'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          {post.author.id === currentUser?.id && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-gray-300 mb-3 line-clamp-2">{post.excerpt}</p>
                    
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:border-cyan-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSearchChange('query', `#${tag}`);
                            }}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.replies}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </div>
                      </div>
                      
                      {/* Reactions */}
                      <div className="flex items-center space-x-2">
                        {post.reactions.slice(0, 3).map((reaction, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="text-xs px-2 py-1 h-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle reaction
                            }}
                          >
                            <span className="mr-1">{getReactionIcon(reaction.type)}</span>
                            {reaction.count > 0 && <span>{reaction.count}</span>}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Create Post Dialog */}
      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={postForm.title}
                onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                placeholder="Enter a descriptive title"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={postForm.category} onValueChange={(value) => setPostForm({...postForm, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={postForm.content}
                onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                placeholder="Write your post content here..."
                rows={6}
              />
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={postForm.tags}
                onChange={(e) => setPostForm({...postForm, tags: e.target.value})}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pinned"
                  checked={postForm.isPinned}
                  onCheckedChange={(checked) => setPostForm({...postForm, isPinned: checked})}
                />
                <Label htmlFor="pinned">Pin this post</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="locked"
                  checked={postForm.isLocked}
                  onCheckedChange={(checked) => setPostForm({...postForm, isLocked: checked})}
                />
                <Label htmlFor="locked">Lock this post</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost}>
                Create Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Post Detail Dialog */}
      <Dialog open={isPostDetailOpen} onOpenChange={setIsPostDetailOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-6">
              {/* Post Header */}
              <div className="flex gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPost.author.avatarUrl} />
                  <AvatarFallback>{selectedPost.author.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="font-bold">{selectedPost.author.fullName}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>@{selectedPost.author.username}</span>
                        {selectedPost.author.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {selectedPost.author.role !== 'user' && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedPost.author.role === 'moderator' ? (
                              <Shield className="h-3 w-3 mr-1" />
                            ) : (
                              <Crown className="h-3 w-3 mr-1" />
                            )}
                            {selectedPost.author.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      {formatDate(selectedPost.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Badge variant="outline">{selectedPost.category}</Badge>
                    {selectedPost.isPinned && (
                      <Badge variant="secondary">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="prose prose-invert max-w-none">
                <p>{selectedPost.content}</p>
              </div>
              
              {/* Post Images */}
              {selectedPost.images && selectedPost.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPost.images.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Post image ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Post Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span>{selectedPost.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                    <span>{selectedPost.replies} replies</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4 text-gray-400" />
                    <span>{selectedPost.likes} likes</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={selectedPost.isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLikePost(selectedPost.id)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {selectedPost.isLiked ? 'Liked' : 'Like'}
                  </Button>
                  
                  <Button
                    variant={selectedPost.isBookmarked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleBookmarkPost(selectedPost.id)}
                  >
                    <Bookmark className="h-4 w-4 mr-1" />
                    {selectedPost.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
              
              {/* Replies Section */}
              <div>
                <h3 className="text-lg font-bold mb-4">
                  {selectedPost.replies} {selectedPost.replies === 1 ? 'Reply' : 'Replies'}
                </h3>
                
                {/* Reply Input */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser?.imageUrl || ''} />
                      <AvatarFallback>{currentUser?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button 
                          onClick={handleReplySubmit}
                          disabled={!replyContent.trim()}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Replies List */}
                <div className="space-y-4">
                  {replies.map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={reply.author.avatarUrl} />
                        <AvatarFallback>{reply.author.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 bg-black/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold">{reply.author.fullName}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <span>@{reply.author.username}</span>
                              {reply.author.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {reply.author.role !== 'user' && (
                                <Badge variant="secondary" className="text-xs">
                                  {reply.author.role === 'moderator' ? (
                                    <Shield className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Crown className="h-3 w-3 mr-1" />
                                  )}
                                  {reply.author.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-400">
                            {formatDate(reply.createdAt)}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-3">{reply.content}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-cyan-400"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {reply.likes}
                            </Button>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400">
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityForums;