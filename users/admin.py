from django.contrib import admin
from .models.models import User, Role, EducationHistory, UserDocument

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'name', 'is_student', 'is_university_admin','is_system_admin','is_enroller']
    search_fields = ['email', 'name']
    list_filter = ['is_student', 'is_university_admin','is_system_admin','is_active','province','assigned_institution','is_enroller']
    readonly_fields = ['id']
    fieldsets = (
        (None, {'fields': ('id', 'email', 'name', 'password')}),
        ('Permissions', {'fields': ('is_student', 'is_university_admin', 'is_staff', 'is_superuser', 'system_role','is_system_admin','a_level_points','province', 'is_active','country','gender', 'phone_number', 'is_enroller', 'assigned_institution')}),
    )
    ordering = ['is_student','province']
    list_per_page = 20
    actions = ['deactivate_users', 'activate_users']

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'is_system_role']
    search_fields = ['name']
    list_filter = ['is_system_role']

@admin.register(EducationHistory)
class EducationHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'user',  'institution', 'start_date', 'end_date']
    search_fields = ['user__email',  'institution']
    list_filter = [ 'institution']
    readonly_fields = ['id']
    ordering = ['user']
    list_per_page = 20

@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'document_type', 'is_verified']
    search_fields = ['user__email', 'document_type']
    list_filter = ['is_verified']
    readonly_fields = ['id']
    ordering = ['user']
    list_per_page = 20
