import React, { useState, useMemo } from 'react';
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
  Star
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
  showComments?: boolean;
  showStats?: boolean;
  onLike?: (liked: boolean) => void;
  onBookmark?: (bookmarked: boolean) => void;
  onShare?: (platform: string) => void;
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
  showComments = true,
  showStats = true,
  onLike,
  onBookmark,
  onShare,
  className = ""
}) => {
  const { user } = useClerkUser();
  const { toggleLikeTrack, likedTrackIds } = useLibraryStore();
  
  // State management
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCreatePlaylistDialog, setShowCreatePlaylistDialog] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  
  // Share options for different platforms
  const shareOptions: ShareOptions[] = [
    { platform: 'twitter', url: 'https://twitter.com/intent/tweet', title: 'Twitter' },
    { platform: 'facebook', url: 'https://www.facebook.com/sharer/sharer.php', title: 'Facebook' },
    { platform: 'instagram', url: '#', title: 'Instagram' },
    { platform: 'whatsapp', url: 'https://wa.me/?text=', title: 'WhatsApp' },
    { platform: 'telegram', url: 'https://t.me/share/url', title: 'Telegram' },
    { platform: 'copy', url: 'copy', title: 'Copy Link' },
    { platform: 'download', url: '#', title: 'Download' },
  ];
  
  // Handle like/unlike action
  const handleLike = () => {
    const newLikedState = !isLiked;
    
    // Update local state
    setIsFollowing(newLikedState);
    
    // Call callback if provided
    if (onLike) {
      onLike(newLikedState);
    }
    
    // Update library store if it's a track
    if (contentType === 'track') {
      toggleLikeTrack(contentId);
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
          <Button
            variant={isLiked ? "default" : "ghost"}
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-1 transition-all ${
              isLiked 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount > 0 ? likesCount : 'Like'}</span>
          </Button>
          
          {showComments && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-lime-400 hover:bg-lime-500/10"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{commentsCount > 0 ? commentsCount : 'Comment'}</span>
            </Button>
          )}
          
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
                      className="justify-center text-xs hover:bg-lime-500/10"
                    >
                      {option.platform === 'copy' && <Copy className="h-3 w-3 mr-1" />}
                      {option.platform === 'download' && <Download className="h-3 w-3 mr-1" />}
                      {option.platform === 'twitter' && '𝕏'}
                      {option.platform === 'facebook' && 'f'}
                      {option.platform === 'instagram' && '📷'}
                      {option.platform === 'whatsapp' && '💬'}
                      {option.platform === 'telegram' && '📱'}
                      {option.platform === 'copy' && 'Copy'}
                      {option.platform === 'download' && 'Download'}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant={isBookmarked ? "default" : "ghost"}
            size="sm"
            onClick={handleBookmark}
            className={`flex items-center space-x-1 transition-all ${
              isBookmarked 
                ? 'bg-lime-600 hover:bg-lime-700 text-white' 
                : 'text-gray-400 hover:text-lime-400 hover:bg-lime-500/10'
            }`}
          >
            <BookMark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{bookmarksCount > 0 ? bookmarksCount : 'Save'}</span>
          </Button>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {contentType === 'artist' && (
            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFollowing(!isFollowing)}
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
          
          {contentType === 'artist' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-lime-400">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowCreatePlaylistDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Playlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowGiftDialog(true)}>
                  <Gift className="h-4 w-4 mr-2" />
                  Gift Subscription
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  Add to Favorites
                </DropdownMenuItem>
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
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this {contentType}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {shareOptions.map((option) => (
                <Button
                  key={option.platform}
                  variant="outline"
                  onClick={() => handleShare(option.platform)}
                  className="justify-start"
                >
                  {option.platform === 'copy' && <Copy className="h-4 w-4 mr-2" />}
                  {option.platform === 'download' && <Download className="h-4 w-4 mr-2" />}
                  {option.platform === 'twitter' && '𝕏'}
                  {option.platform === 'facebook' && 'Facebook'}
                  {option.platform === 'instagram' && 'Instagram'}
                  {option.platform === 'whatsapp' && 'WhatsApp'}
                  {option.platform === 'telegram' && 'Telegram'}
                  {option.platform === 'copy' && 'Copy Link'}
                  {option.platform === 'download' && 'Download'}
                </Button>
              ))}
            </div>
            
            <div className="relative">
              <Input
                value={window.location.href}
                readOnly
                className="pr-10"
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
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Create Playlist Dialog */}
      <Dialog open={showCreatePlaylistDialog} onOpenChange={setShowCreatePlaylistDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="playlist-title">Playlist Title</Label>
              <Input
                id="playlist-title"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="Enter playlist title"
              />
            </div>
            <div>
              <Label htmlFor="playlist-description">Description (Optional)</Label>
              <Textarea
                id="playlist-description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="Enter playlist description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreatePlaylistDialog(false)}
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
      
      {/* Gift Subscription Dialog */}
      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gift Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4">
              <Gift className="h-12 w-12 mx-auto mb-2 text-lime-400" />
              <p className="text-gray-300">Give the gift of premium access to this artist</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <p className="font-bold">1 Month</p>
                  <p className="text-sm text-lime-400">$9.99</p>
                </div>
              </Button>
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <p className="font-bold">3 Months</p>
                  <p className="text-sm text-lime-400">$24.99</p>
                </div>
              </Button>
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <p className="font-bold">1 Year</p>
                  <p className="text-sm text-lime-400">$89.99</p>
                </div>
              </Button>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowGiftDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleGiftSubscription}>
                Continue to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialInteractions;