from django.db import models
from django.core.exceptions import ValidationError
from users.models.models import User
from django.contrib.auth import get_user_model
from django.utils import timezone
import os
import uuid
from datetime import datetime
User = get_user_model()

def unique_file_path(instance, filename):
    """Generate unique path for uploaded files with month-year based folders"""
    ext = filename.split('.')[-1]  
    filename = f"{uuid.uuid4()}.{ext}"  
    month_year = datetime.now().strftime("%B%Y")
    return os.path.join('application_documents', month_year, filename) 
class ApplicationDocument(models.Model):
    application = models.ForeignKey(
        'Application',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    file = models.FileField(upload_to=unique_file_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.application.student.username} - {os.path.basename(self.file.name)}"

class Application(models.Model):
    # Application Status Choices
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Deferred', 'Deferred'),
        ('Waitlisted', 'Waitlisted'),
        ('Withdrawn', 'Withdrawn'),
    ]
    
    # Status Transitions - defines allowed status changes
    STATUS_TRANSITIONS = {
        'Pending': ['Approved', 'Rejected', 'Deferred', 'Waitlisted', 'Withdrawn'],
        'Approved': ['Withdrawn'],
        'Rejected': [],
        'Deferred': ['Approved', 'Rejected', 'Waitlisted'],
        'Waitlisted': ['Approved', 'Rejected', 'Deferred'],
        'Withdrawn': [],
    }

    # Fields
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='applications',
        limit_choices_to={'is_student': True}
    )
    program = models.ForeignKey(
        'institutions.Program',
        on_delete=models.PROTECT,
        related_name='applications'
    )
    status = models.CharField(
        max_length=50, 
        choices=STATUS_CHOICES, 
        default='Pending'
    )
    personal_statement = models.TextField()
    date_applied = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    date_status_changed = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-date_applied']
        unique_together = ['student', 'program']  # Prevent duplicate applications
        verbose_name = 'University Application'
        verbose_name_plural = 'University Applications'

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.program.name} ({self.get_status_display()})"

    def clean(self):
        """Validate the application before saving"""
        # Ensure student is actually a student
        # if not self.student.is_student or :
        #     raise ValidationError("Only students can submit applications")
        
        # Validate status transitions
        if self.pk: 
            original = Application.objects.get(pk=self.pk)
            if original.status != self.status:
                if self.status not in self.STATUS_TRANSITIONS.get(original.status, []):
                    ...
                    # raise ValidationError(
                    #     f"Invalid status transition from {original.status} to {self.status}"
                    # )

    def save(self, *args, **kwargs):
        """Override save to handle status change dates"""
        # Update status change date if status is being modified
        if self.pk:
            original = Application.objects.get(pk=self.pk)
            if original.status != self.status:
                self.date_status_changed = timezone.now()
        
        self.full_clean() 
        super().save(*args, **kwargs)

    # Status Management Methods
    def approve(self, notes=None):
        """Approve this application"""
        self._change_status('Approved', notes)

    def reject(self, notes=None):
        """Reject this application"""
        self._change_status('Rejected', notes)

    def defer(self, notes=None):
        """Defer this application"""
        self._change_status('Deferred', notes)

    def waitlist(self, notes=None):
        """Waitlist this application"""
        self._change_status('Waitlisted', notes)

    def withdraw(self, notes=None):
        """Withdraw this application"""
        self._change_status('Withdrawn', notes)

    def _change_status(self, new_status, notes=None):
        """Internal method to handle status changes"""
        if new_status not in self.STATUS_TRANSITIONS.get(self.status, []):
            raise ValidationError(
                f"Cannot change status from {self.status} to {new_status}"
            )
        
        self.status = new_status
        self.date_status_changed = timezone.now()
        if notes:
            self.admin_notes = notes
        self.save()

    # Property Methods
    @property
    def university_name(self):
        """Backward compatibility property"""
        return self.program.department.faculty.institution.name

    @property
    def program_name(self):
        """Backward compatibility property"""
        return self.program.name

    @property
    def is_active(self):
        """Check if application is still active/under consideration"""
        return self.status in ['Pending', 'Deferred', 'Waitlisted']

    @property
    def is_approved(self):
        """Check if application was approved"""
        return self.status == 'Approved'

    @property
    def is_rejected(self):
        """Check if application was rejected"""
        return self.status == 'Rejected'

    @property
    def status_history(self):
        """Get status change history (would require a separate StatusHistory model)"""
        return self.status_updates.all().order_by('-changed_at')

    # Custom Queryset Methods
    @classmethod
    def get_pending_applications(cls):
        return cls.objects.filter(status='Pending')

    @classmethod
    def get_approved_applications(cls):
        return cls.objects.filter(status='Approved')

    @classmethod
    def get_by_institution(cls, institution_id):
        return cls.objects.filter(institution_id=institution_id)

    @classmethod
    def get_by_program(cls, program_id):
        return cls.objects.filter(program_id=program_id)
    
class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('APPROVED', 'Application Approved'),
        ('REJECTED', 'Application Rejected'),
        ('REVIEWED', 'Application Reviewed'),
        ('CREATED', 'Application Created'),
        ('UPDATED', 'Application Updated'),
        ('MESSAGE', 'Message Sent'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'

    def __str__(self):
        return f"{self.user.email} - {self.get_action_display()} at {self.timestamp}"

class Deadline(models.Model):
    SEMESTER_CHOICES = [
        ('FALL', 'Fall Semester'),
        ('SPRING', 'Spring Semester'),
        ('SUMMER', 'Summer Semester'),
        ('WINTER', 'Winter Semester'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    institution = models.ForeignKey(
        'institutions.Institution',
        on_delete=models.CASCADE,
        related_name='deadlines',
        null=True,
        blank=True
    )
    date = models.DateField()
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']
        verbose_name = 'Deadline'
        verbose_name_plural = 'Deadlines'

    def __str__(self):
        return f"{self.title} - {self.date}"

class Message(models.Model):
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='messages_sent'
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='messages_received'
    )
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_system = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.sender} to {self.recipient} at {self.timestamp}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('MESSAGE', 'Message'),
        ('STATUS_CHANGE', 'Application Status Change'),
        ('PROGRAM_ADDED', 'New Program Added'),
        ('DEADLINE', 'Deadline'),
        ('INTERVIEW', 'Interview Scheduled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def mark_as_read(self):
        self.is_read = True
        self.read_at = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.title} - {self.user}"