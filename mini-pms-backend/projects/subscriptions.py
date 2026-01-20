import graphene
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .types import TaskType, ProjectType, TaskCommentType


class Subscription(graphene.ObjectType):
    task_updated = graphene.Field(TaskType, project_id=graphene.ID(required=True))
    comment_added = graphene.Field(TaskCommentType, task_id=graphene.ID(required=True))
    project_updated = graphene.Field(ProjectType, organization_slug=graphene.String(required=True))


def notify_task_updated(task):
    """Send notification when a task is updated."""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'project_{task.project_id}_tasks',
        {
            'type': 'task.updated',
            'task_id': task.id,
        }
    )


def notify_comment_added(comment):
    """Send notification when a comment is added."""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'task_{comment.task_id}_comments',
        {
            'type': 'comment.added',
            'comment_id': comment.id,
        }
    )


def notify_project_updated(project):
    """Send notification when a project is updated."""
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'org_{project.organization.slug}_projects',
        {
            'type': 'project.updated',
            'project_id': project.id,
        }
    )
