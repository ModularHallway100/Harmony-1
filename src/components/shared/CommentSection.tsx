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
  Send
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

// Extended interfaces for enhanced comment system
interface CommentReaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: string;
}

interface CommentReport {
  id: string;
  commentId: string;
  userId: string;
  reason: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
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
}

interface CommentSectionProps {
  contentId: string;
  contentType?: 'track' | 'playlist' | 'artist';
  allowReplies?: boolean;
  allowReactions?: boolean;
  allowModeration?: boolean;
  maxReplies?: number;
  showStats?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  contentId,
  contentType = 'track',
  allowReplies = true,
  allowReactions = true,
  allowModeration = true,
  maxReplies = 10,
  showStats = true
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
  const [filterBy, setFilterBy] = useState<'all' | 'following' | 'mine'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<CommentReaction[]>([]);
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Available emojis for reactions
  const availableEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🔥', '💯', '🎉'];
  
  // Combine and enhance comments
  const enhancedComments = useMemo(() => {
    const combined = [...mockComments, ...userComments];
    
    return combined.map(comment => ({
      ...comment,
      replies: [],
      reactionCounts: {},
      userReactions: {},
      isLiked: false,
      isDisliked: false,
      isBookmarked: false,
      isReported: false,
      likeCount: Math.floor(Math.random() * 50),
      dislikeCount: Math.floor(Math.random() * 10),
      replyCount: Math.floor(Math.random() * 20),
      isEdited: false,
      isHidden: false,
      isPinned: false,
      moderationStatus: 'approved' as const
    })) as EnhancedComment[];
  }, [mockComments, userComments]);
  
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
  }, [enhancedComments, sortBy, filterBy, searchQuery, user]);
  
  // Handle comment submission
  const handleSubmit = (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const text = parentId ? replyText : newComment;
    
    if (!text.trim()) return;
    
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
        return [...prev, {
          id: `reaction-${crypto.randomUUID()}`,
          userId: user.id,
          userName: user.fullName || '',
          emoji,
          timestamp: new Date().toISOString(),
          commentId
        }];
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
      status: 'pending'
    };
    
    setReports(prev => [...prev, newReport]);
  };
  
  // Handle delete comment
  const handleDeleteComment = (commentId: string) => {
    deleteComment(contentId, commentId);
  };
  
  // Handle reply to comment
  const handleReply = (commentId: string) => {
    setReplyingTo(commentId === replyingTo ? null : commentId);
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
          </div>
        )}
      </div>
      
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
            </SelectContent>
          </Select>
        </div>
        
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
      </div>
      
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
            </div>
            
            <Button
              type="submit"
              disabled={!newComment.trim() || isLoading}
              className="bg-lime-600 hover:bg-lime-700 text-white font-bold"
            >
              {isLoading ? 'Posting...' : 'Post Comment'}
            </Button>
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
                  </div>
                  
                  <p className="text-gray-300 mt-1">{comment.text}</p>
                  
                  {/* Reactions */}
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
                    
                    {user?.id === comment.userId && (
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
                    )}
                    
                    {allowModeration && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-lime-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BookMark className="h-4 w-4 mr-2" />
                            Save
                          </DropdownMenuItem>
                          {user?.id === comment.userId && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
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
              
              {/* Nested Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-8 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3 p-3 bg-neutral-900/30 rounded-lg">
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
                        </div>
                        <p className="text-gray-300 text-sm mt-1">{reply.text}</p>
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