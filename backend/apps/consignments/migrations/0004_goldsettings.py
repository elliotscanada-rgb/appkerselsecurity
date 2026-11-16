# Generated migration for GoldSettings model

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('consignments', '0003_remove_custodystep_unique_consignment_step_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='GoldSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('purity_min', models.DecimalField(decimal_places=2, default=0, help_text='Minimum acceptable purity (0-1000‰)', max_digits=6, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(1000)])),
                ('purity_max', models.DecimalField(decimal_places=2, default=1000, help_text='Maximum acceptable purity (0-1000‰)', max_digits=6, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(1000)])),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Gold Settings',
                'verbose_name_plural': 'Gold Settings',
                'db_table': 'gold_settings',
            },
        ),
    ]
