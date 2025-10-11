import React, { useState, useEffect } from 'react';
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Check, 
  Users, 
  TrendingUp, 
  Heart, 
  MessageCircle,
  Bell,
  UserCheck,
  UserX,
  Crown,
  Star,
  Zap,
  Award,
  Calendar,
  MapPin,
  Globe,
  Shield,
  Eye,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Follower {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  followedAt: string;
  isMutual: boolean;
}

interface Following {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  followedAt: string;
  isVerified: boolean;
  isAI: boolean;
  followerCount: number;
}

interface FollowStats {
  followersCount: number;
  followingCount: number;
  mutualCount: number;
}

interface FollowSystemProps {
  targetUserId?: string;
  targetUserName?: string;
  targetUserAvatar?: string;
  isFollowing?: boolean;
  isVerified?: boolean;
  isAI?: boolean;
  followerCount?: number;
  showFollowButton?: boolean;
  showStats?: boolean;
  showFollowersList?: boolean;
  showFollowingList?: boolean;
  currentUserRole?: 'user' | 'moderator' | 'admin';
  onFollow?: (followed: boolean) => void;
  onFollowRequest?: (userId: string) => void;
  className?: string;
}

const FollowSystem: React.FC<FollowSystemProps> = ({
  targetUserId,
  targetUserName,
  targetUserAvatar,
  isFollowing = false,
  isVerified = false,
  isAI = false,
  followerCount = 0,
  showFollowButton = true,
  showStats = true,
  showFollowersList = true,
  showFollowingList = true,
  currentUserRole = 'user',
  onFollow,
  onFollowRequest,
  className = ""
}) => {
  const { user } = useClerkUser();
  
  // State management
  const [isFollowingState, setIsFollowingState] = useState(isFollowing);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);
  const [showFollowRequests, setShowFollowRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [followFilter, setFollowFilter] = useState<'all' | 'mutual' | 'ai'>('all');
  const [followStats, setFollowStats] = useState<FollowStats>({
    followersCount: followerCount,
    followingCount: Math.floor(Math.random() * 1000),
    mutualCount: Math.floor(Math.random() * 100)
  });
  
  // Mock data
  const mockFollowers: Follower[] = [
    {
      id: 'f1',
      userId: 'user-1',
      userName: 'Alex Johnson',
      userAvatar: 'https://i.pravatar.cc/150?u=alex',
      followedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      isMutual: true
    },
    {
      id: 'f2',
      userId: 'user-2',
      userName: 'Sarah Chen',
      userAvatar: 'https://i.pravatar.cc/150?u=sarah',
      followedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      isMutual: false
    },
    {
      id: 'f3',
      userId: 'user-3',
      userName: 'Mike Wilson',
      userAvatar: 'https://i.pravatar.cc/150?u=mike',
      followedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isMutual: true
    },
    {
      id: 'f4',
      userId: 'user-4',
      userName: 'Emma Davis',
      userAvatar: 'https://i.pravatar.cc/150?u=emma',
      followedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      isMutual: false
    },
    {
      id: 'f5',
      userId: 'user-5',
      userName: 'AI Artist Nova',
      userAvatar: 'https://i.pravatar.cc/150?u=ai',
      followedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      isMutual: false,
      isAI: true
    }
  ];
  
  const mockFollowing: Following[] = [
    {
      id: 'f1',
      userId: 'user-1',
      userName: 'Music Producer',
      userAvatar: 'https://i.pravatar.cc/150?u=producer',
      followedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      isVerified: true,
      isAI: false,
      followerCount: 15000
    },
    {
      id: 'f2',
      userId: 'user-2',
      userName: 'DJ Harmony',
      userAvatar: 'https://i.pravatar.cc/150?u=dj',
      followedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      isVerified: true,
      isAI: false,
      followerCount: 25000
    },
    {
      id: 'f3',
      userId: 'user-3',
      userName: 'AI Composer X',
      userAvatar: 'https://i.pravatar.cc/150?u=aicomp',
      followedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      isVerified: false,
      isAI: true,
      followerCount: 8000
    },
    {
      id: 'f4',
      userId: 'user-4',
      userName: 'Sound Designer Pro',
      userAvatar: 'https://i.pravatar.cc/150?u=sound',
      followedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      isVerified: false,
      isAI: false,
      followerCount: 5000
    }
  ];
  
  const mockFollowRequests = [
    {
      id: 'req1',
      userId: 'user-6',
      userName: 'Lisa Anderson',
      userAvatar: 'https://i.pravatar.cc/150?u=lisa',
      requestedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      message: 'Love your music! Would love to connect and collaborate.'
    },
    {
      id: 'req2',
      userId: 'user-7',
      userName: 'AI Assistant Melody',
      userAvatar: 'https://i.pravatar.cc/150?u=aimelody',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      message: 'As an AI artist, I admire your work and would love to follow you.'
    }
  ];
  
  // Filter followers based on search and filter
  const filteredFollowers = mockFollowers.filter(follower => {
    const matchesSearch = follower.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = followFilter === 'all' || 
                         (followFilter === 'mutual' && follower.isMutual) ||
                         (followFilter === 'ai' && follower.isAI);
    return matchesSearch && matchesFilter;
  });
  
  // Filter following based on search
  const filteredFollowing = mockFollowing.filter(following =>
    following.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle follow/unfollow action
  const handleFollow = () => {
    const newFollowState = !isFollowingState;
    setIsFollowingState(newFollowState);
    
    // Update stats
    if (newFollowState) {
      setFollowStats(prev => ({
        ...prev,
        followersCount: prev.followersCount + 1,
        mutualCount: user && targetUserId ? prev.mutualCount + 1 : prev.mutualCount
      }));
    } else {
      setFollowStats(prev => ({
        ...prev,
        followersCount: Math.max(0, prev.followersCount - 1),
        mutualCount: user && targetUserId ? Math.max(0, prev.mutualCount - 1) : prev.mutualCount
      }));
    }
    
    // Call callback if provided
    if (onFollow) {
      onFollow(newFollowState);
    }
    
    // In a real app, this would make an API call
    console.log(`Follow ${newFollowState ? 'started' : 'stopped'} for user:`, targetUserId);
  };
  
  // Handle follow request
  const handleFollowRequest = (userId: string) => {
    if (onFollowRequest) {
      onFollowRequest(userId);
    }
    
    // Remove from requests list
    console.log('Follow request accepted for user:', userId);
  };
  
  // Handle reject follow request
  const handleRejectRequest = (userId: string) => {
    console.log('Follow request rejected for user:', userId);
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Follow Button and Stats */}
      {showFollowButton && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar with verification badge */}
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={targetUserAvatar} />
                <AvatarFallback>{targetUserName?.charAt(0)}</AvatarFallback>
              </Avatar>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              {isAI && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-purple-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{targetUserName}</h3>
                {isAI && (
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                    AI Artist
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400">
                {followStats.followersCount.toLocaleString()} followers • {followStats.followingCount.toLocaleString()} following
              </p>
            </div>
          </div>
          
          {/* Follow Button */}
          <Button
            onClick={handleFollow}
            className={`flex items-center space-x-1 ${
              isFollowingState 
                ? 'bg-lime-600 hover:bg-lime-700 text-white' 
                : 'border-lime-500 text-lime-400 hover:bg-lime-500/10'
            }`}
          >
            {isFollowingState ? (
              <>
                <UserCheck className="h-4 w-4" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Follow</span>
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Stats Display */}
      {showStats && (
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex flex-col items-center">
            <span className="font-bold text-lime-400">{followStats.followersCount.toLocaleString()}</span>
            <span className="text-gray-400">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-cyan-400">{followStats.followingCount.toLocaleString()}</span>
            <span className="text-gray-400">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-purple-400">{followStats.mutualCount.toLocaleString()}</span>
            <span className="text-gray-400">Mutual</span>
          </div>
        </div>
      )}
      
      {/* Follow Actions */}
      {currentUserRole !== 'user' && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFollowRequests(true)}
            className="border-neutral-700 text-gray-400 hover:text-lime-400 hover:border-lime-400"
          >
            <Bell className="h-4 w-4 mr-1" />
            Requests ({mockFollowRequests.length})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-400"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Insights
          </Button>
        </div>
      )}
      
      {/* Followers Dialog */}
      {showFollowersList && (
        <Dialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-lime-400"
            >
              <Users className="h-4 w-4 mr-1" />
              View All Followers ({followStats.followersCount})
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-lime-400" />
                Followers ({followStats.followersCount})
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search followers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-neutral-900 border-neutral-700"
                  />
                </div>
                <Select value={followFilter} onValueChange={(value: any) => setFollowFilter(value)}>
                  <SelectTrigger className="w-32 bg-neutral-900 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="mutual">Mutual</SelectItem>
                    <SelectItem value="ai">AI Artists</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Followers List */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredFollowers.map(follower => (
                  <div key={follower.id} className="flex items-center justify-between p-3 bg-neutral-900/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={follower.userAvatar} />
                        <AvatarFallback>{follower.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-300">{follower.userName}</p>
                          {follower.isMutual && (
                            <Badge variant="secondary" className="bg-cyan-600/20 text-cyan-400">
                              Mutual
                            </Badge>
                          )}
                          {follower.isAI && (
                            <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Followed {new Date(follower.followedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-400"
                    >
                      {follower.isMutual ? <MessageCircle className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
                
                {filteredFollowers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No followers found</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Following Dialog */}
      {showFollowingList && (
        <Dialog open={showFollowingDialog} onOpenChange={setShowFollowingDialog}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-cyan-400"
            >
              <UserCheck className="h-4 w-4 mr-1" />
              View Following ({followStats.followingCount})
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-cyan-400" />
                Following ({followStats.followingCount})
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Input
                  placeholder="Search following..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-neutral-900 border-neutral-700"
                />
              </div>
              
              {/* Following List */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredFollowing.map(following => (
                  <div key={following.id} className="flex items-center justify-between p-3 bg-neutral-900/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={following.userAvatar} />
                        <AvatarFallback>{following.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-300">{following.userName}</p>
                          {following.isVerified && (
                            <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {following.isAI && (
                            <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                              AI Artist
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{following.followerCount.toLocaleString()} followers</span>
                          <span>Followed {new Date(following.followedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-400"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {filteredFollowing.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You're not following anyone yet</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Follow Requests Dialog */}
      <Dialog open={showFollowRequests} onOpenChange={setShowFollowRequests}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-400" />
              Follow Requests ({mockFollowRequests.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {mockFollowRequests.length > 0 ? (
              <div className="max-h-80 overflow-y-auto space-y-3">
                {mockFollowRequests.map(request => (
                  <div key={request.id} className="p-3 bg-neutral-900/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.userAvatar} />
                        <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-300">{request.userName}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(request.requestedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{request.message}</p>
                        
                        {/* User Stats */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {Math.floor(Math.random() * 1000).toLocaleString()} followers
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).getFullYear()}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleFollowRequest(request.userId)}
                            className="bg-lime-600 hover:bg-lime-700"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectRequest(request.userId)}
                            className="text-gray-400"
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No follow requests</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowSystem;