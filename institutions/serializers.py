# serializers.py
from rest_framework import serializers
from .models import Institution, Faculty, Department, Program
from rest_framework.permissions import IsAuthenticated

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'
        
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