# 0004_add_temp_lead_field.py
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0003_auto_20250823_0035'),
    ]

    operations = [
        migrations.AddField(
            model_name='plan',
            name='lead_singers_tmp',
            field=models.ManyToManyField(
                to='myapp.Singer',
                through='myapp.PlanLeadSinger',
                related_name='+',  # no reverse name; temporary
                blank=True,
            ),
        ),
    ]
