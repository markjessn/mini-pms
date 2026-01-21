import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { ADD_TASK_COMMENT, DELETE_TASK_COMMENT } from '../../graphql/operations';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';
import type { TaskComment } from '../../types';

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  onCommentsChange?: (comments: TaskComment[]) => void;
}

function getInitials(email: string): string {
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function TaskComments({ taskId, comments: initialComments, onCommentsChange }: TaskCommentsProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [localComments, setLocalComments] = useState<TaskComment[]>(initialComments);
  const [addComment, { loading: adding }] = useMutation(ADD_TASK_COMMENT);
  const [deleteComment] = useMutation(DELETE_TASK_COMMENT);

  // Sync local state when props change (e.g., when switching tasks)
  useEffect(() => {
    setLocalComments(initialComments);
  }, [initialComments, taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    try {
      const { data } = await addComment({
        variables: {
          input: {
            taskId,
            content: content.trim(),
            authorEmail: user.email,
          },
        },
      });
      if (data?.addTaskComment?.success && data.addTaskComment.comment) {
        const newComment = data.addTaskComment.comment as TaskComment;
        const updatedComments = [...localComments, newComment];
        setLocalComments(updatedComments);
        setContent('');
        onCommentsChange?.(updatedComments);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const { data } = await deleteComment({ variables: { id: commentId } });
      if (data?.deleteTaskComment?.success) {
        const updatedComments = localComments.filter(c => c.id !== commentId);
        setLocalComments(updatedComments);
        onCommentsChange?.(updatedComments);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Comments ({localComments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
        {localComments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          localComments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                {getInitials(comment.authorEmail)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {comment.authorEmail}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                  {user?.email === comment.authorEmail && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-opacity"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
          {user ? getInitials(user.email) : '?'}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || adding}
            >
              {adding ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
