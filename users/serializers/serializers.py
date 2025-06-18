from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from users.models.models import EducationHistory, UserDocument, UserSettings
from institutions.models import Program
import os
from django.utils import timezone
from institutions.serializers import MinimalProgramSerializer
User = get_user_model()

# 🔹 User Serializer (For fetching user data)
class UserSerializer(serializers.ModelSerializer):
    education_history = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'is_student', 'is_university_admin', 'is_system_admin',
            'a_level_points', 'o_level_subjects', 'gender', 'phone_number', 'province',
            'country', 'education_history', 'documents','is_enroller', 'assigned_institution',
        ]

    def get_education_history(self, obj):
        return EducationHistorySerializer(obj.education_history.all(), many=True).data

    def get_documents(self, obj):
        return UserDocumentSerializer(obj.user_documents.all(), many=True).data

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        exclude = ['user'] 



class UserSettingsSerializer(serializers.ModelSerializer):
    auto_accept_programs = MinimalProgramSerializer(many=True, read_only=True)
    auto_accept_programs_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Program.objects.all(), source='auto_accept_programs', write_only=True
    ) 

    class Meta:
        model = UserSettings
        exclude = ['user']
        extra_kwargs = {
            'notification_preferences': {'required': False},
            'auto_review_criteria': {'required': False},
            'auto_reject_criteria': {'required': False},
            'advanced_preferences': {'required': False},
        }
# Assuming you 
# 🔹 Register Serializer (For user sign-up)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'confirm_password', 'is_student', 'is_university_admin']

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        # 🔹 Check if passwords match
        if password != confirm_password:
            raise serializers.ValidationError({"password": "Passwords do not match"})

        # 🔹 Ensure email is unique (case insensitive)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "This email is already registered"})

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # Remove confirm_password before saving
        
        # 🔹 Create new user with proper roles
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            username=validated_data['email'],  # Since email is the `USERNAME_FIELD`
            password=validated_data['password'],
            is_student=validated_data.get('is_student', False),
            is_university_admin=validated_data.get('is_enroller', False),
        )
        return user

# 🔹 Login Serializer (For user authentication)
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password)  # 🔹 Use correct username field

        if not user:
            raise serializers.ValidationError({"error": "Invalid email or password"})
        
        if not user.is_active:
            raise serializers.ValidationError({"error": "This account is deactivated. Contact support."})
        
        return user


class EducationHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = EducationHistory
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def create(self, validated_data):
        return EducationHistory.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('user', None)
        return super().update(instance, validated_data)

class UserDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDocument
        fields = '__all__'
        read_only_fields = ('user', 'uploaded_at', 'verified_at')

    def validate_file(self, value):
        valid_extensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError("Unsupported file extension")
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        return value

    def validate_document_type(self, value):
        return value.upper()
class UserProfileCompletionSerializer(serializers.ModelSerializer):
    education_history_count = serializers.SerializerMethodField()
    documents_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'education_history_count',
            'documents_count',
            'completion_percentage',
            'a_level_points',
            'o_level_subjects',
            'gender',
            'phone_number',
            'province',
            'country'
        ]

    def get_education_history_count(self, obj):
        return obj.education_history.count()

    def get_documents_count(self, obj):
        return obj.user_documents.count()

    def get_has_personal_statement(self, obj):
        # Assuming you have a field or method to check personal statement
        return hasattr(obj, 'personal_statement') and bool(obj.personal_statement)

    def get_completion_percentage(self, obj):
        total_fields = 5  # Adjust based on your completion criteria
        completed = 0
        
        if obj.education_history.exists():
            completed += 1
        if obj.user_documents.exists():
            completed += 1
        if obj.a_level_points:
            completed += 1
        if obj.o_level_subjects:
            completed += 1
        if obj.gender and obj.gender != 'Not Specified':
            completed += 1
            
        return int((completed / total_fields) * 100)
    
