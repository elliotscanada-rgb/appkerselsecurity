from django.contrib import admin
from .models import CustodyRecord

@admin.register(CustodyRecord)
class CustodyRecordAdmin(admin.ModelAdmin):
    list_display = ['consignment', 'new_custodian', 'new_location', 'transfer_date']
