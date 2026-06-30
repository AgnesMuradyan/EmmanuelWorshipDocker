from django.db import migrations, models
import django.db.models.constraints


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='plansong',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='plansong',
            constraint=models.UniqueConstraint(deferrable=django.db.models.constraints.Deferrable['DEFERRED'], fields=('plan', 'order'), name='uniq_plan_order'),
        ),
        migrations.AddConstraint(
            model_name='plansong',
            constraint=models.UniqueConstraint(fields=('plan', 'song'), name='uniq_plan_song'),
        ),
    ]
