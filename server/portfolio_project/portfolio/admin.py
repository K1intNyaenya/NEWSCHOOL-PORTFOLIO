from django.contrib import admin
from .models import NewSchoolMember

# Customizing the Django Admin for NewSchoolMember to filter by tenant
class NewSchoolMemberAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Show all data for superusers, filter by tenant for other users
        if request.user.is_superuser:
            return qs
        return qs.filter(tenant=request.tenant)  # Filter data by tenant
    
    # You can also add fields, filters, and other configurations here
    list_display = ('first_name', 'family_name', 'username', 'role', 'tenant')
    search_fields = ('username', 'member_email')

# Register NewSchoolMember with the custom admin class
admin.site.register(NewSchoolMember, NewSchoolMemberAdmin)
