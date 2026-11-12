from django.db import models

class CustodyRecord(models.Model):
    consignment = models.ForeignKey('consignments.Consignment', on_delete=models.CASCADE)
    previous_custodian = models.ForeignKey('staff.Staff', on_delete=models.SET_NULL, null=True, related_name='custody_from')
    new_custodian = models.ForeignKey('staff.Staff', on_delete=models.SET_NULL, null=True, related_name='custody_to')
    previous_location = models.CharField(max_length=200)
    new_location = models.CharField(max_length=200)
    transfer_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'custody_records'
        ordering = ['-created_at']
