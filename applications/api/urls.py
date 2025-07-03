from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet, analyze_application, EnrollmentViewSet, check_application, EnrollerActionsViewSet, NotificationViewSet
from applications.api.messages import MessageViewSet
from applications.api.deadlines import DeadlineViewSet
router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'enrollment', EnrollmentViewSet, basename='enrollment')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'deadlines', DeadlineViewSet, basename='deadline')
router.register(r'enroller-actions', EnrollerActionsViewSet, basename='enroller-actions')
router.register(r'notifications', NotificationViewSet, basename='notification')
urlpatterns = [
    path('', include(router.urls)),
    path('analyze-application/',analyze_application, name='analyze_application'),
    path('application/check/', check_application, name='check-application'),
]
