"""Add 'monthly_safekeeping' to ServiceCharge.charge_type choices."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('valuations', '0003_servicecharge_status_alter_servicecharge_amount_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='servicecharge',
            name='charge_type',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('storage', 'Storage Fee'),
                    ('transportation', 'Transportation Fee'),
                    ('handling', 'Handling Fee'),
                    ('insurance', 'Insurance Fee'),
                    ('monthly_safekeeping', 'Monthly Safekeeping Fee'),
                    ('demurrage', 'Demurrage'),
                    ('other', 'Other Charges'),
                ],
            ),
        ),
    ]
