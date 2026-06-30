from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0006_swap_fields'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='musician',
            options={'ordering': ['first_name', 'last_name']},
        ),
        migrations.AlterModelOptions(
            name='singer',
            options={'ordering': ['first_name', 'last_name']},
        ),
        migrations.AlterField(
            model_name='plan',
            name='lead_singers',
            field=models.ManyToManyField(blank=True, related_name='lead_plans', through='myapp.PlanLeadSinger', to='myapp.Singer'),
        ),
        migrations.AlterField(
            model_name='plan',
            name='musicians',
            field=models.ManyToManyField(blank=True, related_name='plans', to='myapp.Musician'),
        ),
        migrations.AlterField(
            model_name='plan',
            name='singers',
            field=models.ManyToManyField(blank=True, related_name='plans', to='myapp.Singer'),
        ),
        migrations.AlterField(
            model_name='plan',
            name='songs',
            field=models.ManyToManyField(blank=True, related_name='plans', through='myapp.PlanSong', to='myapp.Song'),
        ),
    ]
