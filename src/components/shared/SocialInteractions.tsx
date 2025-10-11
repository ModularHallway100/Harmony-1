import React, { useState, useMemo, useEffect } from 'react';
import { useLibraryStore } from '@/store/library-store';
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  Share2,
  BookMark,
  MessageSquare,
  Play,
  UserPlus,
  Gift,
  Copy,
  MoreHorizontal,
  Download,
  Plus,
  Check,
  Eye,
  TrendingUp,
  Star,
  ThumbsUp,
  ThumbsDown,
  HeartPulse,
  Users,
  Calendar,
  Radio,
  Music,
  Headphones,
  Zap,
  Award,
  Crown,
  Sparkles,
  Flame,
  Activity,
  BarChart3,
  Heart as HeartSolid,
  FolderOpen,
  Tag,
  Clock,
  Bookmark as BookmarkSolid,
  X,
  Edit3,
  Trash2,
  FolderPlus,
  Save,
  Library,
  Grid,
  List
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShareOptions {
  platform: string;
  url: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface LikeActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
  type: 'like' | 'unlike' | 'superlike';
}

interface BookmarkCollection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SocialInteractionsProps {
  contentId: string;
  contentType: 'track' | 'playlist' | 'artist';
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  bookmarksCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isDisliked?: boolean;
  showComments?: boolean;
  showStats?: boolean;
  showLikeActivity?: boolean;
  showSuperLike?: boolean;
  currentUserRole?: 'user' | 'moderator' | 'admin';
  onLike?: (liked: boolean) => void;
  onDislike?: (disliked: boolean) => void;
  onBookmark?: (bookmarked: boolean) => void;
  onShare?: (platform: string) => void;
  onFollow?: (followed: boolean) => void;
  className?: string;
}

