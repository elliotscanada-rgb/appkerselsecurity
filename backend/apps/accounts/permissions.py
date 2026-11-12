from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Permission to only allow admin users."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsAdmin(IsAdminUser):
    """Alias for IsAdminUser."""
    pass


class IsClientUser(permissions.BasePermission):
    """Permission to only allow client users."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'client'


class IsClient(IsClientUser):
    """Alias for IsClientUser."""
    pass


class IsStaffUser(permissions.BasePermission):
    """Permission to only allow staff users."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'staff'


class IsStaff(IsStaffUser):
    """Alias for IsStaffUser."""
    pass


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission to only allow owners of an object or admins."""
    
    def has_object_permission(self, request, view, obj):
        # Admin has full access
        if request.user.role == 'admin':
            return True
        
        # Check if obj has user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if obj has client attribute
        if hasattr(obj, 'client'):
            return obj.client.user == request.user
        
        return False
