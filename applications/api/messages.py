# applications/views/messages.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from applications.models.models import Message
from applications.api.serializers.serializers import MessageSerializer
from django.contrib.auth import get_user_model
from django.db.models import Q, Max

User = get_user_model()

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_enroller:
            return Message.objects.filter(
                Q(sender=user) | Q(recipient=user),
                is_system=False
            ).distinct().order_by('-timestamp')
        return Message.objects.filter(recipient=user).order_by('-timestamp')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        recipient_id = serializer.validated_data.get('recipient')
        try:
            recipient = User.objects.get(id=recipient_id, is_student=True)
        except User.DoesNotExist:
            return Response(
                {"error": "Recipient not found or not a student"},
                status=status.HTTP_400_BAD_REQUEST
            )

        message = serializer.save(
            sender=request.user,
            recipient=recipient
        )

        # Send notification to student
        from applications.services.notifications import send_notification
        send_notification(
            user=recipient,
            title="New Message",
            message=f"You have a new message from {request.user.name}",
            notification_type="MESSAGE"
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def students(self, request):
        if not request.user.is_enroller:
            return Response(
                {"error": "Only enrollers can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all students who have messages with this enroller
        students = User.objects.filter(
            is_student=True,
            messages_received__sender=request.user
        ).distinct().annotate(
            last_message=Max('messages_received__timestamp')
        ).order_by('-last_message')

        result = []
        for student in students:
            last_message = Message.objects.filter(
                Q(sender=request.user, recipient=student) |
                Q(sender=student, recipient=request.user)
            ).order_by('-timestamp').first()
            
            result.append({
                'student': {
                    'id': student.id,
                    'name': student.name,
                    'email': student.email
                },
                'last_message': last_message.text if last_message else '',
                'messages': MessageSerializer(
                    Message.objects.filter(
                        Q(sender=request.user, recipient=student) |
                        Q(sender=student, recipient=request.user)
                    ).order_by('-timestamp')[:20],
                    many=True
                ).data
            })

        return Response(result)