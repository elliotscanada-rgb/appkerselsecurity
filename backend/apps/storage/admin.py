from django.contrib import admin
from .models import StorageFacility, StorageUnit

@admin.register(StorageFacility)
class StorageFacilityAdmin(admin.ModelAdmin):
    list_display = ['facility_name', 'location', 'capacity']

@admin.register(StorageUnit)
class StorageUnitAdmin(admin.ModelAdmin):
    list_display = ['unit_name', 'facility', 'capacity', 'current_occupancy']
