# institutions/views/departments.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from institutions.models import Department
from institutions.serializers import DepartmentSerializer
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied

User = get_user_model()

class DepartmentCreateViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_enroller and user.assigned_institution:
            return Department.objects.filter(
                faculty__institution=user.assigned_institution
            )
        return Department.objects.none()

    def perform_create(self, serializer):
        if not self.request.user.is_enroller:
            raise PermissionDenied("Only enrollers can create departments")
        serializer.save()