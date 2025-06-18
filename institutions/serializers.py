# serializers.py
from rest_framework import serializers
from .models import Institution, Faculty, Department, Program
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import random
from django.contrib.auth import get_user_model
User = get_user_model()

class MinimalDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description']  
        read_only_fields = ['id']
    
class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'

class PublicProgramSerializer(serializers.ModelSerializer):
    department = serializers.SerializerMethodField()
    class Meta:
        model = Program
        fields = ['id', 'name', 'code', 'description', 'min_points_required', 
                'requirements', 'start_date', 'end_date', 'total_enrollment',
                'department']
    def get_department(self, obj):
        department_ob = Department.objects.get(id=obj.department.id)
        return MinimalDepartmentSerializer(department_ob).data



class ProgramSectionSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='department.faculty.institution.name', read_only=True)
    category = serializers.SerializerMethodField()
    is_new = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'code', 'description', 'min_points_required',
            'total_enrollment', 'start_date', 'end_date', 'fee',
            'institution_name', 'category', 'is_new', 'rating', 'image',
            'department'
        ]
        depth = 2  # This will include nested department, faculty, and institution data

    def get_category(self, obj):
        # You might want to add a category field to your Program model
        # or determine it based on department name
        department_name = obj.department.name.lower()
        if 'engineering' in department_name:
            return 'engineering'
        elif 'business' in department_name:
            return 'business'
        elif 'medicine' in department_name:
            return 'medicine'
        else:
            return 'science'

    def get_is_new(self, obj):
        # Consider a program new if it was created in the last 3 months
        return obj.start_date > (timezone.now() - timedelta(days=90)).date()

    def get_rating(self, obj):
        # You might want to implement a rating system
        return round(4.5 + (random.random() * 0.5), 1)  # Random rating for demo

    def get_image(self, obj):
        # You might want to add an image field to your Program model
        # or use institution logo
        return 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
        
class ProgramRequirementsSerializer(serializers.ModelSerializer):
    required_subjects = serializers.SerializerMethodField()
    acceptance_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Program
        fields = [
            'min_points_required',
            'required_subjects',
            'acceptance_rate',
            'total_enrollment'
        ]
    
    def get_required_subjects(self, obj):
        # If you have specific required subjects, add logic here
        # For now returning common STEM subjects as example
        return [obj.required_subjects.split(',')]
    
    def get_acceptance_rate(self, obj):
        # Calculate acceptance rate if you have application data
        # For now returning a placeholder
        return 35  # Modify with your actual calculation


class DepartmentSerializer(serializers.ModelSerializer):
    programs = ProgramSerializer(many=True, read_only=True)  # Nested serializer for programs

    class Meta:
        model = Department
        fields = '__all__'



class FacultySerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(many=True, read_only=True)  # Nested serializer for departments

    class Meta:
        model = Faculty
        fields = '__all__'


class InstitutionSerializer(serializers.ModelSerializer):
    permission_classes = [IsAuthenticated]
    faculties = FacultySerializer(many=True, read_only=True)  # Nested serializer for faculties

    class Meta:
        model = Institution
        fields = '__all__'

class MinimalProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name','code']

class InstitutionMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name',  'location']
        read_only_fields = ['id', 'name', 'location']
# serializers.py
class ProgramSerializerDetails(serializers.ModelSerializer):
    requirements = serializers.SerializerMethodField()
    department = DepartmentSerializer(read_only=True)
    
    class Meta:
        model = Program
        fields = [
            'id', 'name', 'code', 'department',
            'min_points_required', 'requirements',
            'total_enrollment', 'description',
            'start_date', 'end_date', 'fee',
            'application_deadline', 'decision_deadline'
        ]

    def get_requirements(self, obj):
        return obj.required_subjects.split(',')