from django.db import migrations

def forwards(apps, schema_editor):
    Plan = apps.get_model('myapp', 'Plan')
    PlanLeadSinger = apps.get_model('myapp', 'PlanLeadSinger')
    for plan in Plan.objects.all():
        singers = plan.lead_singers.all().order_by('pk')
        for idx, s in enumerate(singers, start=1):
            PlanLeadSinger.objects.get_or_create(
                plan=plan, singer=s, defaults={'order': idx}
            )

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0004_add_temp_lead_field'),
    ]
    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop)
    ]
