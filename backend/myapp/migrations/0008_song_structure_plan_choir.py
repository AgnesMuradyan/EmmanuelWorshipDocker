from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0007_auto_20260627_1146'),
    ]

    operations = [
        migrations.AddField(
            model_name='song',
            name='structure',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='plan',
            name='choir',
            field=models.ManyToManyField(blank=True, related_name='choir_plans', to='myapp.Singer'),
        ),
    ]
