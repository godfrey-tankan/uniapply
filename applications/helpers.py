from applications.models import ActivityLog
from django.utils import timezone

def _log_activity(self, user, action, description, metadata=None):
    """Helper method to create activity logs"""
    ActivityLog.objects.create(
        user=user,
        action=action,
        description=description,
        metadata=metadata or {}
    )