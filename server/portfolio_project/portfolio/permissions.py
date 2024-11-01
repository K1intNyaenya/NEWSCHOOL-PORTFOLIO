from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUser(BasePermission):
    """
    Custom permission to grant access only to admin users.
    Users must be authenticated and either have is_staff=True or a role set to 'admin'.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated and either staff or has the role 'admin'
        return request.user.is_authenticated and (request.user.is_staff or getattr(request.user, 'role', '') == 'admin')


class IsSelfOrAdmin(BasePermission):
    """
    Custom permission to allow access to the object only to the user themselves or an admin.
    Users must be authenticated and either be the object owner or have admin privileges.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the user is authenticated and is the object owner or has admin access
        return request.user.is_authenticated and (request.user == obj or request.user.is_staff or getattr(request.user, 'role', '') == 'admin')
