from users.models.models import User, EducationHistory, UserDocument
from rest_framework import serializers

class MinimalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email')