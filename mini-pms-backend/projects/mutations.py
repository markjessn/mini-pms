import graphene
from django.db import IntegrityError, transaction
from django.contrib.auth import authenticate
from .models import Organization, Project, Task, TaskComment, User
from .types import OrganizationType, ProjectType, TaskType, TaskCommentType, UserType
from .types import OrganizationInput, ProjectInput, TaskInput, TaskCommentInput
from .types import RegisterInput, LoginInput, CreateMemberInput
from .validators import (
    validate_organization_input,
    validate_project_input,
    validate_task_input,
    validate_comment_input,
)


class CreateOrganization(graphene.Mutation):
    class Arguments:
        input = OrganizationInput(required=True)

    organization = graphene.Field(OrganizationType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, input):
        validation = validate_organization_input(input)
        if validation.has_errors():
            return CreateOrganization(organization=None, success=False, errors=validation.get_errors())

        try:
            org = Organization.objects.create(
                name=input.name.strip(),
                slug=input.slug.lower().strip(),
                contact_email=input.contact_email.lower().strip()
            )
            return CreateOrganization(organization=org, success=True, errors=[])
        except IntegrityError:
            return CreateOrganization(organization=None, success=False, errors=['An organization with this slug already exists.'])
        except Exception as e:
            return CreateOrganization(organization=None, success=False, errors=[str(e)])


class UpdateOrganization(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = OrganizationInput(required=True)

    organization = graphene.Field(OrganizationType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, input):
        validation = validate_organization_input(input)
        if validation.has_errors():
            return UpdateOrganization(organization=None, success=False, errors=validation.get_errors())

        try:
            org = Organization.objects.get(pk=id)
            org.name = input.name.strip()
            org.slug = input.slug.lower().strip()
            org.contact_email = input.contact_email.lower().strip()
            org.save()
            return UpdateOrganization(organization=org, success=True, errors=[])
        except Organization.DoesNotExist:
            return UpdateOrganization(organization=None, success=False, errors=['Organization not found.'])
        except IntegrityError:
            return UpdateOrganization(organization=None, success=False, errors=['An organization with this slug already exists.'])
        except Exception as e:
            return UpdateOrganization(organization=None, success=False, errors=[str(e)])


class CreateProject(graphene.Mutation):
    class Arguments:
        input = ProjectInput(required=True)

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, input):
        validation = validate_project_input(input)
        if validation.has_errors():
            return CreateProject(project=None, success=False, errors=validation.get_errors())

        try:
            org = Organization.objects.get(pk=input.organization_id)
            project = Project.objects.create(
                organization=org,
                name=input.name.strip(),
                description=(input.description or '').strip(),
                status=input.status or 'ACTIVE',
                due_date=input.due_date
            )
            return CreateProject(project=project, success=True, errors=[])
        except Organization.DoesNotExist:
            return CreateProject(project=None, success=False, errors=['Organization not found.'])
        except Exception as e:
            return CreateProject(project=None, success=False, errors=[str(e)])


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = ProjectInput(required=True)

    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, input):
        validation = validate_project_input(input, is_update=True)
        if validation.has_errors():
            return UpdateProject(project=None, success=False, errors=validation.get_errors())

        try:
            project = Project.objects.get(pk=id)
            project.name = input.name.strip()
            if input.description is not None:
                project.description = input.description.strip()
            if input.status:
                project.status = input.status
            if input.due_date is not None:
                project.due_date = input.due_date
            project.save()
            return UpdateProject(project=project, success=True, errors=[])
        except Project.DoesNotExist:
            return UpdateProject(project=None, success=False, errors=['Project not found.'])
        except Exception as e:
            return UpdateProject(project=None, success=False, errors=[str(e)])


class DeleteProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id):
        try:
            project = Project.objects.get(pk=id)
            project.delete()
            return DeleteProject(success=True, errors=[])
        except Project.DoesNotExist:
            return DeleteProject(success=False, errors=['Project not found.'])
        except Exception as e:
            return DeleteProject(success=False, errors=[str(e)])


