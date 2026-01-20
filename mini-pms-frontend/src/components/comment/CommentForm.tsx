import { useState } from 'react';
import { TaskCommentInput } from '../../types';
import { Button } from '../ui';

interface CommentFormProps {
  taskId: string;
  onSubmit: (data: TaskCommentInput) => void;
  loading?: boolean;
}

export function CommentForm({ taskId, onSubmit, loading = false }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!content.trim()) {
      newErrors.content = 'Comment is required';
    }
    if (!authorEmail.trim()) {
      newErrors.authorEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      newErrors.authorEmail = 'Invalid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      content: content.trim(),
      authorEmail: authorEmail.trim(),
      taskId,
    });

    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="email"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          placeholder="Your email"
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.authorEmail ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.authorEmail && (
          <p className="mt-1 text-xs text-red-600">{errors.authorEmail}</p>
        )}
      </div>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-600">{errors.content}</p>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={loading}>
          Add Comment
        </Button>
      </div>
    </form>
  );
}
