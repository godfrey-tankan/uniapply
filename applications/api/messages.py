# applications/views/messages.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from applications.api.serializers.serializers import MessageSerializer
from django.contrib.auth import get_user_model
from django.db.models import Q, Max
from applications.models.models import Message, Application

User = get_user_model()
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get messages for a specific application if application_id is provided
        application_id = self.request.query_params.get('application_id')
        if application_id:
            try:
                application = Application.objects.get(id=application_id)
                # Verify the user has access to this application
                if not (self.request.user.is_system_admin or 
                    (self.request.user.is_enroller and 
                    self.request.user.assigned_institution == application.program.department.faculty.institution) or
                    (self.request.user == application.student)):
                    return Message.objects.none()
                
                return Message.objects.filter(
                    Q(sender=self.request.user, recipient=application.student) |
                    Q(sender=application.student, recipient=self.request.user)
                ).order_by('-timestamp')
            except Application.DoesNotExist:
                return Message.objects.none()
        
        # Default behavior for other cases
        user = self.request.user
        if user.is_enroller:
            return Message.objects.filter(
                Q(sender=user) | Q(recipient=user),
                is_system=False
            ).distinct().order_by('-timestamp')
        return Message.objects.filter(recipient=user).order_by('-timestamp')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            # Validate the serializer
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print('Validation error:', e)
            return Response(
                {"error": "Invalid data provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.is_valid(raise_exception=True)
        print('serializer errors:', serializer.errors)
        
        application_id = request.data.get('application_id')
        if application_id:
            try:
                application = Application.objects.get(id=application_id)
                recipient = application.student
            except Application.DoesNotExist:
                print('error occured....', application_id)
                return Response(
                    {"error": "Application not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            recipient_id = serializer.validated_data.get('recipient')
            try:
                recipient = User.objects.get(id=recipient_id, is_student=True)
            except User.DoesNotExist:
                print(f"Recipient ID: {recipient_id}")
                return Response(
                    {"error": "Recipient not found or not a student"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        message = serializer.save(
            sender=request.user,
            recipient=recipient
        )

        # Send notification to recipient
        from applications.services.notifications import send_notification
        send_notification(
            user=recipient,
            title="New Message",
            message=f"You have a new message from {request.user.name}",
            notification_type="MESSAGE"
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def by_application(self, request):
        """Get messages for a specific application"""
        application_id = request.query_params.get('application_id')
        if not application_id:
            return Response(
                {"error": "application_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            application = Application.objects.get(id=application_id)
            # Verify the user has access to this application
            if not (request.user.is_system_admin or 
                (request.user.is_enroller and 
                request.user.assigned_institution == application.program.department.faculty.institution) or
                (request.user == application.student)):
                return Response(
                    {"error": "You don't have permission to view these messages"},
                    status=status.HTTP_403_FORBIDDEN
                )

            messages = Message.objects.filter(
                Q(sender=request.user, recipient=application.student) |
                Q(sender=application.student, recipient=request.user)
            ).order_by('-timestamp')

            serializer = self.get_serializer(messages, many=True)
            return Response(serializer.data)

        except Application.DoesNotExist:
            return Response(
                {"error": "Application not found"},
                status=status.HTTP_404_NOT_FOUND
            )