class CreateTask(graphene.Mutation):
    class Arguments:
        input = TaskInput(required=True)

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, input):
        validation = validate_task_input(input)
        if validation.has_errors():
            return CreateTask(task=None, success=False, errors=validation.get_errors())

        try:
            project = Project.objects.get(pk=input.project_id)
            task = Task.objects.create(
                project=project,
                title=input.title.strip(),
                description=(input.description or '').strip(),
                status=input.status or 'TODO',
                assignee_email=(input.assignee_email or '').strip().lower(),
                due_date=input.due_date
            )
            return CreateTask(task=task, success=True, errors=[])
        except Project.DoesNotExist:
            return CreateTask(task=None, success=False, errors=['Project not found.'])
        except Exception as e:
            return CreateTask(task=None, success=False, errors=[str(e)])


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = TaskInput(required=True)

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, input):
        validation = validate_task_input(input, is_update=True)
        if validation.has_errors():
            return UpdateTask(task=None, success=False, errors=validation.get_errors())

        try:
            task = Task.objects.get(pk=id)
            task.title = input.title.strip()
            if input.description is not None:
                task.description = input.description.strip()
            if input.status:
                task.status = input.status
            if input.assignee_email is not None:
                task.assignee_email = input.assignee_email.strip().lower()
            if input.due_date is not None:
                task.due_date = input.due_date
            task.save()
            return UpdateTask(task=task, success=True, errors=[])
        except Task.DoesNotExist:
            return UpdateTask(task=None, success=False, errors=['Task not found.'])
        except Exception as e:
            return UpdateTask(task=None, success=False, errors=[str(e)])


class DeleteTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id):
        try:
            task = Task.objects.get(pk=id)
            task.delete()
            return DeleteTask(success=True, errors=[])
        except Task.DoesNotExist:
            return DeleteTask(success=False, errors=['Task not found.'])
        except Exception as e:
            return DeleteTask(success=False, errors=[str(e)])


class AddTaskComment(graphene.Mutation):
    class Arguments:
        input = TaskCommentInput(required=True)

    comment = graphene.Field(TaskCommentType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, input):
        validation = validate_comment_input(input)
        if validation.has_errors():
            return AddTaskComment(comment=None, success=False, errors=validation.get_errors())

        try:
            task = Task.objects.get(pk=input.task_id)
            comment = TaskComment.objects.create(
                task=task,
                content=input.content.strip(),
                author_email=input.author_email.strip().lower()
            )
            return AddTaskComment(comment=comment, success=True, errors=[])
        except Task.DoesNotExist:
            return AddTaskComment(comment=None, success=False, errors=['Task not found.'])
        except Exception as e:
            return AddTaskComment(comment=None, success=False, errors=[str(e)])


class DeleteTaskComment(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id):
        try:
            comment = TaskComment.objects.get(pk=id)
            comment.delete()
            return DeleteTaskComment(success=True, errors=[])
        except TaskComment.DoesNotExist:
            return DeleteTaskComment(success=False, errors=['Comment not found.'])
        except Exception as e:
            return DeleteTaskComment(success=False, errors=[str(e)])


