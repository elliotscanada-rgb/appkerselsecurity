from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import random
import string


def generate_shipment_number():
    """Generate a unique shipment number."""
    prefix = 'SHP'
    year = timezone.now().year
    random_digits = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}-{year}-{random_digits}"


class ShipmentLocation(models.Model):
    """Track GPS coordinates and locations for shipments in transit."""
    
    LOCATION_TYPE_CHOICES = [
        ('origin', 'Origin'),
        ('current', 'Current Location'),
        ('destination', 'Destination'),
        ('checkpoint', 'Checkpoint'),
    ]
    
    shipment = models.ForeignKey(
        'Shipment', on_delete=models.CASCADE, related_name='location_history'
    )
    location_type = models.CharField(max_length=20, choices=LOCATION_TYPE_CHOICES)
    latitude = models.DecimalField(
        max_digits=11, decimal_places=8,
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = models.DecimalField(
        max_digits=11, decimal_places=8,
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    recorded_at = models.DateTimeField(default=timezone.now)
    recorded_by = models.ForeignKey(
        'staff.Staff', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='location_updates'
    )
    
    class Meta:
        db_table = 'shipment_locations'
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"{self.shipment.shipment_number} - {self.get_location_type_display()} at {self.recorded_at}"


class Shipment(models.Model):
    """Shipment model for tracking valuable items in transit."""
    
    STATUS_CHOICES = [
        ('preparing', 'Preparing'),
        ('dispatched', 'Dispatched'),
        ('in_transit', 'In Transit'),
        ('arrived', 'Arrived'),
        ('delivered', 'Delivered'),
    ]
    
    TRANSPORT_MODE_CHOICES = [
        ('land', 'Land Transport'),
        ('air', 'Air Transport'),
        ('sea', 'Sea Transport'),
        ('rail', 'Rail Transport'),
    ]

    shipment_number = models.CharField(
        max_length=20, unique=True, default=generate_shipment_number
    )
    consignment = models.ForeignKey(
        'consignments.Consignment', on_delete=models.CASCADE, related_name='shipments'
    )
    
    # Routing Information
    origin = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    transport_mode = models.CharField(
        max_length=20, choices=TRANSPORT_MODE_CHOICES, default='air'
    )
    container_number = models.CharField(max_length=50, blank=True)
    
    # Dates
    dispatch_date = models.DateField(null=True, blank=True)
    expected_arrival_date = models.DateField(null=True, blank=True)
    actual_arrival_date = models.DateField(null=True, blank=True)
    
    # Assignments
    assigned_to = models.ForeignKey(
        'staff.Staff', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_shipments'
    )
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='preparing')
    current_location = models.CharField(max_length=200, blank=True)
    
    # Notes and timestamps
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shipments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['shipment_number']),
            models.Index(fields=['status']),
            models.Index(fields=['consignment']),
        ]

    def __str__(self):
        return self.shipment_number
    
    @property
    def latest_location(self):
        """Get the most recent location update."""
        return self.location_history.filter(
            location_type='current'
        ).first()
    
    @property
    def origin_location(self):
        """Get origin location."""
        return self.location_history.filter(
            location_type='origin'
        ).first()
    
    @property
    def destination_location(self):
        """Get destination location."""
        return self.location_history.filter(
            location_type='destination'
        ).first()
