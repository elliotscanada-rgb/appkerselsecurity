from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'table_name', 'timestamp']
    list_filter = ['action', 'table_name']
    readonly_fields = ['user', 'action', 'table_name', 'record_id', 'timestamp', 'ip_address']
