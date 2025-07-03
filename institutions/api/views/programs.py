# institutions/views/programs.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from institutions.models import Program, Department
from institutions.serializers import ProgramSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ProgramCreateViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_enroller and user.assigned_institution:
            return Program.objects.filter(
                department__faculty__institution=user.assigned_institution
            )
        return Program.objects.none()

    def create(self, request, *args, **kwargs):
        if not request.user.is_enroller:
            return Response(
                {"error": "Only enrollers can create programs"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        if not data.get('department'):
            return Response(
                {"error": "Department is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            department = Department.objects.get(
                id=data['department'],
                faculty__institution=request.user.assigned_institution
            )
        except Department.DoesNotExist:
            return Response(
                {"error": "Invalid department for your institution"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(department=department)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)