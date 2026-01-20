import graphene
from graphene_django import DjangoObjectType
from .models import Organization, Project, Task, TaskComment


class OrganizationType(DjangoObjectType):
    project_count = graphene.Int()

    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'contact_email', 'created_at', 'updated_at']

    def resolve_project_count(self, info):
        return self.projects.count()


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ['id', 'content', 'author_email', 'created_at', 'updated_at', 'task']


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'assignee_email', 'due_date', 'created_at', 'updated_at', 'project', 'comments']


class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_tasks = graphene.Int()
    completion_rate = graphene.Float()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 'due_date', 'created_at', 'updated_at', 'organization', 'tasks']

    def resolve_task_count(self, info):
        return self.task_count

    def resolve_completed_tasks(self, info):
        return self.completed_tasks

    def resolve_completion_rate(self, info):
        return self.completion_rate


# Input Types
class OrganizationInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    slug = graphene.String(required=True)
    contact_email = graphene.String(required=True)


class ProjectInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    description = graphene.String()
    status = graphene.String()
    due_date = graphene.Date()
    organization_id = graphene.ID(required=True)


class TaskInput(graphene.InputObjectType):
    title = graphene.String(required=True)
    description = graphene.String()
    status = graphene.String()
    assignee_email = graphene.String()
    due_date = graphene.DateTime()
    project_id = graphene.ID(required=True)


class TaskCommentInput(graphene.InputObjectType):
    content = graphene.String(required=True)
    author_email = graphene.String(required=True)
    task_id = graphene.ID(required=True)


# Statistics Type
class ProjectStatisticsType(graphene.ObjectType):
    total_projects = graphene.Int()
    active_projects = graphene.Int()
    completed_projects = graphene.Int()
    on_hold_projects = graphene.Int()
    total_tasks = graphene.Int()
    completed_tasks = graphene.Int()
    overall_completion_rate = graphene.Float()
