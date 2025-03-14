from django.db import models
from users.models import User

class Document(models.Model):
    DOCUMENT_TYPES = [
        ('Transcript', 'Transcript'),
        ('ID', 'ID'),
        ('Recommendation Letter', 'Recommendation Letter'),
        ('others', 'Others'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=100, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='media/documents/')
    is_verified = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.document_type}"