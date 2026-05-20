from django.utils.deprecation import MiddlewareMixin
from django.http import Http404
from .models import Tenant
import logging

logger = logging.getLogger(__name__)

class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # List of paths to exclude from tenant lookup
        excluded_paths = [
            '/portfolio/token', 
            '/portfolio/token/refresh', 
            '/portfolio/health-check'
        ]
        
        # Skip tenant lookup for paths that don't require it
        if any(request.path.startswith(path) for path in excluded_paths):
            logger.debug(f"Skipping tenant lookup for path: {request.path}")
            return

        # Attempt to extract tenant_id from path
        path_segments = request.path.strip('/').split('/')
        if len(path_segments) > 1:  # Ensures that we have a tenant_id segment
            tenant_id = path_segments[1]
            logger.debug(f"Extracted tenant_id from path: {tenant_id}")

            try:
                # Look up tenant based on tenant_id
                request.tenant = Tenant.objects.get(tenant_id=tenant_id)
                logger.debug(f"Tenant found for tenant_id: {tenant_id}")
            except Tenant.DoesNotExist:
                logger.error(f"Tenant not found for tenant_id: {tenant_id}")
                raise Http404("Tenant not found")
        else:
            logger.error("No tenant_id found in path")
            raise Http404("Tenant ID missing in path")
