from django.db import models
from django.conf import settings

class Document(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('receipt', 'Consignment Receipt'),
        ('valuation_certificate', 'Valuation Certificate'),
        ('agreement', 'Consignment Agreement'),
        ('delivery_confirmation', 'Delivery Confirmation'),
        ('other', 'Other Document'),
    ]
    
    consignment = models.ForeignKey('consignments.Consignment', on_delete=models.CASCADE)
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPE_CHOICES)
    file_name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='documents/%Y/%m/')
    file_size = models.IntegerField()
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'documents'
        ordering = ['-upload_date']
