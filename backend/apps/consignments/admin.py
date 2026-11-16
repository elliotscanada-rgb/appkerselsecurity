from django.contrib import admin
from .models import Consignment, CustodyStep, ConsignmentHistory


class CustodyStepInline(admin.TabularInline):
    """Inline admin for CustodyStep model."""
    model = CustodyStep
    extra = 0
    fields = ['step_number', 'title', 'status', 'completion_date']
    ordering = ['step_number']


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
    inlines = [CustodyStepInline]
    
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


@admin.register(CustodyStep)
class CustodyStepAdmin(admin.ModelAdmin):
    """Admin interface for CustodyStep model."""
    
    list_display = [
        'consignment_short', 'step_number', 'title', 'status', 'completion_date'
    ]
    list_filter = ['status', 'step_number', 'created_at']
    search_fields = ['consignment__consignment_number', 'title', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['consignment', 'step_number']
    
    fieldsets = (
        ('Step Information', {
            'fields': ('consignment', 'step_number', 'title', 'description')
        }),
        ('Evidence & Status', {
            'fields': ('evidence_description', 'status', 'completion_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def consignment_short(self, obj):
        return f"{obj.consignment.consignment_number} - Step {obj.step_number}"
    consignment_short.short_description = 'Consignment'
