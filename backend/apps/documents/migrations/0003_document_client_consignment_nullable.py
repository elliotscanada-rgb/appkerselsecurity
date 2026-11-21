# Migration: make consignment nullable, add optional client FK,
# and expand document_type choices.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0001_initial'),
        ('consignments', '0001_initial'),
        ('documents', '0002_add_description_to_document'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Make consignment nullable so a document can exist without one
        migrations.AlterField(
            model_name='document',
            name='consignment',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='documents',
                to='consignments.consignment',
            ),
        ),
        # Add direct client FK
        migrations.AddField(
            model_name='document',
            name='client',
            field=models.ForeignKey(
                blank=True,
                help_text='Direct client document (not tied to a specific consignment)',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='documents',
                to='clients.client',
            ),
        ),
        # Expand document_type choices
        migrations.AlterField(
            model_name='document',
            name='document_type',
            field=models.CharField(
                choices=[
                    ('receipt', 'Consignment Receipt'),
                    ('valuation_certificate', 'Valuation Certificate'),
                    ('agreement', 'Consignment Agreement'),
                    ('delivery_confirmation', 'Delivery Confirmation'),
                    ('identity', 'Identity Document'),
                    ('insurance', 'Insurance Document'),
                    ('customs', 'Customs / Export Document'),
                    ('other', 'Other Document'),
                ],
                max_length=30,
            ),
        ),
    ]
