from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver
from .models import Plan


@receiver(m2m_changed, sender=Plan.songs.through)
def create_powerpoint(sender, instance, **kwargs):
    if kwargs['action'] == 'post_add':
        print(f"Signal received for Plan ID: {instance.id}")
        instance.concatenated_powerpoint = instance.create_concatenated_powerpoint()
        instance.save(update_fields=['concatenated_powerpoint'])
        print(f"Updated concatenated PowerPoint for Plan ID: {instance.id}")
