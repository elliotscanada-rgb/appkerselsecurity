from django.contrib import admin
from .models import Shipment, ShipmentLocation


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ['shipment_number', 'consignment', 'origin', 'destination', 'status', 'transport_mode', 'created_at']
    list_filter = ['status', 'transport_mode', 'created_at']
    search_fields = ['shipment_number', 'consignment__consignment_number', 'origin', 'destination']
    readonly_fields = ['shipment_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Shipment Information', {
            'fields': ('shipment_number', 'consignment', 'status')
        }),
        ('Routing', {
            'fields': ('origin', 'destination', 'current_location', 'transport_mode', 'container_number')
        }),
        ('Dates', {
            'fields': ('dispatch_date', 'expected_arrival_date', 'actual_arrival_date')
        }),
        ('Assignment & Notes', {
            'fields': ('assigned_to', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ShipmentLocation)
class ShipmentLocationAdmin(admin.ModelAdmin):
    list_display = ['shipment', 'location_type', 'city', 'country', 'recorded_at']
    list_filter = ['location_type', 'recorded_at']
    search_fields = ['shipment__shipment_number', 'address', 'city', 'country']
    readonly_fields = ['recorded_at']
    
    fieldsets = (
        ('Shipment', {
            'fields': ('shipment', 'location_type')
        }),
        ('Coordinates', {
            'fields': ('latitude', 'longitude')
        }),
        ('Location', {
            'fields': ('address', 'city', 'country')
        }),
        ('Recording', {
            'fields': ('recorded_at', 'recorded_by')
        }),
    )
