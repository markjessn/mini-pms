import graphene
from django.db.models import Q
from .models import Organization, Project, Task
from .types import OrganizationType, ProjectType, TaskType, ProjectStatisticsType


class Query(graphene.ObjectType):
    # Organizations
    organizations = graphene.List(OrganizationType)
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))

    # Projects
    projects = graphene.List(
        ProjectType,
        organization_slug=graphene.String(required=True),
        status=graphene.String(),
        search=graphene.String()
    )
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))

    # Tasks
    tasks = graphene.List(
        TaskType,
        project_id=graphene.ID(required=True),
        status=graphene.String(),
        search=graphene.String(),
        assignee_email=graphene.String()
    )
    task = graphene.Field(TaskType, id=graphene.ID(required=True))

    # Statistics
    project_statistics = graphene.Field(
        ProjectStatisticsType,
        organization_slug=graphene.String(required=True)
    )

    def resolve_organizations(self, info):
        return Organization.objects.prefetch_related('projects').all()

    def resolve_organization(self, info, slug):
        try:
            return Organization.objects.prefetch_related('projects').get(slug=slug)
        except Organization.DoesNotExist:
            return None

    def resolve_projects(self, info, organization_slug, status=None, search=None):
        try:
            org = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            return []

        queryset = Project.objects.filter(organization=org).select_related('organization').prefetch_related('tasks')

        if status:
            queryset = queryset.filter(status=status)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        return queryset

    def resolve_project(self, info, id):
        try:
            return Project.objects.select_related('organization').prefetch_related('tasks').get(pk=id)
        except Project.DoesNotExist:
            return None

    def resolve_tasks(self, info, project_id, status=None, search=None, assignee_email=None):
        queryset = Task.objects.filter(project_id=project_id).select_related('project').prefetch_related('comments')

        if status:
            queryset = queryset.filter(status=status)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        if assignee_email:
            queryset = queryset.filter(assignee_email__icontains=assignee_email)

        return queryset

    def resolve_task(self, info, id):
        try:
            return Task.objects.select_related('project').prefetch_related('comments').get(pk=id)
        except Task.DoesNotExist:
            return None

    def resolve_project_statistics(self, info, organization_slug):
        try:
            org = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist:
            return None

        projects = Project.objects.filter(organization=org)
        tasks = Task.objects.filter(project__organization=org)

        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='DONE').count()

        return ProjectStatisticsType(
            total_projects=projects.count(),
            active_projects=projects.filter(status='ACTIVE').count(),
            completed_projects=projects.filter(status='COMPLETED').count(),
            on_hold_projects=projects.filter(status='ON_HOLD').count(),
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            overall_completion_rate=round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0
        )
