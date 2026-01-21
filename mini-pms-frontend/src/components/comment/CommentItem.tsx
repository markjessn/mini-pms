import type { TaskComment } from '../../types';
import { Button } from '../ui';

interface CommentItemProps {
  comment: TaskComment;
  onDelete?: (id: string) => void;
}

export function CommentItem({ comment, onDelete }: CommentItemProps) {
  return (
    <div className="flex space-x-3 py-3">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {comment.authorEmail.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {comment.authorEmail}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(comment.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}
