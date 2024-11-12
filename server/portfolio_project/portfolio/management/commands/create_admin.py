from django.core.management.base import BaseCommand
from portfolio.models import NewSchoolMember, Tenant

class Command(BaseCommand):
    help = "Creates a new admin user for a specific tenant."

    def add_arguments(self, parser):
        parser.add_argument("username", type=str, help="The admin's username")
        parser.add_argument("member_email", type=str, help="The admin's email")
        parser.add_argument("password", type=str, help="The admin's password")
        parser.add_argument("tenant_id", type=str, help="The tenant ID for the admin")

    def handle(self, *args, **options):
        username = options["username"]
        member_email = options["member_email"]
        password = options["password"]
        tenant_id = options["tenant_id"]

        # Retrieve the tenant instance
        try:
            tenant = Tenant.objects.get(tenant_id=tenant_id)
        except Tenant.DoesNotExist:
            self.stderr.write(self.style.ERROR(f"Tenant with ID {tenant_id} does not exist."))
            return

        # Create the admin user
        if NewSchoolMember.objects.filter(username=username).exists():
            self.stderr.write(self.style.ERROR(f"Admin with username {username} already exists."))
        else:
            user = NewSchoolMember.objects.create_user(
                username=username,
                member_email=member_email,
                password=password,
                is_staff=True,
                is_superuser=True,
                tenant=tenant,
            )
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Admin user '{username}' created successfully."))
