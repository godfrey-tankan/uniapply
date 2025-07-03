# institutions app views.py
from rest_framework import viewsets, permissions
from .models import Institution, Faculty, Department, Program
from .serializers import (
    InstitutionSerializer, 
    FacultySerializer,
    DepartmentSerializer, 
    ProgramSerializer,
    ProgramRequirementsSerializer,
    ProgramSectionSerializer,
    PublicProgramSerializer,
    InstitutionMinimalSerializer,
    ProgramCreateSerializer,
    FacultyCreateSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from applications.models.models import Application
from django.db.models.functions import ExtractMonth, ExtractYear
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import Count, Avg, Q
from datetime import datetime, timedelta
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
import random
from rest_framework import viewsets, status

User = get_user_model()

class InstitutionsViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionMinimalSerializer
    permission_classes = [AllowAny]  # This should make it public
    authentication_classes = []
    
    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            return [AllowAny()]
        return super().get_permissions()

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FacultyCreateSerializer
        return FacultySerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def public_programs(request):
    programs = Program.objects.all().select_related('department__faculty__institution')
    serializer = ProgramSectionSerializer(programs, many=True)
    return Response(serializer.data)

class ProgramSectionViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all().select_related('department__faculty__institution')
    serializer_class = ProgramSectionSerializer
    permission_classes = [AllowAny]  # This should make it public
    authentication_classes = []
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'department__name': ['icontains'],
        'department__faculty__institution__name': ['icontains'],
        'name': ['icontains'],
    }
    def list(self, request, *args, **kwargs):
        print("DEBUG: Entering list endpoint")  # Add debug print
        print(f"DEBUG: User: {request.user}, Authenticated: {request.user.is_authenticated}")
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = [
            {'id': 'engineering', 'name': 'Engineering'},
            {'id': 'business', 'name': 'Business'},
            {'id': 'medicine', 'name': 'Medicine'},
            {'id': 'science', 'name': 'Science'},
        ]
        return Response(categories)

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    @action(detail=True, methods=['get'])
    def requirements(self, request, pk=None):
        program = self.get_object()
        serializer = ProgramRequirementsSerializer(program)
        return Response(serializer.data)
    @action(detail=True, methods=['get'], url_path='recommendations')
    def recommendations(self, request, pk=None):
        student_points = int(request.query_params.get('points', 0))
        department_id = request.query_params.get('department_id')
        
        try:
            current_program = self.get_object()  # Now using get_object()
            recommendations = self.calculate_recommendations(
                student_points, 
                current_program,
                department_id
            )
            return Response(recommendations)
        except Program.DoesNotExist:
            return Response({"error": "Program not found"}, status=404)
        
    def calculate_recommendations(self, student_points, current_program, department_id=None):
        # Get all applications for the current program
        current_program_apps = Application.objects.filter(
            program=current_program
        ).exclude(student__a_level_points__isnull=True)
        
        # Calculate acceptance probability for current program
        current_stats = self.calculate_program_stats(current_program, student_points, current_program_apps)
        
        # Find alternative programs
        if department_id:
            department = Department.objects.get(id=department_id)
            alternative_programs = Program.objects.filter(
                department__faculty=department.faculty
            ).exclude(id=current_program.id)
        else:
            alternative_programs = Program.objects.filter(
                department__faculty=current_program.department.faculty
            ).exclude(id=current_program.id)
        
        # Calculate stats for alternative programs
        alternatives = []
        for program in alternative_programs:
            program_apps = Application.objects.filter(
                program=program
            ).exclude(student__a_level_points__isnull=True)
            
            stats = self.calculate_program_stats(program, student_points, program_apps)
            alternatives.append(stats)
        
        # Sort alternatives by acceptance probability (highest first)
        alternatives.sort(key=lambda x: x['acceptance_probability'], reverse=True)
        
        return {
            'current_program': current_stats,
            'alternatives': alternatives[:5]  # Return top 5 alternatives
        }

    def calculate_program_stats(self, program, student_points, applications):
        # Calculate basic statistics
        total_applicants = applications.count()
        higher_points = applications.filter(student__a_level_points__gt=student_points).count()
        same_points = applications.filter(student__a_level_points=student_points).count()
        lower_points = applications.filter(student__a_level_points__lt=student_points).count()
        
        # Calculate acceptance probability
        if total_applicants == 0:
            acceptance_prob = 0.7 if student_points >= program.min_points_required else 0.3
        else:
            if student_points > program.min_points_required:
                acceptance_prob = 0.8 - (0.3 * (higher_points / total_applicants))
            elif student_points == program.min_points_required:
                acceptance_prob = 0.5
            else:
                acceptance_prob = 0.3 * (1 - (higher_points / total_applicants))
            
            # Ensure probability stays within bounds
            acceptance_prob = max(0.1, min(0.9, acceptance_prob))
        
        return {
            'program_id': program.id,
            'program_name': program.name,
            'program_code': program.code,
            'institution': program.department.faculty.institution.name,
            'min_points_required': program.min_points_required,
            'student_points': student_points,
            'total_applicants': total_applicants,
            'applicants_with_higher_points': higher_points,
            'applicants_with_same_points': same_points,
            'applicants_with_lower_points': lower_points,
            'acceptance_probability': round(acceptance_prob, 2),
            'required_subjects': program.requirements
        }

class InstitutionProgramsView(APIView):
    def get(self, request, institution_id):
        programs = Program.objects.select_related(
            'department__faculty__institution'
        ).filter(department__faculty__institution_id=institution_id)
        serializer = ProgramSerializer(programs, many=True)
        return Response(serializer.data)
    
class InstitutionNameProgramsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, institution_name):
        programs = Program.objects.select_related(
            'department__faculty__institution'
        ).filter(department__faculty__institution__name__icontains=institution_name)
        serializer = PublicProgramSerializer(programs, many=True)
        return Response(serializer.data)


class ProgramDetailsViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    
    def get_serializer_class(self):
        # Use public serializer for unauthenticated requests
        if not self.request.user.is_authenticated:
            return PublicProgramSerializer
        return ProgramSerializer

    def get_permissions(self):
        # Only require authentication for stats and other sensitive actions
        if self.action in ['stats']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        program = self.get_object()
        
        applications = program.applications.all()
        total_applications = applications.count()
        accepted = applications.filter(status='Approved').count()
        
        stats = {
            'acceptance_rate': round((accepted / total_applications) * 100, 2) if total_applications > 0 else 0,
            'average_points': applications.aggregate(Avg('student__a_level_points'))['student__a_level_points__avg'],
            'current_applications': applications.filter(status='Pending').count(),
            'application_trends': self.get_application_trends(program),
            'demographics': self.get_demographics(program)
        }
        
        return Response(stats)

    def get_application_trends(self, program):
        current_year = datetime.now().year
        trends = (
            program.applications
            .filter(date_applied__year=current_year)
            .annotate(month=ExtractMonth('date_applied'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        month_names = {
            1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr',
            5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug',
            9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
        }

        return [{
            'month': month_names.get(item['month'], 'Unknown'),
            'count': item['count']
        } for item in trends]

    def get_demographics(self, program):
        gender_distribution = (
            program.applications
            .values('student__gender')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        region_distribution = (
            program.applications
            .values('student__province')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return {
            'gender': {item['student__gender']: item['count'] for item in gender_distribution},
            'regions': {item['student__province']: item['count'] for item in region_distribution}
        }