# Authentication Mutations
class Register(graphene.Mutation):
    """Register a new organization with an admin user."""
    class Arguments:
        input = RegisterInput(required=True)

    user = graphene.Field(UserType)
    organization = graphene.Field(OrganizationType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, input):
        errors = []

        # Validate email
        if not input.email or '@' not in input.email:
            errors.append('Valid email is required.')
        elif User.objects.filter(email=input.email.lower()).exists():
            errors.append('Email already registered.')

        # Validate password
        if not input.password or len(input.password) < 6:
            errors.append('Password must be at least 6 characters.')

        # Validate name
        if not input.name or len(input.name.strip()) < 2:
            errors.append('Name must be at least 2 characters.')

        # Validate organization name
        if not input.organization_name or len(input.organization_name.strip()) < 2:
            errors.append('Organization name must be at least 2 characters.')

        # Validate organization slug
        if not input.organization_slug:
            errors.append('Organization slug is required.')
        elif Organization.objects.filter(slug=input.organization_slug.lower()).exists():
            errors.append('Organization slug already taken.')

        if errors:
            return Register(user=None, organization=None, success=False, errors=errors)

        try:
            with transaction.atomic():
                # Create organization
                org = Organization.objects.create(
                    name=input.organization_name.strip(),
                    slug=input.organization_slug.lower().strip(),
                    contact_email=input.email.lower().strip()
                )

                # Create admin user
                user = User.objects.create_user(
                    email=input.email.lower().strip(),
                    password=input.password,
                    name=input.name.strip(),
                    organization=org,
                    role='ORG_ADMIN'
                )

                return Register(user=user, organization=org, success=True, errors=[])
        except Exception as e:
            return Register(user=None, organization=None, success=False, errors=[str(e)])


class Login(graphene.Mutation):
    """Login with email and password."""
    class Arguments:
        input = LoginInput(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, input):
        if not input.email or not input.password:
            return Login(user=None, success=False, errors=['Email and password required.'])

        user = authenticate(email=input.email.lower(), password=input.password)

        if user is None:
            return Login(user=None, success=False, errors=['Invalid credentials.'])

        if not user.is_active:
            return Login(user=None, success=False, errors=['Account is disabled.'])

        return Login(user=user, success=True, errors=[])


class CreateOrgMember(graphene.Mutation):
    """Create a new organization member (admin only)."""
    class Arguments:
        input = CreateMemberInput(required=True)
        organization_id = graphene.ID(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, input, organization_id):
        errors = []

        # Validate email
        if not input.email or '@' not in input.email:
            errors.append('Valid email is required.')
        elif User.objects.filter(email=input.email.lower()).exists():
            errors.append('Email already registered.')

        # Validate password
        if not input.password or len(input.password) < 6:
            errors.append('Password must be at least 6 characters.')

        # Validate name
        if not input.name or len(input.name.strip()) < 2:
            errors.append('Name must be at least 2 characters.')

        if errors:
            return CreateOrgMember(user=None, success=False, errors=errors)

        try:
            org = Organization.objects.get(pk=organization_id)

            user = User.objects.create_user(
                email=input.email.lower().strip(),
                password=input.password,
                name=input.name.strip(),
                organization=org,
                role='ORG_MEMBER'
            )

            return CreateOrgMember(user=user, success=True, errors=[])
        except Organization.DoesNotExist:
            return CreateOrgMember(user=None, success=False, errors=['Organization not found.'])
        except Exception as e:
            return CreateOrgMember(user=None, success=False, errors=[str(e)])


class DeleteOrgMember(graphene.Mutation):
    """Delete an organization member (admin only)."""
    class Arguments:
        user_id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, user_id):
        try:
            user = User.objects.get(pk=user_id)
            if user.role == 'ORG_ADMIN':
                return DeleteOrgMember(success=False, errors=['Cannot delete org admin.'])
            user.delete()
            return DeleteOrgMember(success=True, errors=[])
        except User.DoesNotExist:
            return DeleteOrgMember(success=False, errors=['User not found.'])
        except Exception as e:
            return DeleteOrgMember(success=False, errors=[str(e)])


class Mutation(graphene.ObjectType):
    # Authentication mutations
    register = Register.Field()
    login = Login.Field()
    create_org_member = CreateOrgMember.Field()
    delete_org_member = DeleteOrgMember.Field()

    # Organization mutations
    create_organization = CreateOrganization.Field()
    update_organization = UpdateOrganization.Field()

    # Project mutations
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    delete_project = DeleteProject.Field()

    # Task mutations
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()

    # Comment mutations
    add_task_comment = AddTaskComment.Field()
    delete_task_comment = DeleteTaskComment.Field()
