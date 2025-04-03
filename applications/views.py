from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from rest_framework import viewsets, filters, status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from applications.models import Application, ApplicationDocument, Deadline, ActivityLog
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .serializers import ApplicationSerializer, ApplicationStatusSerializer, ActivityLogSerializer
from .permissions import IsStudentOwnerOrAdmin, IsAdminForStatusChange
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Q, Avg
from datetime import datetime, timedelta
from institutions.models import Institution, Program, Department



import time  
User = get_user_model()

@api_view(['POST'])
def analyze_application(request):
    start_time = time.time()

    exam_board = request.data.get('examBoard')
    passed_subjects = int(request.data.get('olevelSubjects', 0))
    a_level_points = int(request.data.get('alevelPoints', 0))
    if passed_subjects >= 5 and a_level_points > 2:
        try:
            request.user.a_level_points = a_level_points
            request.user.olevel_subjects = passed_subjects
            request.user.exam_board = exam_board
            request.user.save()
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        if exam_board == 'zimsec' and passed_subjects >= 5 and a_level_points >= 8:
            is_eligible = True
        elif exam_board == 'hexco' and passed_subjects >= 4 and a_level_points >= 6:
            is_eligible = True
        elif exam_board == 'cambridge' and passed_subjects >= 6 and a_level_points >= 10:
            is_eligible = True
        else:
            is_eligible = False
    else:
        is_eligible = False
    print(is_eligible,'data',passed_subjects >= 5 and a_level_points > 2)
    
    end_time = time.time()
    elapsed_time = end_time - start_time

    return Response({'isEligible': is_eligible, 'elapsedTime': elapsed_time})

def _log_activity(self, user, action, description, metadata=None):
    """Helper method to create activity logs"""
    ActivityLog.objects.create(
        user=user,
        action=action,
        description=description,
        metadata=metadata or {}
    )

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().select_related(
        'student', 'program__department__faculty__institution', 'program', 'program__department'
    ).order_by('-date_applied')
    serializer_class = ApplicationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'status': ['exact', 'in'],
        'program__department__faculty__institution': ['exact'],
        'program': ['exact'],
        'date_applied': ['gte', 'lte'],
    }
    search_fields = ['program__name', 'program__department__faculty__institution', 'student__username']
    ordering_fields = ['date_applied', 'date_updated', 'date_status_changed']
    ordering = ['-date_applied']

    def _log_activity(self, user, action, description, metadata=None):
        """Helper method to create activity logs"""
        ActivityLog.objects.create(
            user=user,
            action=action,
            description=description,
            metadata=metadata or {}
        )

    def get_permissions(self):
        if self.action in ['create', 'my_applications', 'my_activities']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['approve', 'reject', 'defer', 'waitlist']:
            permission_classes = [permissions.IsAuthenticated, IsAdminForStatusChange]
        else:
            permission_classes = [permissions.IsAuthenticated, IsStudentOwnerOrAdmin]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Students can only see their own applications
        if not self.request.user.is_staff:
            queryset = queryset.filter(student=self.request.user)
        
        # Additional filtering for admins
        if self.request.user.is_staff and 'student_id' in self.request.query_params:
            queryset = queryset.filter(student_id=self.request.query_params['student_id'])
            
        return queryset

    def perform_create(self, serializer):
        application = serializer.save(student=self.request.user)
        files = self.request.FILES.getlist('documents')
        
        # Log the creation
        self._log_activity(
            user=self.request.user,
            action='CREATED',
            description=f'Created application for {application.program.name}',
            metadata={
                'application_id': application.id,
                'program': application.program.name,
                'documents_uploaded': len(files)
            }
        )
        
        # Handle document uploads
        for file in files:
            ApplicationDocument.objects.create(
                application=application,
                file=file
            )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        application = serializer.save()
        
        # Log general update
        self._log_activity(
            user=self.request.user,
            action='UPDATED',
            description=f'Updated application for {application.program.name}',
            metadata={
                'application_id': application.id,
                'changes': serializer.validated_data
            }
        )
        
        # Log specific status changes if they occurred
        if 'status' in serializer.validated_data and old_status != application.status:
            self._log_status_change(application, old_status)

    def _log_status_change(self, application, old_status):
        status_mapping = {
            'Approved': 'APPROVED',
            'Rejected': 'REJECTED',
            'Deferred': 'REVIEWED',
            'Waitlisted': 'REVIEWED',
            'Withdrawn': 'REVIEWED',
        }
        
        action = status_mapping.get(application.status, 'REVIEWED')
        
        self._log_activity(
            user=self.request.user,
            action=action,
            description=f'Changed application status from {old_status} to {application.status}',
            metadata={
                'application_id': application.id,
                'old_status': old_status,
                'new_status': application.status,
                'program': application.program.name
            }
        )

    def perform_destroy(self, instance):
        # Log deletion before actually deleting
        self._log_activity(
            user=self.request.user,
            action='UPDATED',
            description=f'Deleted application for {instance.program.name}',
            metadata={
                'application_id': instance.id,
                'program': instance.program.name,
                'status': instance.status
            }
        )
        super().perform_destroy(instance)

    def _change_status(self, request, pk, new_status):
        application = self.get_object()
        old_status = application.status
        serializer = self.get_serializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Update the status
            application.status = new_status
            application.admin_notes = serializer.validated_data.get('admin_notes', '')
            application.save()
            
            # Log the status change
            self._log_status_change(application, old_status)
            
            return Response(ApplicationSerializer(application).data)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def status_options(self, request):
        """Get available status choices"""
        return Response({
            'choices': Application.STATUS_CHOICES,
            'transitions': Application.STATUS_TRANSITIONS
        })

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def approve(self, request, pk=None):
        """Approve an application"""
        return self._change_status(request, pk, 'Approved')

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def reject(self, request, pk=None):
        """Reject an application"""
        return self._change_status(request, pk, 'Rejected')

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def defer(self, request, pk=None):
        """Defer an application"""
        return self._change_status(request, pk, 'Deferred')

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def waitlist(self, request, pk=None):
        """Waitlist an application"""
        return self._change_status(request, pk, 'Waitlisted')

    @action(detail=False, methods=['get'])
    def my_applications(self, request):
        """Get current user's applications"""
        queryset = self.filter_queryset(self.get_queryset().filter(student=request.user))
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_activities(self, request):
        """Get current user's activity logs"""
        activities = ActivityLog.objects.filter(user=request.user).order_by('-timestamp')
        page = self.paginate_queryset(activities)
        if page is not None:
            serializer = ActivityLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ActivityLogSerializer(activities, many=True)
        return Response(serializer.data)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_application(request):
    program_id = request.query_params.get('program_id')
    
    if not program_id:
        return Response({'error': 'program_id parameter is required'}, status=400)
    
    try:
        program_id = int(program_id)
    except ValueError:
        return Response({'error': 'program_id must be an integer'}, status=400)
    
    has_applied = Application.objects.filter(
        Q(student=request.user) & 
        Q(program__id=program_id)
    )
    return Response({
        'has_applied': has_applied.exists(),
        'program_id': program_id,
        'status': has_applied.first().status if has_applied.exists() else '',
    })


