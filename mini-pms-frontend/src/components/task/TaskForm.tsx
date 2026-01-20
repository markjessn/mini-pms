import { useState, useEffect } from 'react';
import { Task, TaskInput, TaskStatus } from '../../types';
import { Button, Input, Select } from '../ui';
import { validateTaskForm, ValidationErrors } from '../../utils/validation';

interface TaskFormProps {
  task?: Task | null;
  projectId: string;
  onSubmit: (data: TaskInput) => void;
  onCancel: () => void;
  loading?: boolean;
  serverErrors?: string[];
}

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

export function TaskForm({
  task,
  projectId,
  onSubmit,
  onCancel,
  loading = false,
  serverErrors = [],
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'TODO');
  const [assigneeEmail, setAssigneeEmail] = useState(task?.assigneeEmail || '');
  const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 16) || '');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setAssigneeEmail(task.assigneeEmail || '');
      setDueDate(task.dueDate?.slice(0, 16) || '');
    }
  }, [task]);

  const validateField = (field: string, value: string) => {
    const data = {
      title: field === 'title' ? value : title,
      status: field === 'status' ? value : status,
      assigneeEmail: field === 'assigneeEmail' ? value : assigneeEmail,
    };
    const result = validateTaskForm(data);
    setErrors((prev) => ({
      ...prev,
      [field]: result.errors[field] || '',
    }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, field === 'title' ? title : assigneeEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateTaskForm({ title, status, assigneeEmail });
    setErrors(result.errors);
    setTouched({ title: true, assigneeEmail: true, status: true });

    if (!result.isValid) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      assigneeEmail: assigneeEmail.trim() || undefined,
      dueDate: dueDate || undefined,
      projectId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <ul className="list-disc list-inside space-y-1">
            {serverErrors.map((error, index) => (
              <li key={index} className="text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}

      <Input
        label="Task Title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (touched.title) validateField('title', e.target.value);
        }}
        onBlur={() => handleBlur('title')}
        error={touched.title ? errors.title : undefined}
        placeholder="Enter task title"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter task description"
        />
      </div>

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
        options={statusOptions}
      />

      <Input
        label="Assignee Email"
        type="email"
        value={assigneeEmail}
        onChange={(e) => {
          setAssigneeEmail(e.target.value);
          if (touched.assigneeEmail) validateField('assigneeEmail', e.target.value);
        }}
        onBlur={() => handleBlur('assigneeEmail')}
        error={touched.assigneeEmail ? errors.assigneeEmail : undefined}
        placeholder="assignee@example.com"
      />

      <Input
        label="Due Date"
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
