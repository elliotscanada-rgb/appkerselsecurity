from django.db import models
from django.conf import settings
from django.utils import timezone
import random
import string


def generate_staff_number():
    """Generate unique staff number."""
    prefix = 'ST'
    year = timezone.now().year
    random_digits = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}-{year}-{random_digits}"


class Staff(models.Model):
    """Staff model for employees handling operations."""
    
    DEPARTMENT_CHOICES = [
        ('receiving', 'Receiving'),
        ('custody', 'Custody'),
        ('logistics', 'Logistics'),
        ('valuation', 'Valuation'),
        ('dispatch', 'Dispatch'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='staff_profile'
    )
    staff_number = models.CharField(max_length=20, unique=True, default=generate_staff_number)
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
    phone = models.CharField(max_length=20, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'staff'
        verbose_name = 'Staff Member'
        verbose_name_plural = 'Staff Members'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.staff_number} - {self.user.get_full_name()} ({self.get_department_display()})"
    
    @property
    def full_name(self):
        return self.user.get_full_name()
    
    @property
    def email(self):
        return self.user.email
