from django.db import models
from django.conf import settings
from django.utils import timezone
import random
import string


def generate_client_number():
    """Generate unique client number."""
    prefix = 'CL'
    year = timezone.now().year
    random_digits = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}-{year}-{random_digits}"


class Client(models.Model):
    """Client model for customers using the consignment service."""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_profile'
    )
    client_number = models.CharField(max_length=20, unique=True, default=generate_client_number)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='United States')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'clients'
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.client_number} - {self.user.get_full_name()}"
    
    @property
    def full_name(self):
        return self.user.get_full_name()
    
    @property
    def email(self):
        return self.user.email
