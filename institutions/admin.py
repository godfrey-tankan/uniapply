from django.contrib import admin
from institutions.models import *

# Register your models here.
@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'location' ]
    search_fields = ['name', 'location']
    list_filter = [ 'location' ]
    readonly_fields = ['id',  ]
    fieldsets = (
        (None, {'fields': ('id', 'name', 'location' ,'logo')}),
    )
    ordering = ['name']
    list_per_page = 20
    actions = ['approve_institutions', 'reject_institutions', 'defer_institutions', 'waitlist_institutions', 'withdraw_institutions']
    
    
@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'department','institution', 'min_points_required', 'total_enrollment', 'fee']
    search_fields = ['name','department__faculty__institution__name']  # Search by program name and institution name
    readonly_fields = ['id']
    fieldsets = (
        (None, {'fields': ('id', 'name', 'department', 'min_points_required', 'total_enrollment', 'fee','description', 'start_date', 'end_date', 'required_subjects')}),
    )
    ordering = ['name']
    list_per_page = 20
    actions = ['approve_programs', 'reject_programs', 'defer_programs', 'waitlist_programs', 'withdraw_programs']

    def faculty(self, obj):
        return obj.department.faculty.name if obj.department else None

    def institution(self, obj):
        return obj.department.faculty.institution.name if obj.department and obj.department.faculty else None
    institution.admin_order_field = 'department__faculty__institution__name'
    institution.short_description = 'Institution'  
    
@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'institution', 'code']
    search_fields = ['name', 'institution']
    readonly_fields = ['id', ]
    fieldsets = (
        (None, {'fields': ('id', 'name', 'institution', )}),
    )
    ordering = ['name']
    list_per_page = 20
    actions = ['approve_faculties', 'reject_faculties', 'defer_faculties', 'waitlist_faculties', 'withdraw_faculties']

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'faculty', ]
    search_fields = ['name', 'faculty']
    list_filter = []
    readonly_fields = ['id', ]
    fieldsets = (
        (None, {'fields': ('id', 'name', 'faculty', )}),
    )
    ordering = ['faculty']
    list_per_page = 20
    actions = ['approve_departments', 'reject_departments', 'defer_departments', 'waitlist_departments', 'withdraw_departments']
