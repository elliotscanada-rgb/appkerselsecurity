from django.db import models
from django.utils import timezone
import random
import string


def generate_consignment_number():
    """Generate unique consignment number."""
    prefix = 'KSL'
    year = timezone.now().year
    random_digits = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}-{year}-{random_digits}"


class ConsignmentHistory(models.Model):
    """Track all status changes and events for a consignment."""
    
    EVENT_TYPES = [
        ('created', 'Created'),
        ('status_change', 'Status Changed'),
        ('received', 'Received'),
        ('verification_started', 'Verification Started'),
        ('verification_completed', 'Verification Completed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('stored', 'Moved to Storage'),
        ('on_hold', 'Put On Hold'),
        ('withdrawal_requested', 'Withdrawal Requested'),
        ('released', 'Released'),
        ('in_transit', 'In Transit'),
        ('completed', 'Completed'),
        ('note_added', 'Note Added'),
    ]
    
    consignment = models.ForeignKey('Consignment', on_delete=models.CASCADE, related_name='history')
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    previous_status = models.CharField(max_length=30, blank=True)
    new_status = models.CharField(max_length=30, blank=True)
    description = models.TextField(blank=True)
    performed_by = models.ForeignKey('staff.Staff', on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'consignment_history'
        ordering = ['-timestamp']
        verbose_name = 'Consignment History'
        verbose_name_plural = 'Consignment Histories'
    
    def __str__(self):
        return f"{self.consignment.consignment_number} - {self.get_event_type_display()} at {self.timestamp}"


class Consignment(models.Model):
    """Consignment model for tracking valuable items."""
    
    CATEGORY_CHOICES = [
        ('gold_bars', 'Gold Bars'),
        ('gold_jewellery', 'Gold Jewellery'),
        ('precious_metals', 'Precious Metals'),
        ('diamonds', 'Diamonds & Gemstones'),
        ('other', 'Other Valuables'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('received', 'Received'),
        ('under_verification', 'Under Verification'),
        ('verification_passed', 'Verification Passed'),
        ('verification_failed', 'Verification Failed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('in_secure_storage', 'In Secure Storage'),
        ('on_hold', 'On Hold'),
        ('withdrawal_requested', 'Withdrawal Requested'),
        ('released', 'Released'),
        ('in_transit', 'In Transit'),
        ('completed', 'Completed'),
    ]
    
    WEIGHT_UNIT_CHOICES = [
        ('kg', 'Kilograms'),
        ('g', 'Grams'),
        ('oz', 'Ounces'),
        ('t', 'Tonnes'),
    ]
    
    # Basic Information
    consignment_number = models.CharField(max_length=20, unique=True, default=generate_consignment_number)
    client = models.ForeignKey('clients.Client', on_delete=models.PROTECT, related_name='consignments')
    
    # Item Details
    item_name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    quantity = models.IntegerField(default=1)
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    weight_unit = models.CharField(max_length=5, choices=WEIGHT_UNIT_CHOICES, default='kg')
    purity = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text='Purity percentage')
    
    # Valuation
    declared_value = models.DecimalField(max_digits=15, decimal_places=2)
    declared_value_currency = models.CharField(max_length=3, default='USD')
    
    # Asset Image
    image = models.ImageField(upload_to='consignments/', null=True, blank=True, help_text='Asset photograph')
    
    # Status and Location
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    current_location = models.CharField(max_length=200, blank=True)
    
    # Staff Assignment
    received_by = models.ForeignKey('staff.Staff', on_delete=models.SET_NULL, null=True, blank=True, related_name='received_consignments')
    received_date = models.DateTimeField(default=timezone.now)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'consignments'
        verbose_name = 'Consignment'
        verbose_name_plural = 'Consignments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['consignment_number']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.consignment_number} - {self.item_name}"
    
    @property
    def client_name(self):
        return self.client.full_name
    
    @property
    def client_email(self):
        return self.client.email
    
    def add_history_event(self, event_type, description='', performed_by=None, previous_status='', new_status=''):
        """Helper method to create a history entry."""
        return ConsignmentHistory.objects.create(
            consignment=self,
            event_type=event_type,
            previous_status=previous_status,
            new_status=new_status,
            description=description,
            performed_by=performed_by
        )
    
    def save(self, *args, **kwargs):
        """Override save to automatically create history entries on status change."""
        is_new = self.pk is None
        old_status = None
        
        if not is_new:
            try:
                old = Consignment.objects.get(pk=self.pk)
                old_status = old.status
            except Consignment.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
        
        # Create history entry
        if is_new:
            self.add_history_event(
                event_type='created',
                description=f'Consignment {self.consignment_number} created',
                new_status=self.status
            )
        elif old_status and old_status != self.status:
            self.add_history_event(
                event_type='status_change',
                description=f'Status changed from {old_status} to {self.status}',
                previous_status=old_status,
                new_status=self.status
            )
