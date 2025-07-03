# views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Q
from django.db.models.functions import ExtractMonth, ExtractYear
from datetime import datetime, timedelta
import psutil
import platform
import os
from django.conf import settings
from applications.models.models import Application, ActivityLog
from institutions.models import Institution
#import get_user model
from django.contrib.auth import get_user_model
User =get_user_model()

class SystemAdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get comprehensive stats for system admin dashboard"""
        if not request.user.is_system_admin:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # User statistics
        total_users = User.objects.count()
        user_distribution = (
            User.objects
            .values('is_student', 'is_enroller', 'is_university_admin')
            .annotate(count=Count('id'))
        )

        # Application trends by month
        application_trends = (
            Application.objects
            .annotate(month=ExtractMonth('date_applied'), year=ExtractYear('date_applied'))
            .values('month', 'year')
            .annotate(count=Count('id'))
            .order_by('year', 'month')
        )

        # Institution statistics
        institution_stats = (
            Institution.objects
            .annotate(
                num_programs=Count('faculties__departments__programs', distinct=True),
                num_applications=Count('faculties__departments__programs__applications', distinct=True)
            )
            .order_by('-num_applications')[:5]
            .values('name', 'num_programs', 'num_applications')
        )

        # Recent activities
        recent_activities = (
            ActivityLog.objects
            .select_related('user')
            .order_by('-timestamp')[:10]
            .values('user__name', 'action', 'description', 'timestamp')
        )

        return Response({
            'user_stats': {
                'total_users': total_users,
                'user_distribution': list(user_distribution),
            },
            'application_trends': list(application_trends),
            'institution_stats': list(institution_stats),
            'recent_activities': list(recent_activities),
        })

    @action(detail=False, methods=['get'])
    def system_metrics(self, request):
        """Get real-time system metrics"""
        if not request.user.is_system_admin:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # CPU usage
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        memory_total = round(memory.total / (1024 ** 3), 2)  # in GB
        memory_used = round(memory.used / (1024 ** 3), 2)
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_usage = disk.percent
        disk_total = round(disk.total / (1024 ** 3), 2)
        disk_used = round(disk.used / (1024 ** 3), 2)
        
        # System info
        system_info = {
            'os': platform.system(),
            'os_version': platform.release(),
            'python_version': platform.python_version(),
            'django_version': '3.2',  # Update with your Django version
            'server_time': datetime.now().isoformat(),
            'uptime': str(timedelta(seconds=int(psutil.boot_time())) if hasattr(psutil, 'boot_time') else 'N/A')
        }
        
        # Database size (approximate)
        db_path = settings.DATABASES['default']['NAME']
        db_size = os.path.getsize(db_path) if os.path.exists(db_path) else 0
        db_size_mb = round(db_size / (1024 ** 2), 2)

        return Response({
            'cpu_usage': cpu_usage,
            'memory': {
                'usage': memory_usage,
                'total': memory_total,
                'used': memory_used,
            },
            'disk': {
                'usage': disk_usage,
                'total': disk_total,
                'used': disk_used,
            },
            'database_size_mb': db_size_mb,
            'system_info': system_info,
        })

    @action(detail=False, methods=['post'])
    def create_university_admin(self, request):
        """Create a new university admin user"""
        if not request.user.is_system_admin:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        required_fields = ['email', 'name', 'password', 'institution_id']
        if not all(field in request.data for field in required_fields):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            institution = Institution.objects.get(id=request.data['institution_id'])
            user = User.objects.create_user(
                email=request.data['email'],
                name=request.data['name'],
                password=request.data['password'],
                is_university_admin=True,
                assigned_institution=institution
            )
            return Response({"message": "University admin created successfully", "user_id": user.id})
        except Institution.DoesNotExist:
            return Response({"error": "Institution not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def list_university_admins(self, request):
        """List all university admins"""
        if not request.user.is_system_admin:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        admins = User.objects.filter(
            is_university_admin=True
        ).select_related('assigned_institution').values(
            'id', 'name', 'email', 'last_login', 'assigned_institution__name'
        )

        return Response(list(admins))