from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

# 🔹 User Serializer (For fetching user data)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'is_student', 'is_university_admin', 'is_system_admin','a_level_points', 'o_level_subjects']

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
            is_university_admin=validated_data.get('is_university_admin', False),
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
