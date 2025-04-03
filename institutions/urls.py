# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstitutionViewSet, FacultyViewSet, DepartmentViewSet, ProgramViewSet, InstitutionProgramsView, ProgramDetailsViewSet,public_programs

router = DefaultRouter()
router.register(r'institutions', InstitutionViewSet, basename='institutions')
router.register(r'faculties', FacultyViewSet, basename='faculties')
router.register(r'departments', DepartmentViewSet, basename='departments')
router.register(r'programs', ProgramViewSet, basename='programs')
router.register(r'program-details', ProgramDetailsViewSet, basename='program-details')

urlpatterns = [
    path('institutions/<int:institution_id>/programs/', InstitutionProgramsView.as_view(), name='institution-programs'),
    path('programs/recommendations/',  ProgramViewSet.as_view({'get': 'recommendations'}),name='program-recommendations'),
    path('all-program-details/', public_programs, name='all-program-details'),
] + router.urls