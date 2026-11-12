from django.contrib import admin
from .models import Staff


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    """Admin interface for Staff model."""
    
    list_display = ['staff_number', 'full_name', 'email', 'department', 'phone', 'created_at']
    list_filter = ['department', 'created_at']
    search_fields = ['staff_number', 'user__email', 'user__first_name', 'user__last_name', 'phone']
    readonly_fields = ['staff_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Staff Information', {
            'fields': ('staff_number', 'user', 'department')
        }),
        ('Contact Details', {
            'fields': ('phone',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
