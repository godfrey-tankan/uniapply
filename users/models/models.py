from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid

class User(AbstractUser):
    """
    Core user model focused on authentication and basic user data.
    Additional profile data can be stored in a separate Profile model if needed.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    
    # Account status
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)
    
    # System-wide role
    is_system_admin = models.BooleanField(default=False)
    system_role = models.ForeignKey(
        'Role',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='system_users',
        limit_choices_to={'is_system_role': True}
    )
    
    is_student = models.BooleanField(default=False)
    is_university_admin = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        permissions = [
            ("can_assign_system_roles", "Can assign system-wide roles"),
            ("can_manage_universities", "Can manage university accounts"),
            ("can_verify_users", "Can verify user accounts"),
        ]

    def __str__(self):
        return f'{self.name} - {self.email}'

    def save(self, *args, **kwargs):
        if self.is_system_admin and not self.is_staff:
            self.is_staff = True
        super().save(*args, **kwargs)

    def update_last_active(self):
        """Update the last active timestamp"""
        self.last_active = timezone.now()
        self.save(update_fields=['last_active'])

    def deactivate(self):
        """Deactivate the user account"""
        self.is_active = False
        self.deactivated_at = timezone.now()
        self.save(update_fields=['is_active', 'deactivated_at'])

    def activate(self):
        """Activate the user account"""
        self.is_active = True
        self.deactivated_at = None
        self.save(update_fields=['is_active', 'deactivated_at'])

    def verify(self):
        """Mark user as verified"""
        self.is_verified = True
        self.verified_at = timezone.now()
        self.save(update_fields=['is_verified', 'verified_at'])

    def has_system_permission(self, permission):
        """Check if user has a system-wide permission"""
        if self.is_superuser:
            return True
            
        if self.system_role and self.system_role.has_permission(permission):
            return True
            
        if isinstance(permission, str):
            return self.user_permissions.filter(codename=permission).exists()
        return self.user_permissions.filter(id=permission.id).exists()


class Role(models.Model):
    name = models.CharField(max_length=255, unique=True)
    is_system_role = models.BooleanField(default=False)
    permissions = models.ManyToManyField(
        'auth.Permission',
        blank=True,
        related_name='roles'
    )

    def __str__(self):
        return self.name

    def has_permission(self, permission):
        """Check if the role has a specific permission"""
        if isinstance(permission, str):
            return self.permissions.filter(codename=permission).exists()
        return self.permissions.filter(id=permission.id).exists()