from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework import viewsets, filters, status, permissions
from rest_framework.permissions import IsAuthenticated
from applications.models import Application, ApplicationDocument, Deadline, ActivityLog
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .serializers import ApplicationSerializer, ApplicationStatusSerializer
from .permissions import IsStudentOwnerOrAdmin, IsAdminForStatusChange
from django.contrib.auth import get_user_model
from django.db.models import Count, F
from datetime import datetime, timedelta

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


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().select_related(
        'student', 'program__department__faculty__institution', 'program','program__department'
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

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsStudentOwnerOrAdmin, IsAdminForStatusChange]
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
        print('serializer...............',self.request.data)
        application = serializer.save(student=self.request.user)
        files = self.request.FILES.getlist('documents')
        for file in files:
            ApplicationDocument.objects.create(
                application=application,
                file=file
            )

    # Status change actions for admins
    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def approve(self, request, pk=None):
        return self._change_status(request, pk, 'Approved')

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def reject(self, request, pk=None):
        return self._change_status(request, pk, 'Rejected')

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def defer(self, request, pk=None):
        return self._change_status(request, pk, 'Deferred')

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def waitlist(self, request, pk=None):
        return self._change_status(request, pk, 'Waitlisted')

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def withdraw(self, request, pk=None):
        return self._change_status(request, pk, 'Withdrawn')


    def _change_status(self, request, pk, new_status):
        application = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            if new_status == 'Approved':
                application.approve(serializer.validated_data.get('admin_notes'))
            elif new_status == 'Rejected':
                application.reject(serializer.validated_data.get('admin_notes'))
            elif new_status == 'Deferred':
                application.defer(serializer.validated_data.get('admin_notes'))
            elif new_status == 'Waitlisted':
                application.waitlist(serializer.validated_data.get('admin_notes'))
            elif new_status == 'Withdrawn':
                application.withdraw(serializer.validated_data.get('admin_notes'))
                
            return Response(self.get_serializer(application).data)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def status_options(self, request):
        """Get available status choices"""
        return Response({
            'choices': Application.STATUS_CHOICES,
            'transitions': Application.STATUS_TRANSITIONS
        })

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
    


class EnrollmentViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        # Get counts for different application statuses
        stats = {
            'total_applications': Application.objects.count(),
            'pending_review': Application.objects.filter(status='Pending').count(),
            'approved': Application.objects.filter(status='Approved').count(),
            'rejected': Application.objects.filter(status='Rejected').count(),
        }
        
        pending_applications = Application.objects.filter(status='Pending') \
            .select_related('student', 'program') \
            .order_by('date_applied')[:10] \
            .values('id', 'date_applied', student_name=F('student__name'), 
                   program_name=F('program__name'))
        
        recent_activity = ActivityLog.objects.filter(user=request.user) \
            .order_by('-timestamp')[:5] \
            .values('description', 'timestamp')
        
        upcoming_deadlines = Deadline.objects.filter(
            date__gte=datetime.now().date(),
            date__lte=datetime.now().date() + timedelta(days=30),
            is_active=True
        ).values('title', 'date', 'semester')
        
        last_month = datetime.now() - timedelta(days=30)
        current_month_count = Application.objects.filter(
            date_applied__gte=datetime.now().replace(day=1)
        ).count()
        last_month_count = Application.objects.filter(
            date_applied__gte=last_month.replace(day=1),
            date_applied__lt=datetime.now().replace(day=1)
        ).count()
        
        if last_month_count > 0:
            change_percent = ((current_month_count - last_month_count) / last_month_count) * 100
            metrics_summary = f"Application trend is {'up' if change_percent >= 0 else 'down'} " \
                             f"{abs(round(change_percent))}% compared to last month"
        else:
            metrics_summary = "No comparison data available"
        
        return Response({
            'stats': stats,
            'pending_applications': pending_applications,
            'recent_activity': recent_activity,
            'upcoming_deadlines': upcoming_deadlines,
            'metrics_summary': metrics_summary,
        })