const SocialInteractions: React.FC<SocialInteractionsProps> = ({
  contentId,
  contentType,
  likesCount = 0,
  commentsCount = 0,
  sharesCount = 0,
  bookmarksCount = 0,
  isLiked = false,
  isBookmarked = false,
  isDisliked = false,
  showComments = true,
  showStats = true,
  showLikeActivity = true,
  showSuperLike = true,
  currentUserRole = 'user',
  onLike,
  onDislike,
  onBookmark,
  onShare,
  onFollow,
  className = ""
}) => {
  const { user } = useClerkUser();
  const { toggleLikeTrack, likedTrackIds, dislikeTrack, likedPlaylistIds, likedArtistIds } = useLibraryStore();
  
  // State management
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCreatePlaylistDialog, setShowCreatePlaylistDialog] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [showLikeActivityDialog, setShowLikeActivityDialog] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [superLikeAnimation, setSuperLikeAnimation] = useState(false);
  const [recentLikes, setRecentLikes] = useState<LikeActivity[]>([]);
  
  // Bookmark state management
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionColor, setNewCollectionColor] = useState('#10b981');
  const [newCollectionIcon, setNewCollectionIcon] = useState('star');
  const [bookmarkCollections, setBookmarkCollections] = useState<BookmarkCollection[]>([
    {
      id: 'collection-1',
      name: 'Favorites',
      description: 'My most loved tracks and playlists',
      color: '#f59e0b',
      icon: 'star',
      itemCount: 24,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: 'collection-2',
      name: 'Chill Vibes',
      description: 'Relaxing music for any mood',
      color: '#3b82f6',
      icon: 'moon',
      itemCount: 18,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    },
    {
      id: 'collection-3',
      name: 'Workout Mix',
      description: 'High energy tracks for exercise',
      color: '#ef4444',
      icon: 'zap',
      itemCount: 32,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
    }
  ]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Share options for different platforms
  const shareOptions: ShareOptions[] = [
    {
      platform: 'twitter',
      url: 'https://twitter.com/intent/tweet',
      title: 'Twitter',
      icon: '𝕏',
      color: 'text-blue-400 hover:bg-blue-500/10'
    },
    {
      platform: 'facebook',
      url: 'https://www.facebook.com/sharer/sharer.php',
      title: 'Facebook',
      icon: 'f',
      color: 'text-blue-600 hover:bg-blue-600/10'
    },
    {
      platform: 'instagram',
      url: '#',
      title: 'Instagram',
      icon: '📷',
      color: 'text-pink-400 hover:bg-pink-500/10'
    },
    {
      platform: 'whatsapp',
      url: 'https://wa.me/?text=',
      title: 'WhatsApp',
      icon: '💬',
      color: 'text-green-400 hover:bg-green-500/10'
    },
    {
      platform: 'telegram',
      url: 'https://t.me/share/url',
      title: 'Telegram',
      icon: '📱',
      color: 'text-blue-500 hover:bg-blue-500/10'
    },
    {
      platform: 'copy',
      url: 'copy',
      title: 'Copy Link',
      icon: <Copy className="h-4 w-4" />,
      color: 'text-gray-400 hover:bg-gray-500/10'
    },
    {
      platform: 'download',
      url: '#',
      title: 'Download',
      icon: <Download className="h-4 w-4" />,
      color: 'text-gray-400 hover:bg-gray-500/10'
    },
  ];
  
  // Simulate recent like activity
  useEffect(() => {
    if (showLikeActivity) {
      const mockLikes: LikeActivity[] = [
        {
          id: `like-${crypto.randomUUID()}`,
          userId: 'user-1',
          userName: 'Alex Johnson',
          userAvatar: 'https://i.pravatar.cc/150?u=alex',
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          type: 'like'
        },
        {
          id: `like-${crypto.randomUUID()}`,
          userId: 'user-2',
          userName: 'Sarah Chen',
          userAvatar: 'https://i.pravatar.cc/150?u=sarah',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          type: 'superlike'
        },
        {
          id: `like-${crypto.randomUUID()}`,
          userId: 'user-3',
          userName: 'Mike Wilson',
          userAvatar: 'https://i.pravatar.cc/150?u=mike',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          type: 'like'
        }
      ];
      setRecentLikes(mockLikes);
    }
  }, [showLikeActivity]);
  
  // Handle like/unlike action
  const handleLike = (isSuperLike: boolean = false) => {
    const newLikedState = !isLiked;
    
    // Trigger animation
    if (isSuperLike) {
      setSuperLikeAnimation(true);
      setTimeout(() => setSuperLikeAnimation(false), 1000);
    } else {
      setLikeAnimation(true);
      setTimeout(() => setLikeAnimation(false), 600);
    }
    
    // Update local state
    setIsFollowing(newLikedState);
    
    // Call callback if provided
    if (onLike) {
      onLike(newLikedState);
    }
    
    // Update library store based on content type
    if (contentType === 'track') {
      if (newLikedState) {
        toggleLikeTrack(contentId);
      } else {
        // Remove from liked tracks
        useLibraryStore.getState().likedTrackIds = likedTrackIds.filter(id => id !== contentId);
      }
    } else if (contentType === 'playlist') {
      useLibraryStore.getState().likedPlaylistIds = newLikedState
        ? [...likedPlaylistIds, contentId]
        : likedPlaylistIds.filter(id => id !== contentId);
    } else if (contentType === 'artist') {
      useLibraryStore.getState().likedArtistIds = newLikedState
        ? [...likedArtistIds, contentId]
        : likedArtistIds.filter(id => id !== contentId);
    }
  };
  
  // Handle dislike action
  const handleDislike = () => {
    const newDislikedState = !isDisliked;
    
    // Call callback if provided
    if (onDislike) {
      onDislike(newDislikedState);
    }
    
    // Update library store if it's a track
    if (contentType === 'track') {
      dislikeTrack(contentId);
    }
  };
  
  // Handle bookmark action
  const handleBookmark = () => {
    const newBookmarkedState = !isBookmarked;
    
    // Update local state
    setIsSubscribed(newBookmarkedState);
    
    // Call callback if provided
    if (onBookmark) {
      onBookmark(newBookmarkedState);
    }
    
    // In a real app, this would save to the user's library
    console.log(`Bookmark ${newBookmarkedState ? 'added' : 'removed'} for ${contentType}:`, contentId);
  };
  
  // Handle bookmark with collection selection
  const handleBookmarkWithCollections = () => {
    if (selectedCollections.length === 0) {
      // If no collections selected, just bookmark as before
      handleBookmark();
      return;
    }
    
    // Update collections with this content
    const updatedCollections = bookmarkCollections.map(collection => {
      if (selectedCollections.includes(collection.id)) {
        return {
          ...collection,
          itemCount: collection.itemCount + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return collection;
    });
    
    setBookmarkCollections(updatedCollections);
    setShowBookmarkDialog(false);
    setSelectedCollections([]);
    
    // Call callback if provided
    if (onBookmark) {
      onBookmark(true);
    }
    
    console.log(`Bookmark added to collections for ${contentType}:`, contentId, selectedCollections);
  };
  
  // Handle create collection
  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    
    const newCollection: BookmarkCollection = {
      id: `collection-${crypto.randomUUID()}`,
      name: newCollectionName,
      description: newCollectionDescription,
      color: newCollectionColor,
      icon: newCollectionIcon,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setBookmarkCollections([...bookmarkCollections, newCollection]);
    setNewCollectionName('');
    setNewCollectionDescription('');
    setNewCollectionColor('#10b981');
    setNewCollectionIcon('star');
    setShowCreateCollectionDialog(false);
    
    // Automatically select the new collection
    setSelectedCollections([newCollection.id]);
  };
  
  // Handle delete collection
  const handleDeleteCollection = (collectionId: string) => {
    setBookmarkCollections(bookmarkCollections.filter(c => c.id !== collectionId));
    setSelectedCollections(selectedCollections.filter(id => id !== collectionId));
  };
  
  // Handle toggle collection selection
  const handleToggleCollection = (collectionId: string) => {
    if (selectedCollections.includes(collectionId)) {
      setSelectedCollections(selectedCollections.filter(id => id !== collectionId));
    } else {
      setSelectedCollections([...selectedCollections, collectionId]);
    }
  };
  
  // Get collection icon component
  const getCollectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return <Star className="h-4 w-4" />;
      case 'heart': return <Heart className="h-4 w-4" />;
      case 'music': return <Music className="h-4 w-4" />;
      case 'headphones': return <Headphones className="h-4 w-4" />;
      case 'zap': return <Zap className="h-4 w-4" />;
      case 'flame': return <Flame className="h-4 w-4" />;
      case 'sparkles': return <Sparkles className="h-4 w-4" />;
      case 'crown': return <Crown className="h-4 w-4" />;
      case 'award': return <Award className="h-4 w-4" />;
      case 'folder': return <FolderOpen className="h-4 w-4" />;
      default: return <BookMark className="h-4 w-4" />;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  // Handle follow/unfollow for artists
  const handleFollow = () => {
    const newFollowState = !isFollowing;
    
    // Update local state
    setIsFollowing(newFollowState);
    
    // Call callback if provided
    if (onFollow) {
      onFollow(newFollowState);
    }
    
    // In a real app, this would update the follow status in the database
    console.log(`Follow ${newFollowState ? 'started' : 'stopped'} for artist:`, contentId);
  };
  
  // Handle share action
  const handleShare = (platform: string) => {
    if (onShare) {
      onShare(platform);
    }
    
    if (platform === 'copy') {
      // Copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
    
    setShowShareDialog(false);
  };
  
  // Handle create playlist
  const handleCreatePlaylist = () => {
    if (!newPlaylistTitle.trim()) return;
    
    // Here you would typically call an API to create the playlist
    console.log('Creating playlist:', {
      title: newPlaylistTitle,
      description: newPlaylistDescription,
      contentId,
      contentType
    });
    
    setNewPlaylistTitle('');
    setNewPlaylistDescription('');
    setShowCreatePlaylistDialog(false);
  };
  
  // Handle gift subscription
  const handleGiftSubscription = () => {
    // Here you would typically call an API to process the gift
    console.log('Gifting subscription');
    setShowGiftDialog(false);
  };
  
  // Generate share URLs
  const generateShareUrl = (option: ShareOptions) => {
    const baseUrl = window.location.href;
    const encodedUrl = encodeURIComponent(baseUrl);
    const encodedTitle = encodeURIComponent('Check out this amazing content on Harmony!');
    const encodedDescription = encodeURIComponent('Discover new music and AI artists on Harmony.');
    
    switch (option.platform) {
      case 'twitter':
        return `${option.url}?text=${encodedTitle}%20${encodedUrl}`;
      case 'facebook':
        return `${option.url}?u=${encodedUrl}&quote=${encodedTitle}`;
      case 'whatsapp':
        return `${option.url}${encodedTitle}%20${encodedUrl}`;
      case 'telegram':
        return `${option.url}?url=${encodedUrl}&text=${encodedTitle}`;
      default:
        return baseUrl;
    }
  };
  
  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Main Interaction Bar */}
      <div className="flex items-center justify-between">
        {/* Left Actions */}
        <div className="flex items-center space-x-2">
          {/* Like Button */}
          <div className="relative">
            <Button
              variant={isLiked ? "default" : "ghost"}
              size="sm"
              onClick={() => handleLike(false)}
              className={`flex items-center space-x-1 transition-all relative overflow-hidden ${
                isLiked
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
              }`}
              disabled={likeAnimation}
            >
              <Heart className={`h-4 w-4 transition-transform ${likeAnimation ? 'scale-125' : ''} ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount > 0 ? likesCount : 'Like'}</span>
              
              {/* Like animation effect */}
              {likeAnimation && (
                <div className="absolute inset-0 bg-red-400 opacity-30 animate-ping"></div>
              )}
            </Button>
            
            {/* Super Like Button */}
            {showSuperLike && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(true)}
                className={`absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 transition-transform z-10 ${
                  isLiked ? 'opacity-100' : 'opacity-70'
                }`}
                title="Super Like"
              >
                <Zap className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Dislike Button */}
          {contentType === 'track' && (
            <Button
              variant={isDisliked ? "default" : "ghost"}
              size="sm"
              onClick={handleDislike}
              className={`flex items-center space-x-1 transition-all ${
                isDisliked
                  ? 'bg-gray-700 hover:bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-500/10'
              }`}
            >
              <ThumbsDown className={`h-4 w-4 ${isDisliked ? 'fill-current' : ''}`} />
            </Button>
          )}
          
          {/* Comments Button */}
          {showComments && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-lime-400 hover:bg-lime-500/10 relative"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{commentsCount > 0 ? commentsCount : 'Comment'}</span>
              
              {/* Like Activity Indicator */}
              {showLikeActivity && recentLikes.length > 0 && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-lime-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-black font-bold">{recentLikes.length}</span>
                </div>
              )}
            </Button>
          )}
          
          {/* Share Dropdown */}
          <DropdownMenu open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
              >
                <Share2 className="h-4 w-4 mr-1" />
                <span>{sharesCount > 0 ? sharesCount : 'Share'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-xs text-gray-400 mb-2">Share to</p>
                <div className="grid grid-cols-3 gap-1">
                  {shareOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.platform}
                      onClick={() => handleShare(option.platform)}
                      className={`justify-center text-xs hover:bg-lime-500/10 ${option.color}`}
                    >
                      {option.icon}
                      <span className="ml-1">{option.title}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
                
                {/* Like Activity Preview */}
                {showLikeActivity && recentLikes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-700">
                    <p className="text-xs text-gray-400 mb-1">Recent Activity</p>
                    <div className="space-y-1">
                      {recentLikes.slice(0, 3).map((like) => (
                        <div key={like.id} className="flex items-center space-x-1 text-xs">
                          <div className="w-4 h-4 rounded-full bg-lime-400/20 flex items-center justify-center">
                            <HeartPulse className="h-2 w-2 text-lime-400" />
                          </div>
                          <span className="text-gray-300 truncate">{like.userName}</span>
                          <span className="text-gray-500">liked this</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Bookmark Button */}
          <DropdownMenu open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isBookmarked ? "default" : "ghost"}
                size="sm"
                className={`flex items-center space-x-1 transition-all ${
                  isBookmarked
                    ? 'bg-lime-600 hover:bg-lime-700 text-white'
                    : 'text-gray-400 hover:text-lime-400 hover:bg-lime-500/10'
                }`}
              >
                <BookMark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{bookmarksCount > 0 ? bookmarksCount : 'Save'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300">Save to Collections</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateCollectionDialog(true)}
                    className="h-6 w-6 p-0 text-lime-400 hover:text-lime-300"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Collections List */}
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {bookmarkCollections.map((collection) => (
                    <div
                      key={collection.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedCollections.includes(collection.id)
                          ? 'bg-lime-500/10 border border-lime-500/30'
                          : 'hover:bg-neutral-800'
                      }`}
                      onClick={() => handleToggleCollection(collection.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${collection.color}20` }}
                        >
                          {getCollectionIcon(collection.icon)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-300">{collection.name}</p>
                          <p className="text-xs text-gray-500">{collection.itemCount} items</p>
                        </div>
                      </div>
                      {selectedCollections.includes(collection.id) && (
                        <Check className="h-4 w-4 text-lime-400" />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Create Collection Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateCollectionDialog(true)}
                  className="w-full mt-2 justify-start text-gray-400 hover:text-lime-400"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create New Collection
                </Button>
                
                {/* Quick Save Option */}
                <div className="mt-3 pt-3 border-t border-neutral-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className="w-full justify-start text-gray-400 hover:text-lime-400"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Quick Save (No Collection)
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Follow Button for Artists */}
          {contentType === 'artist' && (
            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              onClick={handleFollow}
              className={`flex items-center space-x-1 transition-all ${
                isFollowing
                  ? 'bg-lime-600 hover:bg-lime-700 text-white'
                  : 'border-lime-500 text-lime-400 hover:bg-lime-500/10'
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Follow</span>
                </>
              )}
            </Button>
          )}
          
          {/* More Actions Dropdown */}
          {(contentType === 'artist' || currentUserRole !== 'user') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-lime-400">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {contentType === 'artist' && (
                  <>
                    <DropdownMenuItem onClick={() => setShowCreatePlaylistDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowGiftDialog(true)}>
                      <Gift className="h-4 w-4 mr-2" />
                      Gift Subscription
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuItem onClick={() => setShowLikeActivityDialog(true)}>
                  <Activity className="h-4 w-4 mr-2" />
                  View Like Activity
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  Add to Favorites
                </DropdownMenuItem>
                
                {currentUserRole !== 'user' && (
                  <>
                    <DropdownMenuItem>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Moderation Tools
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Content
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Stats Display */}
      {showStats && (
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{Math.floor(Math.random() * 10000).toLocaleString()} plays</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>{likesCount.toLocaleString()} likes</span>
          </div>
          {showComments && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{commentsCount.toLocaleString()} comments</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <BookMark className="h-4 w-4" />
            <span>{bookmarksCount.toLocaleString()} saves</span>
          </div>
          {contentType === 'artist' && isFollowing && (
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Following</span>
            </div>
          )}
        </div>
      )}
      
      {/* Like Activity Dialog */}
      <Dialog open={showLikeActivityDialog} onOpenChange={setShowLikeActivityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-lime-400" />
              Recent Like Activity
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {recentLikes.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentLikes.map((like) => (
                  <div key={like.id} className="flex items-center space-x-3 p-3 bg-neutral-900/30 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={like.userAvatar} />
                      <AvatarFallback>{like.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-300">{like.userName}</p>
                        {like.type === 'superlike' && (
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                            Super Like
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(like.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-lime-400">
                      {like.type === 'superlike' ? (
                        <HeartPulse className="h-5 w-5" />
                      ) : (
                        <Heart className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent like activity</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Stats Display */}
      {showStats && (
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{Math.floor(Math.random() * 10000)} plays</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>{likesCount} likes</span>
          </div>
          {showComments && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{commentsCount} comments</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <BookMark className="h-4 w-4" />
            <span>{bookmarksCount} saves</span>
          </div>
        </div>
      )}
      
      {/* Enhanced Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-400" />
              Share this {contentType}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {shareOptions.map((option) => (
                <Button
                  key={option.platform}
                  variant="outline"
                  onClick={() => handleShare(option.platform)}
                  className={`justify-start ${option.color}`}
                >
                  {option.icon}
                  <span className="ml-2">{option.title}</span>
                </Button>
              ))}
            </div>
            
            <div className="relative">
              <Input
                value={window.location.href}
                readOnly
                className="pr-10 bg-neutral-900 border-neutral-700"
                placeholder="Share link will appear here..."
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Share Preview */}
            <div className="p-3 bg-neutral-900/30 rounded-lg border border-neutral-700">
              <p className="text-xs text-gray-400 mb-2">Share Preview</p>
              <div className="flex items-center space-x-2">
                {contentType === 'track' && <Music className="h-5 w-5 text-lime-400" />}
                {contentType === 'playlist' && <Radio className="h-5 w-5 text-cyan-400" />}
                {contentType === 'artist' && <Headphones className="h-5 w-5 text-purple-400" />}
                <div>
                  <p className="text-sm font-medium text-white">Amazing {contentType}</p>
                  <p className="text-xs text-gray-400">Check this out on Harmony!</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Enhanced Create Playlist Dialog */}
      <Dialog open={showCreatePlaylistDialog} onOpenChange={setShowCreatePlaylistDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-lime-400" />
              Create New Playlist
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="playlist-title" className="text-sm text-gray-400">Playlist Title</Label>
              <Input
                id="playlist-title"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="Enter playlist title"
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            <div>
              <Label htmlFor="playlist-description" className="text-sm text-gray-400">Description (Optional)</Label>
              <Textarea
                id="playlist-description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="Enter playlist description"
                rows={3}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            
            {/* Playlist Cover Options */}
            <div>
              <Label className="text-sm text-gray-400 mb-2 block">Choose Cover</Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    className="h-16 border-neutral-700 hover:border-lime-400"
                    onClick={() => console.log('Selected cover:', num)}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-lime-600/20 to-cyan-600/20 rounded"></div>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreatePlaylistDialog(false)}
                className="text-gray-400"
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePlaylist}>
                Create Playlist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Enhanced Gift Subscription Dialog */}
      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-lime-400" />
              Gift Subscription
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-lime-600/20 to-purple-600/20 rounded-full flex items-center justify-center">
                <Crown className="h-8 w-8 text-lime-400" />
              </div>
              <p className="text-gray-300">Give the gift of premium access to this artist</p>
              <p className="text-sm text-gray-500 mt-1">Unlock exclusive content and experiences</p>
            </div>
            
            {/* Subscription Tiers */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { duration: '1 Month', price: '$9.99', features: ['All music', 'Exclusive content', 'Ad-free'] },
                  { duration: '3 Months', price: '$24.99', features: ['All music', 'Exclusive content', 'Ad-free', 'Early access'], popular: true },
                  { duration: '1 Year', price: '$89.99', features: ['All music', 'Exclusive content', 'Ad-free', 'Early access', 'Merch discounts'], savings: 'Save 25%' }
                ].map((tier, index) => (
                  <Button
                    key={index}
                    variant={tier.popular ? "default" : "outline"}
                    className={`h-auto p-4 flex-col justify-start text-left ${
                      tier.popular
                        ? 'bg-gradient-to-r from-lime-600 to-cyan-600 hover:from-lime-700 hover:to-cyan-700'
                        : 'border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div>
                        <p className="font-bold text-lg">{tier.duration}</p>
                        <p className="text-xl font-bold">{tier.price}</p>
                      </div>
                      {tier.popular && (
                        <Badge className="bg-white/20 text-white">Most Popular</Badge>
                      )}
                      {tier.savings && (
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                          {tier.savings}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm opacity-90">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-400" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Gift Message */}
            <div>
              <Label className="text-sm text-gray-400 mb-2 block">Add a Gift Message (Optional)</Label>
              <Textarea
                placeholder="Write a personal message..."
                rows={2}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowGiftDialog(false)}
                className="text-gray-400"
              >
                Cancel
              </Button>
              <Button onClick={handleGiftSubscription} className="bg-gradient-to-r from-lime-600 to-cyan-600 hover:from-lime-700 hover:to-cyan-700">
                Continue to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Enhanced Bookmark Collections Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Library className="h-5 w-5 text-lime-400" />
              Save to Collections
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Collections Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">Your Collections</h4>
                <div className="flex items-center space-x-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-6 w-6 p-0"
                  >
                    <Grid className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-6 w-6 p-0"
                  >
                    <List className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-3">
                  {bookmarkCollections.map((collection) => (
                    <div
                      key={collection.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCollections.includes(collection.id)
                          ? 'border-lime-500 bg-lime-500/10'
                          : 'border-neutral-700 hover:border-lime-400'
                      }`}
                      onClick={() => handleToggleCollection(collection.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${collection.color}20` }}
                        >
                          {getCollectionIcon(collection.icon)}
                        </div>
                        {selectedCollections.includes(collection.id) && (
                          <Check className="h-4 w-4 text-lime-400 mt-0.5" />
                        )}
                      </div>
                      <h5 className="text-sm font-medium text-gray-300 mb-1">{collection.name}</h5>
                      <p className="text-xs text-gray-500 mb-2">{collection.itemCount} items</p>
                      {collection.description && (
                        <p className="text-xs text-gray-400 truncate">{collection.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bookmarkCollections.map((collection) => (
                    <div
                      key={collection.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCollections.includes(collection.id)
                          ? 'bg-lime-500/10 border border-lime-500/30'
                          : 'hover:bg-neutral-800'
                      }`}
                      onClick={() => handleToggleCollection(collection.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${collection.color}20` }}
                        >
                          {getCollectionIcon(collection.icon)}
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-300">{collection.name}</h5>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{collection.itemCount} items</span>
                            <span>•</span>
                            <span>{formatDate(collection.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedCollections.includes(collection.id) && (
                          <Check className="h-4 w-4 text-lime-400" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollection(collection.id);
                          }}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Create Collection Section */}
            <div className="pt-3 border-t border-neutral-700">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Create New Collection</h4>
              <div className="space-y-3">
                <div>
                  <Input
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Collection name"
                    className="bg-neutral-900 border-neutral-700"
                  />
                </div>
                <div>
                  <Textarea
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="bg-neutral-900 border-neutral-700"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Color:</span>
                    <div className="flex space-x-1">
                      {['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewCollectionColor(color)}
                          className={`w-5 h-5 rounded-full border-2 ${
                            newCollectionColor === color ? 'border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Icon:</span>
                    <div className="flex space-x-1">
                      {['star', 'heart', 'music', 'headphones', 'zap', 'flame'].map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewCollectionIcon(icon)}
                          className={`w-6 h-6 rounded flex items-center justify-center ${
                            newCollectionIcon === icon ? 'bg-lime-500/20' : 'hover:bg-neutral-800'
                          }`}
                        >
                          {getCollectionIcon(icon)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateCollectionDialog(true)}
                    className="text-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection}>
                    Create Collection
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-700">
              <Button
                variant="outline"
                onClick={() => setShowBookmarkDialog(false)}
                className="text-gray-400"
              >
                Cancel
              </Button>
              <Button onClick={handleBookmarkWithCollections}>
                Save to Selected Collections
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Create Collection Dialog (Standalone) */}
      <Dialog open={showCreateCollectionDialog} onOpenChange={setShowCreateCollectionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-lime-400" />
              Create New Collection
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collection-name" className="text-sm text-gray-400">Collection Name</Label>
              <Input
                id="collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter collection name"
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            <div>
              <Label htmlFor="collection-description" className="text-sm text-gray-400">Description (Optional)</Label>
              <Textarea
                id="collection-description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Enter collection description"
                rows={3}
                className="bg-neutral-900 border-neutral-700"
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Color:</span>
                <div className="flex space-x-1">
                  {['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCollectionColor(color)}
                      className={`w-5 h-5 rounded-full border-2 ${
                        newCollectionColor === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Icon:</span>
                <div className="flex space-x-1">
                  {['star', 'heart', 'music', 'headphones', 'zap', 'flame'].map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewCollectionIcon(icon)}
                      className={`w-6 h-6 rounded flex items-center justify-center ${
                        newCollectionIcon === icon ? 'bg-lime-500/20' : 'hover:bg-neutral-800'
                      }`}
                    >
                      {getCollectionIcon(icon)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateCollectionDialog(false)}
                className="text-gray-400"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCollection}>
                Create Collection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialInteractions;