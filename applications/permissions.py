from rest_framework import permissions

class IsStudentOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow:
    - Students to view/edit their own applications
    - Admins to view/edit all applications
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any safe request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions require ownership or admin status
        return obj.student == request.user or request.user.is_staff

class IsAdminForStatusChange(permissions.BasePermission):
    """
    Only allow admins to change application status
    """
    def has_permission(self, request, view):
        if view.action in ['approve', 'reject', 'defer', 'waitlist', 'withdraw']:
            return request.user.is_staff
        return True

    def has_object_permission(self, request, view, obj):
        if view.action in ['approve', 'reject', 'defer', 'waitlist', 'withdraw']:
            return request.user.is_staff
        return True