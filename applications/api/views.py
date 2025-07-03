from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from rest_framework import viewsets, filters, status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from applications.models.models import Application, ApplicationDocument, Deadline, ActivityLog, Message, Notification
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .serializers.serializers import (
    ApplicationSerializer, 
    ApplicationStatusSerializer, 
    ActivityLogSerializer, 
    DocumentRequestSerializer, 
    MessageSerializer,
    ProgramAlternativeSerializer,
    NotificationSerializer
)
from ..services.permissions import IsStudentOwnerOrAdmin, IsAdminForStatusChange
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Q, Avg
from datetime import datetime, timedelta
from institutions.models import Institution, Program, Department
from applications.services.emails import (
    send_document_request_email,
    send_program_alternative_email,
    send_status_email
)
from applications.services.notifications import send_notification
from django.http import Http404
import time  
from django.utils import timezone
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
        print(f"Queryset filtered for user {self.request.user.username}: {queryset}")
            
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
        print(f"Received status change request: {request.data}")
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
    def approved(self, request, pk=None):
        """Approve an application"""
        response = self._change_status(request, pk, 'Approved')
        if response.status_code == 200:
            application = self.get_object()
            send_status_email(application, request)
        return response

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def rejected(self, request, pk=None):
        """Reject an application"""
        response = self._change_status(request, pk, 'Rejected')
        if response.status_code == 200:
            application = self.get_object()
            send_status_email(application, request)
        return response

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def deferred(self, request, pk=None):
        """Defer an application"""
        response = self._change_status(request, pk, 'Deferred')
        if response.status_code == 200:
            application = self.get_object()
            send_status_email(application, request)
        return response

    @action(detail=True, methods=['post'], serializer_class=ApplicationStatusSerializer)
    def waitlisted(self, request, pk=None):
        """Waitlist an application"""
        response = self._change_status(request, pk, 'Waitlisted')
        if response.status_code == 200:
            application = self.get_object()
            send_status_email(application, request)
        return response

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
    permission_classes = [IsAuthenticated]

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated] # Ensure only authenticated users can access
    )
    def dashboard(self, request):
        user = request.user
        
        # Security check: Only enrollers or system admins can access this dashboard
        if not (hasattr(user, 'is_enroller') and user.is_enroller) and not user.is_system_admin:
            return Response(
                {"detail": "You do not have permission to access this resource."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Determine the institution for filtering
        institution_filter = {}
        if user.is_enroller and user.assigned_institution:
            institution_filter['program__department__faculty__institution'] = user.assigned_institution
            # For displaying institution name on the dashboard
            institution_name = user.assigned_institution.name
        elif user.is_system_admin:
            # System admins can view all data, no institution filter
            institution_name = "All Institutions"
        else:
            return Response(
                {"detail": "No assigned institution for enroller, or user is not an enroller/admin."},
                status=status.HTTP_403_FORBIDDEN # Or 400 Bad Request depending on interpretation
            )

        try:
            # --- Stats Overview ---
            total_applications = Application.objects.filter(**institution_filter).count()
            pending_review = Application.objects.filter(status='Pending', **institution_filter).count()
            approved = Application.objects.filter(status='Approved', **institution_filter).count()
            rejected = Application.objects.filter(status='Rejected', **institution_filter).count()

            # --- Pending Applications for Enroller's review ---
            pending_applications_qs = Application.objects.filter(status='Pending', **institution_filter).select_related('student__user', 'program').order_by('-date_applied')[:5]
            pending_applications_data = []
            for app in pending_applications_qs:
                pending_applications_data.append({
                    'id': app.id,
                    'student_name': app.student.user.name if app.student and app.student.user else 'N/A',
                    'program_name': app.program.name if app.program else 'N/A',
                    'date_applied': app.date_applied.isoformat()
                })

            # --- Upcoming Deadlines (filtered by institution's programs if applicable) ---
            today = datetime.now().date()
            
            # Fetch programs related to the enroller's institution
            if user.is_enroller and user.assigned_institution:
                # Get all programs under the assigned institution
                institution_programs_ids = Program.objects.filter(
                    department__faculty__institution=user.assigned_institution
                ).values_list('id', flat=True)
                
                # Filter deadlines associated with these programs. This assumes Deadlines are linked to Programs.
                # If Deadlines are global, this logic needs adjustment.
                # Assuming Deadline has a ManyToMany or ForeignKey to Program. If not, you'll need to adapt.
                # For now, let's assume Deadlines might be generally applicable or linked to Institution directly.
                # If Deadline is not linked to Program/Institution:
                upcoming_deadlines_qs = [] # Default to empty if no specific institution link
                # If Deadline can be linked to an institution: (add institution FK to Deadline model)
                # upcoming_deadlines_qs = Deadline.objects.filter(
                #     date__gte=today,
                #     is_active=True,
                #     institution=user.assigned_institution # Requires 'institution' FK on Deadline model
                # ).order_by('date')[:5]
                # If no direct link, it might be a general deadline for all applications
                upcoming_deadlines_qs = [] # You need to define how deadlines relate to institutions.
                # For this example, let's assume general deadlines or implement a placeholder:
                upcoming_deadlines_qs = [] # Placeholder: You need to define how deadlines relate to programs/institutions.
                                           # If Deadlines are global, remove this filter.
                                           # If Deadlines are per Program, you'd filter:
                                           # Deadline.objects.filter(date__gte=today, is_active=True, program__in=institution_programs_ids).order_by('date')[:5]
            else: # System admin or no assigned institution (show all global deadlines if they exist)
                upcoming_deadlines_qs = [] # Placeholder: You need to define how deadlines relate to programs/institutions.
            
            # Let's use a simpler approach for deadlines for now, assuming they are either global
            # or you will link them to Institution in your `Deadline` model.
            # For demonstration, I'll fetch general deadlines. If you have `institution` FK on Deadline, filter by that.
            upcoming_deadlines = [] # Initialize
            # Example if Deadline had an 'institution' FK:
            # deadlines_filter = {}
            # if user.is_enroller and user.assigned_institution:
            #     deadlines_filter['institution'] = user.assigned_institution
            # upcoming_deadlines_qs = Deadline.objects.filter(
            #     date__gte=today,
            #     is_active=True,
            #     **deadlines_filter
            # ).order_by('date')[:5]
            # for deadline in upcoming_deadlines_qs:
            #     upcoming_deadlines.append({
            #         'title': f"Application Deadline for {deadline.semester}",
            #         'date': deadline.date.isoformat(),
            #         'semester': deadline.semester
            #     })

            # Placeholder for upcoming_deadlines if you don't have a concrete implementation yet
            deadlines = Deadline.objects.filter(
                institution=user.institution
            )
            upcoming_deadlines_data = [
                {'title': 'General Application Period Closes', 'date': (today + timedelta(days=30)).isoformat(), 'semester': 'Fall'},
                {'title': 'Early Bird Deadline', 'date': (today + timedelta(days=60)).isoformat(), 'semester': 'Spring'}
            ]


            # This is where you would generate your chart. For now, it's a placeholder.
            metrics_chart_base64 = "" # This would come from your chart generation logic (e.g., matplotlib)
            metrics_summary = "Application metrics for the assigned institution."
            if user.is_system_admin:
                metrics_summary = "Application metrics across all institutions."


            return Response({
                'institution_name': institution_name, 
                'stats': {
                    'total_applications': total_applications,
                    'pending_review': pending_review,
                    'approved': approved,
                    'rejected': rejected,
                },
                'pending_applications': pending_applications_data,
                'upcoming_deadlines': deadlines,
                'metrics_chart': metrics_chart_base64, # Placeholder for your chart
                'metrics_summary': metrics_summary,
                'last_updated': datetime.now().isoformat()
            })

        except Exception as e:
            print(f"Error in enroller dashboard: {e}")
            return Response(
                {'error': 'An unexpected error occurred while fetching dashboard data.', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[AllowAny], # You might want to restrict this more later
        authentication_classes=[]
    )
    def stats(self, request):
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
            )['avg_days'] or timedelta(days=0)

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
            # If Deadline model is linked to Institution, you might want to filter here too.
            # Assuming Deadlines are global or a different endpoint serves institution-specific ones
            next_deadline = None # Placeholder. Implement actual deadline logic here.
            
            # Example if Deadline had an 'institution' FK:
            # next_deadline = Deadline.objects.filter(
            #     date__gte=today,
            #     is_active=True
            # ).order_by('date').first()
            
            deadline_data = {
                'deadline': next_deadline.date if next_deadline else None,
                'semester': next_deadline.semester if next_deadline else 'Fall Semester'
            }
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
            
class EnrollerActionsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def request_documents(self, request, pk=None):
        """
        Endpoint for enrollers to request additional documents from students
        """
        application = self.get_application(pk)
        serializer = DocumentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Save the document request to application
            application.admin_notes = (
                f"DOCUMENT REQUESTED: {serializer.validated_data['documents_requested']}\n"
                f"{application.admin_notes or ''}"
            )
            application.save()

            # Log activity
            self._log_activity(
                user=request.user,
                application=application,
                action='DOCUMENT_REQUEST',
                description=f"Requested documents: {serializer.validated_data['documents_requested']}"
            )

            # Send email notification to student
            send_document_request_email(
                application=application,
                documents_requested=serializer.validated_data['documents_requested'],
                request=request
            )

            # Create notification for student
            send_notification(
                user=application.student,
                title="Document Request",
                message=f"{request.user.name} requested additional documents for your application",
                notification_type="DOCUMENT_REQUEST"
            )

            return Response({"status": "Document request sent to student"}, status=status.HTTP_200_OK)

        except Exception as e:
            print('error occurred..',e)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def offer_alternative(self, request, pk=None):
        """
        Endpoint for enrollers to offer alternative programs to students
        """
        print(request.data)
        application = self.get_application(pk)
        serializer = ProgramAlternativeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # print('errors...', serializer.errors)
        try:
            alternative_program = Program.objects.get(id=serializer.validated_data['alternative_program_id'])

            # Save the alternative offer to application notes
            application.admin_notes = (
                f"ALTERNATIVE PROGRAM OFFERED: {alternative_program.name}\n"
                f"{application.admin_notes or ''}"
            )
            application.save()

            # Log activity
            self._log_activity(
                user=request.user,
                application=application,
                action='ALTERNATIVE_OFFER',
                description=f"Offered alternative program: {alternative_program.name}"
            )

            # Send email notification to student
            send_program_alternative_email(
                application=application,
                alternative_program=alternative_program,
                request=request
            )

            # Create notification for student
            send_notification(
                user=application.student,
                title="Alternative Program Offered",
                message=f"{request.user.name} offered you an alternative program: {alternative_program.name}",
                notification_type="PROGRAM_ALTERNATIVE"
            )

            return Response(
                {"status": f"Alternative program {alternative_program.name} offered to student"},
                status=status.HTTP_200_OK
            )

        except Program.DoesNotExist:
            return Response(
                {"error": "Program not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print('error occured..',e)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """
        Get program recommendations for this application
        """
        application = self.get_application(pk)
        
        try:
            # Get student's A-Level points or default to 0
            student_points = application.student.a_level_points or 0
            
            # Get current program stats
            current_program = application.program
            current_stats = self._calculate_program_stats(current_program, student_points)

            # Get alternative programs in the same faculty
            alternatives = Program.objects.filter(
                department__faculty=current_program.department.faculty
            ).exclude(id=current_program.id)

            # Calculate stats for alternatives
            alternative_stats = []
            for program in alternatives:
                stats = self._calculate_program_stats(program, student_points)
                alternative_stats.append(stats)

            # Sort by acceptance probability (highest first)
            alternative_stats.sort(key=lambda x: x['acceptance_probability'], reverse=True)

            return Response({
                'current_program': current_stats,
                'alternatives': alternative_stats[:5]  # Return top 5 alternatives
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        Get all messages for this application
        """
        application = self.get_application(pk)
        
        try:
            messages = Message.objects.filter(
                Q(sender=request.user, recipient=application.student) |
                Q(sender=application.student, recipient=request.user)
            ).order_by('-timestamp')

            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """
        Send a message to the student about this application
        """
        application = self.get_application(pk)
        serializer = MessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            message = serializer.save(
                sender=request.user,
                recipient=application.student,
                text=serializer.validated_data['text']
            )

            # Log activity
            self._log_activity(
                user=request.user,
                application=application,
                action='MESSAGE',
                description=f"Sent message to student"
            )

            # Create notification for student
            send_notification(
                user=application.student,
                title="New Message",
                message=f"{request.user.name} sent you a message about your application",
                notification_type="MESSAGE"
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _calculate_program_stats(self, program, student_points):
        """
        Calculate statistics and suitability for a program
        """
        applications = program.applications.exclude(student__a_level_points__isnull=True)
        total_applicants = applications.count()

        # Calculate acceptance probability
        if total_applicants == 0:
            acceptance_prob = 0.7 if student_points >= program.min_points_required else 0.3
        else:
            if student_points > program.min_points_required:
                acceptance_prob = 0.8 - (0.3 * (applications.filter(student__a_level_points__gt=student_points).count() / total_applicants))
            elif student_points == program.min_points_required:
                acceptance_prob = 0.5
            else:
                acceptance_prob = 0.3 * (1 - (applications.filter(student__a_level_points__gt=student_points).count() / total_applicants))
            
            acceptance_prob = max(0.1, min(0.9, acceptance_prob))

        return {
            'program_id': program.id,
            'program_name': program.name,
            'program_code': program.code,
            'institution': program.department.faculty.institution.name,
            'min_points_required': program.min_points_required,
            'student_points': student_points,
            'acceptance_probability': round(acceptance_prob, 2),
            'required_subjects': program.requirements
        }

    def _log_activity(self, user, application, action, description):
        """Helper method to log activities"""
        ActivityLog.objects.create(
            user=user,
            action=action,
            description=description,
            metadata={
                'application_id': application.id,
                'program': application.program.name,
                'student': application.student.username
            }
        )

    def get_application(self, pk):
        """Helper method to get and validate application"""
        try:
            application = Application.objects.get(pk=pk)
            # Verify enroller has access to this application
            if not (self.request.user.is_system_admin or 
                    (self.request.user.is_enroller and 
                    self.request.user.assigned_institution == application.program.department.faculty.institution)):
                raise PermissionError("You don't have permission to access this application")
            return application
        except Application.DoesNotExist:
            raise Http404("Application not found")

class NotificationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_notifications(self, request):
        """Get notifications for the current user"""
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a specific notification as read"""
        try:    
            notification = Notification.objects.get(id=pk, user=request.user)
            notification.mark_as_read()
            return Response({"status": "Notification marked as read"}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        notifications = Notification.objects.filter(user=request.user, is_read=False)
        if not notifications.exists():
            return Response({"status": "No unread notifications"}, status=status.HTTP_204_NO_CONTENT)
        
        notifications.update(is_read=True, read_at=timezone.now())
        return Response({"status": "All notifications marked as read"}, status=status.HTTP_200_OK)
