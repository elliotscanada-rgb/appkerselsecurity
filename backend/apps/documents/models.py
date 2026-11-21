from django.db import models
from django.conf import settings


class Document(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('receipt', 'Consignment Receipt'),
        ('valuation_certificate', 'Valuation Certificate'),
        ('agreement', 'Consignment Agreement'),
        ('delivery_confirmation', 'Delivery Confirmation'),
        ('identity', 'Identity Document'),
        ('insurance', 'Insurance Document'),
        ('customs', 'Customs / Export Document'),
        ('other', 'Other Document'),
    ]

    # A document can belong to a consignment OR directly to a client
    consignment = models.ForeignKey(
        'consignments.Consignment',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='documents',
    )
    client = models.ForeignKey(
        'clients.Client',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='documents',
        help_text='Direct client document (not tied to a specific consignment)',
    )

    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPE_CHOICES)
    description = models.TextField(blank=True, help_text='Description of the document')
    file_name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='documents/%Y/%m/')
    file_size = models.IntegerField()
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    upload_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-upload_date']

    def __str__(self):
        if self.consignment:
            return f"{self.file_name} — {self.consignment.consignment_number}"
        if self.client:
            return f"{self.file_name} — {self.client.client_number}"
        return self.file_name
