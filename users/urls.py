from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    UserProfileView, 
    DashboardRedirectView,
    EducationHistoryViewSet,
    UserDocumentViewSet,
    ProfileCompletionViewSet,
    UserProfileUpdateView,
    EducationHistoryCreateView,
    UserDocumentUploadView,
    
)
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from django.conf import settings

router = DefaultRouter()
# router.register(r'user-education-history', EducationHistoryViewSet, basename='user-education-history')
router.register(r'user-documents', UserDocumentViewSet, basename='user-documents')
router.register(r'profile-completion', ProfileCompletionViewSet, basename='profile-completion')

 

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('auth/dashboard/', DashboardRedirectView.as_view(), name='dashboard_redirect'),
    path('education-history/', EducationHistoryCreateView.as_view(), name='education-history-create'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('education-history/', EducationHistoryCreateView.as_view(), name='education-history-create'),
    path('documents/', UserDocumentUploadView.as_view(), name='document-create'),
    
]
urlpatterns += router.urls