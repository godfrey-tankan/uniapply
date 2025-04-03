from rest_framework import serializers
from applications.models import Application, ApplicationDocument, ActivityLog, Deadline
from institutions.models import Institution, Program, Department
from django.contrib.auth import get_user_model 
User = get_user_model()

class InstitutionBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name', 'location']

class ProgramBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name', 'code', 'description']
class DepartmentBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'faculty']  
        
class UserBasicSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name')
    a_level_points = serializers.IntegerField(read_only=True)
    passed_subjects = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name','a_level_points','passed_subjects']

class ApplicationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationDocument
        fields = ['id', 'file', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class ApplicationSerializer(serializers.ModelSerializer):
    student = UserBasicSerializer(read_only=True)
    documents = ApplicationDocumentSerializer(many=True, read_only=True)
    program = ProgramBasicSerializer(read_only=True)
    institution_id = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(),
        source='program.department.faculty.institution',
        write_only=True
    )
    department = serializers.SerializerMethodField(read_only=True)
    institution = serializers.SerializerMethodField(read_only=True) 
    program_id = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(),
        source='program',
        write_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'student',
            'institution',
            'institution_id',
            'program',
            'program_id',
            'department',
            'status',
            'status_display',
            'personal_statement',
            'documents',
            'date_applied',
            'date_updated',
            'date_status_changed',
            'admin_notes',
            'is_active'
        ]
        read_only_fields = ['student', 'date_applied', 'date_updated', 'date_status_changed']

    def validate(self, data):
        student = self.context['request'].user
        program = data.get('program')

        # Fetch institution from the request data (not just from program relation)
        institution_id = self.context['request'].data.get('institution_id')  # Get institution from request data

        try:
            institution_id = int(institution_id)  # Convert to integer if needed
        except (TypeError, ValueError):
            raise serializers.ValidationError("Invalid institution ID")

        # Check if the student has already applied to this program at the requested institution
        application = Application.objects.filter(
            student=student, 
            program=program, 
        )

        if application.exists() and not self.instance:

            raise serializers.ValidationError(
                "You have already applied for this program at this institution."
            )

        # Ensure student is not changing institution/program after creation
        if self.instance and ('institution_id' in data or 'program' in data):
            raise serializers.ValidationError("Cannot change institution or program after application is submitted")
        
        return data

    def get_department(self, obj):
        """Get department data through the program relationship"""
        department = obj.program.department if hasattr(obj, 'program') and obj.program else None
        return DepartmentBasicSerializer(department).data if department else None
    def get_institution(self, obj):
        """Fetch institution details from program relationship"""
        if obj.program and obj.program.department and obj.program.department.faculty:
            institution = obj.program.department.faculty.institution
            return {"id": institution.id, "name": institution.name} if institution else None
        return None

class ApplicationStatusSerializer(serializers.ModelSerializer):
    admin_notes = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Application
        fields = ['status', 'admin_notes']
        
class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['action', 'description', 'timestamp', 'metadata']
        read_only_fields = fields

class DeadlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deadline
        fields = ['id', 'title', 'description', 'date', 'semester', 'is_active']

