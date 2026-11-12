from django.contrib import admin
from .models import Valuation, ServiceCharge

@admin.register(Valuation)
class ValuationAdmin(admin.ModelAdmin):
    list_display = ['consignment', 'assessed_value', 'currency', 'approval_status', 'valuation_date']
    list_filter = ['approval_status', 'valuation_date']
    search_fields = ['consignment__consignment_number']

@admin.register(ServiceCharge)
class ServiceChargeAdmin(admin.ModelAdmin):
    list_display = ['consignment', 'charge_type', 'amount', 'currency', 'created_at']
    list_filter = ['charge_type', 'created_at']
