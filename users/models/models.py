# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid
from institutions.models import Institution 

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
    a_level_points = models.IntegerField(null=True, blank=True,default=0)
    o_level_subjects = models.IntegerField(null=True, blank=True,default=0)
    gender = models.CharField(blank=True, null=True, max_length=20, default='Not Specified')
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
    phone_number = models.CharField(blank=True, null=True,max_length=20)
    province = models.CharField(blank=True, null=True,max_length=50)
    country = models.CharField(blank=True, null=True,max_length=50)
    is_student = models.BooleanField(default=False)
    is_university_admin = models.BooleanField(default=False)
    is_enroller = models.BooleanField(default=False)
    assigned_institution = models.ForeignKey(
        Institution,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enrollers'
    ) 

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        permissions = [
            ("can_assign_system_roles", "Can assign system-wide roles"),
            ("can_manage_universities", "Can manage university accounts"),
            ("can_verify_users", "Can verify user accounts"),
            ("can_view_all_applications", "Can view all applications across institutions"),
            ("can_manage_enrollment", "Can manage enrollment processes for assigned institution"),
        ]

    def __str__(self):
        return f'{self.name} - {self.email}'

    def save(self, *args, **kwargs):
        if self.is_system_admin and not self.is_staff:
            self.is_staff = True
        # If a user is an enroller, they should not be a student or university admin
        if self.is_enroller:
            self.is_student = False
            self.is_university_admin = False
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
class EducationHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='education_history')
    institution = models.CharField(max_length=255)
    qualification = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Education Histories'
        ordering = ['-end_date', '-start_date']

    def __str__(self):
        return f"{self.user.name} - {self.qualification} at {self.institution}"

class UserDocument(models.Model):
    DOCUMENT_TYPES = [
        ('CV', 'Curriculum Vitae'),
        ('TRANSCRIPT', 'Academic Transcript'),
        ('CERTIFICATE', 'Certificate'),
        ('PASSPORT', 'Passport'),
        ('ID', 'ID Document'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='user_documents/')
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.name} - {self.file}"

    class Meta:
        ordering = ['-uploaded_at']

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    receive_newsletters = models.BooleanField(default=True)
    dark_mode = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default='en')
    notification_preferences = models.JSONField(default=dict)

    enable_auto_accept = models.BooleanField(default=False)
    auto_accept_min_points = models.IntegerField(default=0)
    auto_accept_programs = models.ManyToManyField(
        'institutions.Program',
        blank=True,
        related_name='auto_accept_settings'
    )
    enable_auto_review = models.BooleanField(default=False)
    auto_review_criteria = models.JSONField(
        default=dict,
        help_text="Criteria for auto-review (e.g., {'o_level_subjects__gte': 5})"
    )
    auto_reject_criteria = models.JSONField(
        default=dict,
        help_text="Criteria for auto-reject (e.g., {'a_level_points__lt': 5})"
    )
    auto_assign_reviewer = models.BooleanField(default=False)
    default_reviewer_id = models.UUIDField(null=True, blank=True)
    advanced_preferences = models.JSONField(
        default=dict,
        help_text="Arbitrary advanced preferences for enrollers"
    )


    def __str__(self):
        return f"Settings for {self.user.name}"
    class Meta:
        verbose_name_plural = 'User Settings'