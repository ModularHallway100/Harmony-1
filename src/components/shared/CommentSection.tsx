import React, { useState, useMemo } from 'react';
import { Comment, getCommentsByContentId } from '@/lib/mock-data';
import { useLibraryStore } from '@/store/library-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Trash2 } from 'lucide-react';
interface CommentSectionProps {
  contentId: string;
}
const CommentSection: React.FC<CommentSectionProps> = ({ contentId }) => {
  const mockComments = getCommentsByContentId(contentId);
  const userComments = useLibraryStore((state) => state.commentsByContentId[contentId] || []);
  const addComment = useLibraryStore((state) => state.addComment);
  const deleteComment = useLibraryStore((state) => state.deleteComment);
  const [newComment, setNewComment] = useState('');
  const allComments = useMemo(() => {
    const combined = [...mockComments, ...userComments];
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [mockComments, userComments]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newCommentObject: Comment = {
      id: `comment-${crypto.randomUUID()}`,
      contentId: contentId,
      userId: 'user-current',
      userName: 'You',
      userAvatar: 'https://i.pravatar.cc/150?u=currentuser',
      text: newComment,
      timestamp: new Date().toISOString(),
    };
    addComment(newCommentObject);
    setNewComment('');
  };
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-mono font-bold mb-6 text-glow-lime flex items-center gap-3">
        <MessageSquare /> Comments
      </h2>
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/150?u=currentuser" />
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-neutral-900 border-neutral-700 focus:ring-lime-500"
            />
            <Button type="submit" className="mt-2 bg-lime-600 hover:bg-lime-700 text-white font-bold">
              Post Comment
            </Button>
          </div>
        </form>
        <div className="space-y-4">
          {allComments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-4 p-4 bg-neutral-900/50 rounded-lg group">
              <Avatar>
                <AvatarImage src={comment.userAvatar} />
                <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <p className="font-bold text-lime-400">{comment.userName}</p>
                  <p className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
                </div>
                <p className="text-gray-300 mt-1">{comment.text}</p>
              </div>
              {comment.userId === 'user-current' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteComment(contentId, comment.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CommentSection;