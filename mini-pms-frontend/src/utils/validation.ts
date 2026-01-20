export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export function validateRequired(value: string | undefined | null, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} is required.`;
  }
  return null;
}

export function validateMinLength(value: string | undefined | null, minLength: number, fieldName: string): string | null {
  if (value && value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters.`;
  }
  return null;
}

export function validateMaxLength(value: string | undefined | null, maxLength: number, fieldName: string): string | null {
  if (value && value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters.`;
  }
  return null;
}

export function validateEmail(value: string | undefined | null, fieldName: string = 'Email'): string | null {
  if (!value) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return `${fieldName} format is invalid.`;
  }
  return null;
}

export function validateSlug(value: string | undefined | null, fieldName: string = 'Slug'): string | null {
  if (!value) return null;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(value)) {
    return `${fieldName} must contain only lowercase letters, numbers, and hyphens.`;
  }
  return null;
}

export function validateOrganizationForm(data: {
  name?: string;
  slug?: string;
  contactEmail?: string;
}): ValidationResult {
  const errors: ValidationErrors = {};

  let error = validateRequired(data.name, 'Name');
  if (error) errors.name = error;
  else {
    error = validateMinLength(data.name, 2, 'Name');
    if (error) errors.name = error;
    else {
      error = validateMaxLength(data.name, 100, 'Name');
      if (error) errors.name = error;
    }
  }

  error = validateRequired(data.slug, 'Slug');
  if (error) errors.slug = error;
  else {
    error = validateSlug(data.slug, 'Slug');
    if (error) errors.slug = error;
  }

  error = validateRequired(data.contactEmail, 'Contact email');
  if (error) errors.contactEmail = error;
  else {
    error = validateEmail(data.contactEmail, 'Contact email');
    if (error) errors.contactEmail = error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateProjectForm(data: {
  name?: string;
  status?: string;
}): ValidationResult {
  const errors: ValidationErrors = {};

  let error = validateRequired(data.name, 'Name');
  if (error) errors.name = error;
  else {
    error = validateMinLength(data.name, 2, 'Name');
    if (error) errors.name = error;
    else {
      error = validateMaxLength(data.name, 200, 'Name');
      if (error) errors.name = error;
    }
  }

  if (data.status && !['ACTIVE', 'COMPLETED', 'ON_HOLD'].includes(data.status)) {
    errors.status = 'Invalid status value.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTaskForm(data: {
  title?: string;
  status?: string;
  assigneeEmail?: string;
}): ValidationResult {
  const errors: ValidationErrors = {};

  let error = validateRequired(data.title, 'Title');
  if (error) errors.title = error;
  else {
    error = validateMinLength(data.title, 2, 'Title');
    if (error) errors.title = error;
    else {
      error = validateMaxLength(data.title, 200, 'Title');
      if (error) errors.title = error;
    }
  }

  if (data.status && !['TODO', 'IN_PROGRESS', 'DONE'].includes(data.status)) {
    errors.status = 'Invalid status value.';
  }

  if (data.assigneeEmail) {
    error = validateEmail(data.assigneeEmail, 'Assignee email');
    if (error) errors.assigneeEmail = error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCommentForm(data: {
  content?: string;
  authorEmail?: string;
}): ValidationResult {
  const errors: ValidationErrors = {};

  let error = validateRequired(data.content, 'Content');
  if (error) errors.content = error;

  error = validateRequired(data.authorEmail, 'Author email');
  if (error) errors.authorEmail = error;
  else {
    error = validateEmail(data.authorEmail, 'Author email');
    if (error) errors.authorEmail = error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
