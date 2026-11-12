from django.contrib import admin
from .models import Consignment


@admin.register(Consignment)
class ConsignmentAdmin(admin.ModelAdmin):
    """Admin interface for Consignment model."""
    
    list_display = [
        'consignment_number', 'item_name', 'client_name', 'category',
        'declared_value', 'status', 'received_date'
    ]
    list_filter = ['status', 'category', 'received_date', 'created_at']
    search_fields = [
        'consignment_number', 'item_name', 'client__user__email',
        'client__client_number', 'description'
    ]
    readonly_fields = ['consignment_number', 'created_at', 'updated_at']
    date_hierarchy = 'received_date'
    
    fieldsets = (
        ('Consignment Information', {
            'fields': ('consignment_number', 'client', 'status', 'current_location')
        }),
        ('Item Details', {
            'fields': (
                'item_name', 'category', 'description',
                'quantity', 'weight', 'weight_unit', 'purity'
            )
        }),
        ('Valuation', {
            'fields': ('declared_value', 'declared_value_currency')
        }),
        ('Receipt Information', {
            'fields': ('received_by', 'received_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def client_name(self, obj):
        return obj.client.full_name
    client_name.short_description = 'Client'
