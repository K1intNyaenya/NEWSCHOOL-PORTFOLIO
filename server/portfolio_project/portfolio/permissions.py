from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """
    Custom permission to grant access only to admin users.
    """
    def has_permission(self, request, view):
        # Checks if the user is an admin (is_staff or has role set to 'admin')
        return request.user.is_staff or getattr(request.user, 'role', '') == 'admin'


class IsSelfOrAdmin(BasePermission):
    """
    Custom permission to allow access to the object only to the user themselves or an admin.
    """
    def has_object_permission(self, request, view, obj):
        # Allows access if the user is the object owner (i.e., the user in question) or is an admin
        return request.user == obj or request.user.is_staff
