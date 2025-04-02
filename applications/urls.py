from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet, analyze_application, EnrollmentViewSet

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'enrollment', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('analyze-application/',analyze_application, name='analyze_application'),
]