class EnrollmentViewSet(viewsets.ViewSet):
    # Default permissions for all actions
    permission_classes = [IsAuthenticated]

    @action(
        detail=False, 
        methods=['get'],
        permission_classes=[AllowAny],  # This properly overrides the class-level permissions
        authentication_classes=[]  # This disables authentication for this endpoint
    )
    def stats(self, request):
        print('////////////////////')
        # Get current date and calculate important time periods
        today = datetime.now().date()
        current_year_start = datetime(today.year, 1, 1).date()
        last_year_start = datetime(today.year - 1, 1, 1).date()
        
        
        try:
            # 1. Most popular programs (top 6)
            popular_programs = Program.objects.annotate(
                applicant_count=Count('applications')
            ).order_by('-applicant_count')[:6].values('name', 'applicant_count')
            
            # Assign colors to programs for consistent chart display
            colors = ['#0d9488', '#1a365d', '#0f766e', '#0d9488', '#1a365d', '#0f766e']
            for i, program in enumerate(popular_programs):
                program['fill'] = colors[i % len(colors)]
            
            # 2. Total applicants count
            total_applicants = Application.objects.count()
            
            # 3. Applicant growth compared to last year
            current_year_applicants = Application.objects.filter(
                date_applied__gte=current_year_start
            ).count()
            
            last_year_applicants = Application.objects.filter(
                date_applied__gte=last_year_start,
                date_applied__lt=current_year_start
            ).count()
            
            applicant_growth = 0
            if last_year_applicants > 0:
                applicant_growth = round(
                    ((current_year_applicants - last_year_applicants) / last_year_applicants) * 100,
                    1
                )
            
            # 4. Total programs and universities
            total_programs = Program.objects.count()
            total_universities = Institution.objects.count()
            
            avg_processing_time = Application.objects.filter(
                status__in=['Approved', 'Rejected']
            ).aggregate(
                avg_days=Avg(
                    F('date_status_changed') - F('date_applied')
                )
            )['avg_days'] or 0
            
            if isinstance(avg_processing_time, timedelta):
                avg_processing_time = avg_processing_time.days
            
            last_year_processing = Application.objects.filter(
                status__in=['Approved', 'Rejected'],
                date_status_changed__gte=last_year_start,
                date_status_changed__lt=current_year_start
            ).aggregate(
                avg_days=Avg(
                    F('date_status_changed') - F('date_applied')
                )
            )['avg_days'] or timedelta(days=0)
            
            if isinstance(last_year_processing, timedelta):
                last_year_processing = last_year_processing.days
            
            processing_improvement = 0
            if last_year_processing > 0:
                processing_improvement = round(last_year_processing - avg_processing_time)
            
            # 7. Application deadline
            next_deadline = Deadline.objects.filter(
                date__gte=today,
                is_active=True
            ).order_by('date').first()
            
            deadline_data = {
                'deadline': next_deadline.date if next_deadline else None,
                'semester': next_deadline.semester if next_deadline else 'Fall Semester'
            }
            # cache.set(cache_key, data, timeout=3600) 
            return Response({
                'popular_programs': popular_programs,
                'total_applicants': total_applicants,
                'applicant_growth': applicant_growth,
                'total_programs': total_programs,
                'total_universities': total_universities,
                'avg_processing_time': avg_processing_time,
                'processing_improvement': processing_improvement,
                'deadline': deadline_data['deadline'],
                'semester': deadline_data['semester'],
                'last_updated': datetime.now().isoformat()
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )