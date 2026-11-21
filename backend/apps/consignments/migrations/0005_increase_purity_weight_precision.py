# Migration: increase purity to 3 decimal places (supports 99.999%)
# and weight to 3 decimal places (supports e.g. 78.000 kg)
# Also update GoldSettings purity fields to match the new scale (0-100%)

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('consignments', '0004_goldsettings'),
    ]

    operations = [
        # Consignment.purity: 3 dp, range 0-100
        migrations.AlterField(
            model_name='consignment',
            name='purity',
            field=models.DecimalField(
                blank=True,
                decimal_places=3,
                help_text='Purity percentage (e.g. 99.999)',
                max_digits=8,
                null=True,
            ),
        ),
        # Consignment.weight: 3 dp
        migrations.AlterField(
            model_name='consignment',
            name='weight',
            field=models.DecimalField(
                blank=True,
                decimal_places=3,
                max_digits=10,
                null=True,
            ),
        ),
        # GoldSettings.purity_min: 3 dp, 0-100%
        migrations.AlterField(
            model_name='goldsettings',
            name='purity_min',
            field=models.DecimalField(
                decimal_places=3,
                default=0,
                help_text='Minimum acceptable purity % (0-100)',
                max_digits=8,
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(100),
                ],
            ),
        ),
        # GoldSettings.purity_max: 3 dp, 0-100%
        migrations.AlterField(
            model_name='goldsettings',
            name='purity_max',
            field=models.DecimalField(
                decimal_places=3,
                default=100,
                help_text='Maximum acceptable purity % (0-100)',
                max_digits=8,
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(100),
                ],
            ),
        ),
    ]
