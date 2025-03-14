from django.db import models
from users.models.models import User

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

    # Fields
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    university_name = models.CharField(max_length=255)
    program_name = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    date_applied = models.DateTimeField(auto_now_add=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.username} - {self.university_name}"
    
