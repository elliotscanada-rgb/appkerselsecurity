from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """Admin interface for Client model."""
    
    list_display = ['client_number', 'full_name', 'email', 'phone', 'city', 'country', 'created_at']
    list_filter = ['country', 'city', 'created_at']
    search_fields = ['client_number', 'user__email', 'user__first_name', 'user__last_name', 'phone']
    readonly_fields = ['client_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Client Information', {
            'fields': ('client_number', 'user')
        }),
        ('Contact Details', {
            'fields': ('phone', 'address', 'city', 'country')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
