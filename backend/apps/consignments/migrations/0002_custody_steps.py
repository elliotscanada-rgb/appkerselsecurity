# Generated migration for CustodyStep model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('consignments', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustodyStep',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('step_number', models.IntegerField()),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('evidence_description', models.TextField()),
                ('status', models.CharField(choices=[('completed', 'Recorded'), ('evidence_required', 'Evidence required'), ('not_established', 'Not established'), ('pending', 'Pending')], default='not_established', max_length=30)),
                ('completion_date', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('consignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='custody_steps', to='consignments.consignment')),
            ],
            options={
                'verbose_name': 'Custody Step',
                'verbose_name_plural': 'Custody Steps',
                'db_table': 'custody_steps',
            },
        ),
        migrations.AddConstraint(
            model_name='custodystep',
            constraint=models.UniqueConstraint(fields=('consignment', 'step_number'), name='unique_consignment_step'),
        ),
        migrations.AlterModelOptions(
            name='custodystep',
            options={'ordering': ['step_number'], 'verbose_name': 'Custody Step', 'verbose_name_plural': 'Custody Steps'},
        ),
    ]
