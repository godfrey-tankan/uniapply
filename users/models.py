from django.contrib.auth.models import AbstractUser, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    is_student = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    class Meta:
        permissions = [
            ("can_view_dashboard", "Can view the admin dashboard"),
            ("can_manage_applications", "Can manage university applications"),
            ("can_verify_documents", "Can verify student documents"),
        ]

    def __str__(self):
        return self.username