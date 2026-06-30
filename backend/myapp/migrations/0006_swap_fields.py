from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0005_migrate_lead_singers_data'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='plan',
            name='lead_singers',
        ),
        migrations.RenameField(
            model_name='plan',
            old_name='lead_singers_tmp',
            new_name='lead_singers',
        ),
    ]
