from django.utils.deprecation import MiddlewareMixin
from .models import Tenant
from django.http import Http404

class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        domain = request.get_host()
        try:
            request.tenant = Tenant.objects.get(tenant_domain=domain)
        except Tenant.DoesNotExist:
            raise Http404("Tenant not found")
