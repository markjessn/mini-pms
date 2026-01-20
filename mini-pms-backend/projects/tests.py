from django.test import TestCase
from django.core.exceptions import ValidationError
from graphene_django.utils.testing import GraphQLTestCase
from .models import Organization, Project, Task, TaskComment
from .schema import schema
import json


class OrganizationModelTests(TestCase):
    """Tests for the Organization model."""

    def test_create_organization(self):
        """Test creating an organization."""
        org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )
        self.assertEqual(org.name, 'Test Organization')
        self.assertEqual(org.slug, 'test-org')
        self.assertEqual(org.contact_email, 'test@example.com')

    def test_organization_str(self):
        """Test organization string representation."""
        org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
            contact_email='test@example.com'
        )
        self.assertEqual(str(org), 'Test Org')

    def test_unique_slug(self):
        """Test that organization slugs must be unique."""
        Organization.objects.create(
            name='First Org',
            slug='unique-slug',
            contact_email='first@example.com'
        )
        with self.assertRaises(Exception):
            Organization.objects.create(
                name='Second Org',
                slug='unique-slug',
                contact_email='second@example.com'
            )


class ProjectModelTests(TestCase):
    """Tests for the Project model."""

    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )

    def test_create_project(self):
        """Test creating a project."""
        project = Project.objects.create(
            organization=self.org,
            name='Test Project',
            description='Test description',
            status='ACTIVE'
        )
        self.assertEqual(project.name, 'Test Project')
        self.assertEqual(project.status, 'ACTIVE')
        self.assertEqual(project.organization, self.org)

    def test_project_str(self):
        """Test project string representation."""
        project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )
        self.assertEqual(str(project), 'Test Project')

    def test_default_status(self):
        """Test that default status is ACTIVE."""
        project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )
        self.assertEqual(project.status, 'ACTIVE')

    def test_task_count_property(self):
        """Test the task_count property."""
        project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )
        self.assertEqual(project.task_count, 0)
        Task.objects.create(project=project, title='Task 1')
        Task.objects.create(project=project, title='Task 2')
        self.assertEqual(project.task_count, 2)

    def test_completion_rate(self):
        """Test the completion_rate property."""
        project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )
        Task.objects.create(project=project, title='Task 1', status='DONE')
        Task.objects.create(project=project, title='Task 2', status='TODO')
        self.assertEqual(project.completion_rate, 50.0)


class TaskModelTests(TestCase):
    """Tests for the Task model."""

    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )

    def test_create_task(self):
        """Test creating a task."""
        task = Task.objects.create(
            project=self.project,
            title='Test Task',
            description='Task description',
            status='TODO'
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.status, 'TODO')

    def test_task_str(self):
        """Test task string representation."""
        task = Task.objects.create(
            project=self.project,
            title='Test Task'
        )
        self.assertEqual(str(task), 'Test Task')

    def test_default_status(self):
        """Test that default status is TODO."""
        task = Task.objects.create(
            project=self.project,
            title='Test Task'
        )
        self.assertEqual(task.status, 'TODO')


class TaskCommentModelTests(TestCase):
    """Tests for the TaskComment model."""

    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )
        self.task = Task.objects.create(
            project=self.project,
            title='Test Task'
        )

    def test_create_comment(self):
        """Test creating a comment."""
        comment = TaskComment.objects.create(
            task=self.task,
            content='Test comment',
            author_email='author@example.com'
        )
        self.assertEqual(comment.content, 'Test comment')
        self.assertEqual(comment.author_email, 'author@example.com')

    def test_comment_str(self):
        """Test comment string representation."""
        comment = TaskComment.objects.create(
            task=self.task,
            content='Test comment',
            author_email='author@example.com'
        )
        self.assertIn('author@example.com', str(comment))


class MultiTenancyTests(TestCase):
    """Tests for multi-tenancy isolation."""

    def setUp(self):
        self.org1 = Organization.objects.create(
            name='Organization 1',
            slug='org-1',
            contact_email='org1@example.com'
        )
        self.org2 = Organization.objects.create(
            name='Organization 2',
            slug='org-2',
            contact_email='org2@example.com'
        )
        self.project1 = Project.objects.create(
            organization=self.org1,
            name='Project 1'
        )
        self.project2 = Project.objects.create(
            organization=self.org2,
            name='Project 2'
        )

    def test_projects_belong_to_organization(self):
        """Test that projects are correctly associated with organizations."""
        org1_projects = Project.objects.filter(organization=self.org1)
        org2_projects = Project.objects.filter(organization=self.org2)

        self.assertEqual(org1_projects.count(), 1)
        self.assertEqual(org2_projects.count(), 1)
        self.assertEqual(org1_projects.first().name, 'Project 1')
        self.assertEqual(org2_projects.first().name, 'Project 2')

    def test_cascade_delete(self):
        """Test that deleting an organization cascades to projects."""
        self.org1.delete()
        self.assertEqual(Project.objects.filter(organization=self.org1).count(), 0)
        self.assertEqual(Project.objects.count(), 1)


