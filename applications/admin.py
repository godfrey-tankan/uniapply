from django.contrib import admin
from applications.models import Application, ApplicationDocument
from .models import ActivityLog, Deadline

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'description', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('user__email', 'description')

@admin.register(Deadline)
class DeadlineAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'semester', 'is_active')
    list_filter = ('semester', 'is_active')
    search_fields = ('title', 'description')
    date_hierarchy = 'date'




@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'university_name_display', 'program_name_display', 'status', 'date_applied', 'date_updated']
    search_fields = ['student__username', 'institution__name', 'program__name']
    list_filter = ['status', 'date_applied', 'date_updated']
    readonly_fields = ['id', 'date_applied', 'date_updated']
    fieldsets = (
        (None, {'fields': ('id', 'student', 'program', 'status', 'date_applied', 'date_updated','admin_notes', 'personal_statement')}),
    )
    ordering = ['date_applied']
    list_per_page = 20

    actions = ['approve_applications', 'reject_applications', 'defer_applications', 'waitlist_applications', 'withdraw_applications']

    @admin.display(description='University Name')
    def university_name_display(self, obj):
        return obj.university_name

    @admin.display(description='Program Name')
    def program_name_display(self, obj):
        return obj.program_name

@admin.register(ApplicationDocument)
class ApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'application', 'file', 'uploaded_at']
    search_fields = ['application__student__username', 'application__institution__name', 'application__program__name']
    list_filter = ['uploaded_at']
    readonly_fields = ['id', 'uploaded_at']
    fieldsets = (
        (None, {'fields': ('id', 'application', 'file', 'uploaded_at')}),
    )
    ordering = ['uploaded_at']
    list_per_page = 20
