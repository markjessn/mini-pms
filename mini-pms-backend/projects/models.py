from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinLengthValidator, EmailValidator
import re


def validate_slug(value):
    """Validate slug format (lowercase, alphanumeric, hyphens only)."""
    if not re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', value):
        raise ValidationError(
            'Slug must contain only lowercase letters, numbers, and hyphens.'
        )


class Organization(models.Model):
    """Multi-tenant organization model."""
    name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(2, 'Name must be at least 2 characters.')]
    )
    slug = models.SlugField(unique=True, validators=[validate_slug])
    contact_email = models.EmailField(validators=[EmailValidator()])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()
        if self.name:
            self.name = self.name.strip()
        if self.slug:
            self.slug = self.slug.lower().strip()


class Project(models.Model):
    """Project model belonging to an organization."""
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ON_HOLD', 'On Hold'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    name = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(2, 'Name must be at least 2 characters.')]
    )
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'name']),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()
        if self.name:
            self.name = self.name.strip()
        if self.status and self.status not in dict(self.STATUS_CHOICES):
            raise ValidationError({'status': 'Invalid status value.'})

    @property
    def task_count(self):
        return self.tasks.count()

    @property
    def completed_tasks(self):
        return self.tasks.filter(status='DONE').count()

    @property
    def completion_rate(self):
        total = self.task_count
        if total == 0:
            return 0
        return round((self.completed_tasks / total) * 100, 1)


class Task(models.Model):
    """Task model belonging to a project."""
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(2, 'Title must be at least 2 characters.')]
    )
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    assignee_email = models.EmailField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'status']),
        ]

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()
        if self.title:
            self.title = self.title.strip()
        if self.status and self.status not in dict(self.STATUS_CHOICES):
            raise ValidationError({'status': 'Invalid status value.'})


class TaskComment(models.Model):
    """Comment on a task."""
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    content = models.TextField(
        validators=[MinLengthValidator(1, 'Comment cannot be empty.')]
    )
    author_email = models.EmailField(validators=[EmailValidator()])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author_email} on {self.task.title}"

    def clean(self):
        super().clean()
        if self.content:
            self.content = self.content.strip()
