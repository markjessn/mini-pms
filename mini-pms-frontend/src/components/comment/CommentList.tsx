import type { TaskComment } from '../../types';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: TaskComment[];
  onDelete?: (id: string) => void;
}

export function CommentList({ comments, onDelete }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onDelete={onDelete} />
      ))}
    </div>
  );
}
