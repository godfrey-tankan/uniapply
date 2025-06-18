# institution models.py
from django.db import models

class Institution(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)  # Optional description of the institution
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)  # Institution logo

    def __str__(self):
        return self.name


class Faculty(models.Model):
    institution = models.ForeignKey(Institution, related_name='faculties', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('institution', 'code') 

    def __str__(self):
        return f"{self.name} ({self.code})"


class Department(models.Model):
    faculty = models.ForeignKey(Faculty, related_name='departments', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)  # Optional description of the department

    def __str__(self):
        return f"{self.name} ({self.faculty.name})"


class Program(models.Model):
    department = models.ForeignKey(Department, related_name='programs', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)  # Unique code for the program
    min_points_required = models.IntegerField()  # Minimum points required for this program
    required_subjects = models.CharField(max_length=255, default="Mathematics,English")  # Required subjects for this program
    total_enrollment = models.IntegerField()  # Total number of students enrolled in this program
    description = models.TextField(blank=True, null=True)  # Optional description of the program
    start_date = models.DateField()  # Program start date
    end_date = models.DateField()  # Program end date
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Program fee (if applicable)

    def __str__(self):
        return f"{self.name} ({self.code})"
    @property
    def requirements(self):
        return self.required_subjects.split(',')
    @property
    def institution_name(self):
        return self.department.faculty.name
