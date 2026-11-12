from django.db import models
from django.conf import settings


class Valuation(models.Model):
    """Valuation model for assessing consignment values."""
    
    APPROVAL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    consignment = models.ForeignKey('consignments.Consignment', on_delete=models.CASCADE, related_name='valuations')
    assessed_value = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    valuation_method = models.CharField(max_length=200, blank=True)
    valuation_date = models.DateField(auto_now_add=True)
    
    valued_by = models.ForeignKey('staff.Staff', on_delete=models.SET_NULL, null=True, related_name='valuations_created')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='valuations_approved')
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='pending')
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'valuations'
        verbose_name = 'Valuation'
        verbose_name_plural = 'Valuations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Valuation for {self.consignment.consignment_number}"


class ServiceCharge(models.Model):
    """Service charges associated with consignments."""
    
    CHARGE_TYPE_CHOICES = [
        ('storage', 'Storage Fee'),
        ('transportation', 'Transportation Fee'),
        ('handling', 'Handling Fee'),
        ('insurance', 'Insurance Fee'),
        ('other', 'Other Charges'),
    ]
    
    consignment = models.ForeignKey('consignments.Consignment', on_delete=models.CASCADE, related_name='service_charges')
    charge_type = models.CharField(max_length=20, choices=CHARGE_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    description = models.TextField(blank=True)
    
    charged_by = models.ForeignKey('staff.Staff', on_delete=models.SET_NULL, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'service_charges'
        verbose_name = 'Service Charge'
        verbose_name_plural = 'Service Charges'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_charge_type_display()} - {self.consignment.consignment_number}"


class ChargeRemovalReason(models.Model):
    """Record when charges are removed/cleared with reason."""
    
    REMOVAL_REASON_CHOICES = [
        ('paid', 'Charge Paid'),
        ('cleared', 'Charge Cleared'),
        ('waived', 'Charge Waived'),
        ('error', 'Incorrect Charge'),
        ('other', 'Other Reason'),
    ]
    
    charge = models.ForeignKey(ServiceCharge, on_delete=models.CASCADE, related_name='removal_records')
    reason = models.CharField(max_length=20, choices=REMOVAL_REASON_CHOICES)
    notes = models.TextField(blank=True)
    removed_by = models.ForeignKey('staff.Staff', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'charge_removal_reasons'
        verbose_name = 'Charge Removal Reason'
        verbose_name_plural = 'Charge Removal Reasons'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Charge removed: {self.get_reason_display()} - {self.charge.consignment.consignment_number}"
