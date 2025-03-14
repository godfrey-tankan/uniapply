from django.db import models
from users.models.models import User

class Recommendation(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    recommended_university = models.CharField(max_length=255)
    recommended_program = models.CharField(max_length=255)
    score = models.FloatField()
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.username} - {self.recommended_university}"