class GraphQLQueryTests(GraphQLTestCase):
    """Tests for GraphQL queries."""
    GRAPHQL_SCHEMA = schema

    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project',
            status='ACTIVE'
        )

    def test_organizations_query(self):
        """Test the organizations query."""
        response = self.query('''
            query {
                organizations {
                    id
                    name
                    slug
                }
            }
        ''')
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        self.assertEqual(len(content['data']['organizations']), 1)
        self.assertEqual(content['data']['organizations'][0]['name'], 'Test Organization')

    def test_organization_query(self):
        """Test the organization query by slug."""
        response = self.query('''
            query {
                organization(slug: "test-org") {
                    id
                    name
                    slug
                }
            }
        ''')
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        self.assertEqual(content['data']['organization']['name'], 'Test Organization')

    def test_projects_query(self):
        """Test the projects query."""
        response = self.query('''
            query {
                projects(organizationSlug: "test-org") {
                    id
                    name
                    status
                }
            }
        ''')
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        self.assertEqual(len(content['data']['projects']), 1)
        self.assertEqual(content['data']['projects'][0]['name'], 'Test Project')


class GraphQLMutationTests(GraphQLTestCase):
    """Tests for GraphQL mutations."""
    GRAPHQL_SCHEMA = schema

    def test_create_organization(self):
        """Test the createOrganization mutation."""
        response = self.query('''
            mutation {
                createOrganization(input: {
                    name: "New Organization"
                    slug: "new-org"
                    contactEmail: "new@example.com"
                }) {
                    success
                    errors
                    organization {
                        id
                        name
                    }
                }
            }
        ''')
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        self.assertTrue(content['data']['createOrganization']['success'])
        self.assertEqual(content['data']['createOrganization']['organization']['name'], 'New Organization')

    def test_create_organization_validation_error(self):
        """Test mutation validation for organization."""
        response = self.query('''
            mutation {
                createOrganization(input: {
                    name: ""
                    slug: "invalid"
                    contactEmail: "invalid-email"
                }) {
                    success
                    errors
                }
            }
        ''')
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        self.assertFalse(content['data']['createOrganization']['success'])
        self.assertTrue(len(content['data']['createOrganization']['errors']) > 0)

    def test_create_project(self):
        """Test the createProject mutation."""
        org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
            contact_email='test@example.com'
        )
        response = self.query(f'''
            mutation {{
                createProject(input: {{
                    name: "New Project"
                    organizationId: "{org.id}"
                    status: "ACTIVE"
                }}) {{
                    success
                    errors
                    project {{
                        id
                        name
                    }}
                }}
            }}
        ''')
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        self.assertTrue(content['data']['createProject']['success'])
        self.assertEqual(content['data']['createProject']['project']['name'], 'New Project')

    def test_create_task(self):
        """Test the createTask mutation."""
        org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
            contact_email='test@example.com'
        )
        project = Project.objects.create(
            organization=org,
            name='Test Project'
        )
        response = self.query(f'''
            mutation {{
                createTask(input: {{
                    title: "New Task"
                    projectId: "{project.id}"
                }}) {{
                    success
                    errors
                    task {{
                        id
                        title
                    }}
                }}
            }}
        ''')
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        self.assertTrue(content['data']['createTask']['success'])
        self.assertEqual(content['data']['createTask']['task']['title'], 'New Task')

    def test_delete_project(self):
        """Test the deleteProject mutation."""
        org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
            contact_email='test@example.com'
        )
        project = Project.objects.create(
            organization=org,
            name='Test Project'
        )
        response = self.query(f'''
            mutation {{
                deleteProject(id: "{project.id}") {{
                    success
                    errors
                }}
            }}
        ''')
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        self.assertTrue(content['data']['deleteProject']['success'])
        self.assertEqual(Project.objects.count(), 0)
