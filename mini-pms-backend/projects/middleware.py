from .models import Organization


class OrganizationMiddleware:
    """Middleware to extract organization context from request."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        org_slug = request.headers.get('X-Organization-Slug')
        request.organization = None

        if org_slug:
            try:
                request.organization = Organization.objects.get(slug=org_slug)
            except Organization.DoesNotExist:
                pass

        return self.get_response(request)


def get_organization_from_info(info):
    """Extract organization from GraphQL resolver info."""
    request = info.context
    return getattr(request, 'organization', None)


class OrganizationRequiredMixin:
    """Mixin to enforce organization context in resolvers."""

    @classmethod
    def get_queryset(cls, queryset, info):
        organization = get_organization_from_info(info)
        if organization and hasattr(queryset.model, 'organization'):
            return queryset.filter(organization=organization)
        return queryset
