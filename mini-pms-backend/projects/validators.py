from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import re


class ValidationErrors:
    """Helper class to collect and format validation errors."""

    def __init__(self):
        self.errors = []

    def add(self, message):
        self.errors.append(message)

    def has_errors(self):
        return len(self.errors) > 0

    def get_errors(self):
        return self.errors


def validate_required(value, field_name):
    """Validate that a field is not empty."""
    if value is None or (isinstance(value, str) and not value.strip()):
        return f'{field_name} is required.'
    return None


def validate_min_length(value, min_length, field_name):
    """Validate minimum length for string fields."""
    if value and len(value.strip()) < min_length:
        return f'{field_name} must be at least {min_length} characters.'
    return None


def validate_max_length(value, max_length, field_name):
    """Validate maximum length for string fields."""
    if value and len(value) > max_length:
        return f'{field_name} must be no more than {max_length} characters.'
    return None


def validate_email_format(value, field_name='Email'):
    """Validate email format."""
    if not value:
        return None
    try:
        validate_email(value)
    except ValidationError:
        return f'{field_name} format is invalid.'
    return None


def validate_slug_format(value, field_name='Slug'):
    """Validate slug format (lowercase, alphanumeric, hyphens only)."""
    if not value:
        return None
    if not re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', value):
        return f'{field_name} must contain only lowercase letters, numbers, and hyphens.'
    return None


def validate_status(value, valid_statuses, field_name='Status'):
    """Validate that status is one of the allowed values."""
    if value and value not in valid_statuses:
        return f'{field_name} must be one of: {", ".join(valid_statuses)}.'
    return None


def validate_organization_input(input_data):
    """Validate organization input data."""
    errors = ValidationErrors()

    error = validate_required(input_data.name, 'Name')
    if error:
        errors.add(error)
    else:
        error = validate_min_length(input_data.name, 2, 'Name')
        if error:
            errors.add(error)
        error = validate_max_length(input_data.name, 100, 'Name')
        if error:
            errors.add(error)

    error = validate_required(input_data.slug, 'Slug')
    if error:
        errors.add(error)
    else:
        error = validate_slug_format(input_data.slug, 'Slug')
        if error:
            errors.add(error)

    error = validate_required(input_data.contact_email, 'Contact email')
    if error:
        errors.add(error)
    else:
        error = validate_email_format(input_data.contact_email, 'Contact email')
        if error:
            errors.add(error)

    return errors


def validate_project_input(input_data, is_update=False):
    """Validate project input data."""
    errors = ValidationErrors()

    if not is_update:
        error = validate_required(getattr(input_data, 'organization_id', None), 'Organization')
        if error:
            errors.add(error)

    error = validate_required(input_data.name, 'Name')
    if error:
        errors.add(error)
    else:
        error = validate_min_length(input_data.name, 2, 'Name')
        if error:
            errors.add(error)
        error = validate_max_length(input_data.name, 200, 'Name')
        if error:
            errors.add(error)

    if input_data.status:
        error = validate_status(input_data.status, ['ACTIVE', 'COMPLETED', 'ON_HOLD'], 'Status')
        if error:
            errors.add(error)

    return errors


def validate_task_input(input_data, is_update=False):
    """Validate task input data."""
    errors = ValidationErrors()

    if not is_update:
        error = validate_required(getattr(input_data, 'project_id', None), 'Project')
        if error:
            errors.add(error)

    error = validate_required(input_data.title, 'Title')
    if error:
        errors.add(error)
    else:
        error = validate_min_length(input_data.title, 2, 'Title')
        if error:
            errors.add(error)
        error = validate_max_length(input_data.title, 200, 'Title')
        if error:
            errors.add(error)

    if input_data.status:
        error = validate_status(input_data.status, ['TODO', 'IN_PROGRESS', 'DONE'], 'Status')
        if error:
            errors.add(error)

    if input_data.assignee_email:
        error = validate_email_format(input_data.assignee_email, 'Assignee email')
        if error:
            errors.add(error)

    return errors


def validate_comment_input(input_data):
    """Validate task comment input data."""
    errors = ValidationErrors()

    error = validate_required(input_data.task_id, 'Task')
    if error:
        errors.add(error)

    error = validate_required(input_data.content, 'Content')
    if error:
        errors.add(error)

    error = validate_required(input_data.author_email, 'Author email')
    if error:
        errors.add(error)
    else:
        error = validate_email_format(input_data.author_email, 'Author email')
        if error:
            errors.add(error)

    return errors
