from django.contrib.auth import logout
from rest_framework import generics, permissions, status,viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.decorators import action
from users.models.models import EducationHistory, UserDocument, UserSettings
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from institutions.models import Program
from institutions.serializers import MinimalProgramSerializer


from users.serializers.serializers import (
    RegisterSerializer, 
    LoginSerializer,
    UserSerializer,
    EducationHistorySerializer, 
    UserDocumentSerializer,
    UserProfileCompletionSerializer,
    UserSettingsSerializer
)
from django.contrib.auth import get_user_model
from django.utils import timezone
User = get_user_model()


# 🔹 User Registration View
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Registration successful!',
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


# 🔹 User Login View
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful!',
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)


# 🔹 Get Authenticated User Profile
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                RefreshToken(refresh_token).blacklist()
            logout(request)
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# 🔹 Role-Based Dashboard Redirection
class DashboardRedirectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.is_system_admin:
            return Response({"redirect_to": "/admin-dashboard"})
        elif user.is_student:
            return Response({"redirect_to": "/student-dashboard"})
        elif user.is_university_admin:
            return Response({"redirect_to": "/university-admin-dashboard"})
        else:
            return Response({"redirect_to": "/enroller-dashboard"})

class EducationHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = EducationHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EducationHistory.objects.filter(user=self.request.user)
    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            serializer.save() # Will use your serializer's create method with context
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return super().create(request, *args, **kwargs)
class UserDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserDocument.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        document = self.get_object()
        document.is_verified = True
        document.verified_at = timezone.now()
        document.save()
        return Response({'status': 'document verified'})

class ProfileCompletionViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        serializer = UserProfileCompletionSerializer(user)
        return Response(serializer.data)
    
class UserProfileUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class EducationHistoryCreateView(generics.CreateAPIView):
    serializer_class = EducationHistorySerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data
        if isinstance(data, list):
            # Handle multiple education histories
            serializer = self.get_serializer(data=data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        if isinstance(serializer, list):
            for item in serializer:
                item.save(user=self.request.user)
        else:
            serializer.save(user=self.request.user)


class UserDocumentUploadView(generics.CreateAPIView):
    queryset = UserDocument.objects.all()
    serializer_class = UserDocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        if not request.FILES.get('file'):
            return Response(
                {"error": "No file was uploaded"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add logging to debug
        print("Received files:", request.FILES)
        print("Received data:", request.data)
        
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            document_type=self.request.data.get('document_type', 'OTHER').upper(),
            title=self.request.FILES['file'].name
        )

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'put'], permission_classes=[IsAuthenticated],url_path='user-settings')
    def user_settings(self, request):
        settings, created = UserSettings.objects.get_or_create(user=request.user)

        if request.method == 'GET':
            serializer = UserSettingsSerializer(settings)
            return Response(serializer.data)

        elif request.method == 'PUT':
            serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='programs-list', permission_classes=[IsAuthenticated])
    def programs_list(self, request):
        user = request.user
        programs_queryset = Program.objects.all()

        if user.is_enroller and user.assigned_institution:
            programs_queryset = programs_queryset.filter(
                department__faculty__institution=user.assigned_institution
            )
        elif not user.is_system_admin:
            return Response(
                {"detail": "You do not have permission to access programs data."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MinimalProgramSerializer(programs_queryset, many=True)
        return Response(serializer.data)