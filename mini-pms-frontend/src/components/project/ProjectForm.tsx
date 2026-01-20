import { useState, useEffect } from 'react';
import { Project, ProjectInput, ProjectStatus } from '../../types';
import { Button, Input, Select } from '../ui';
import { validateProjectForm, ValidationErrors } from '../../utils/validation';

interface ProjectFormProps {
  project?: Project | null;
  organizationId: string;
  onSubmit: (data: ProjectInput) => void;
  onCancel: () => void;
  loading?: boolean;
  serverErrors?: string[];
}

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function ProjectForm({
  project,
  organizationId,
  onSubmit,
  onCancel,
  loading = false,
  serverErrors = [],
}: ProjectFormProps) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status || 'ACTIVE');
  const [dueDate, setDueDate] = useState(project?.dueDate || '');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setDueDate(project.dueDate || '');
    }
  }, [project]);

  const validateField = (field: string, value: string) => {
    const data = {
      name: field === 'name' ? value : name,
      status: field === 'status' ? value : status,
    };
    const result = validateProjectForm(data);
    setErrors((prev) => ({
      ...prev,
      [field]: result.errors[field] || '',
    }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateProjectForm({ name, status });
    setErrors(result.errors);
    setTouched({ name: true, status: true });

    if (!result.isValid) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
      dueDate: dueDate || undefined,
      organizationId,
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
        label="Project Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (touched.name) validateField('name', e.target.value);
        }}
        onBlur={() => handleBlur('name')}
        error={touched.name ? errors.name : undefined}
        placeholder="Enter project name"
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
          placeholder="Enter project description"
        />
      </div>

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as ProjectStatus)}
        options={statusOptions}
      />

      <Input
        label="Due Date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
