# applications/views/deadlines.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from applications.models.models import Deadline
from applications.api.serializers.serializers import DeadlineSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class DeadlineViewSet(viewsets.ModelViewSet):
    queryset = Deadline.objects.all()
    serializer_class = DeadlineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        
        # Filter by institution if enroller
        if user.is_enroller and user.assigned_institution:
            queryset = queryset.filter(
                institution=user.assigned_institution,
                date__gte=timezone.now().date()
            )
        # System admin can see all deadlines
        elif user.is_system_admin:
            queryset = queryset.filter(date__gte=timezone.now().date())
        else:
            queryset = queryset.none()
            
        return queryset.order_by('date')

    def create(self, request, *args, **kwargs):
        if not request.user.is_enroller:
            return Response(
                {"error": "Only enrollers can create deadlines"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            deadline = serializer.save(
                institution=request.user.assigned_institution
            )
            
            from applications.services.notifications import notify_students_of_deadline
            from applications.services.emails import send_deadline_event
            notify_students_of_deadline(deadline)
            send_deadline_event(request, deadline)
            
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating deadline: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )