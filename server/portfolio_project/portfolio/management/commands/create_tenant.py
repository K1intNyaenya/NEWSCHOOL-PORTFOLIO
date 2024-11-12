# management/commands/create_tenant.py
import uuid
from django.core.management.base import BaseCommand
from ...models import Tenant

class Command(BaseCommand):
    help = 'Create a new tenant with a unique tenant ID and domain'

    def add_arguments(self, parser):
        parser.add_argument('tenant_name', type=str, help='The name of the tenant')
        parser.add_argument('--tenant_id', type=str, help='Unique tenant ID', default=str(uuid.uuid4()))
        parser.add_argument('--tenant_domain', type=str, help='The unique domain for the tenant', required=True)

    def handle(self, *args, **kwargs):
        tenant_name = kwargs['tenant_name']
        tenant_id = kwargs['tenant_id']
        tenant_domain = kwargs['tenant_domain']

        # Ensure tenant_id is unique and in UUID format, if preferred
        if Tenant.objects.filter(tenant_id=tenant_id).exists():
            self.stdout.write(self.style.ERROR('Tenant with this ID already exists.'))
        elif Tenant.objects.filter(tenant_domain=tenant_domain).exists():
            self.stdout.write(self.style.ERROR('Tenant with this domain already exists.'))
        else:
            Tenant.objects.create(
                tenant_id=tenant_id,
                tenant_name=tenant_name,
                tenant_domain=tenant_domain
            )
            self.stdout.write(self.style.SUCCESS(f'Tenant {tenant_name} created successfully with ID {tenant_id} and domain {tenant_domain}.'))
