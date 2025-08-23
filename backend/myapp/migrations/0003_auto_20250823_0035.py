# 0003_create_planleadsinger.py
from django.db import migrations, models
import django.db.models.deletion
from django.db.models import UniqueConstraint
from django.db.models.constraints import Deferrable

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0002_auto_20250823_0010'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlanLeadSinger',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False, auto_created=True, verbose_name='ID')),
                ('order', models.PositiveIntegerField()),
                ('plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.plan')),
                ('singer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.singer')),
            ],
            options={'ordering': ['order']},
        ),
        migrations.AddConstraint(
            model_name='planleadsinger',
            constraint=UniqueConstraint(
                fields=('plan', 'order'),
                name='uniq_plan_lead_order',
                deferrable=Deferrable.DEFERRED,
            ),
        ),
        migrations.AddConstraint(
            model_name='planleadsinger',
            constraint=UniqueConstraint(
                fields=('plan', 'singer'),
                name='uniq_plan_lead_singer',
            ),
        ),
    ]
