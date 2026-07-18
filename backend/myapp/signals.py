from django.db import transaction
from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from .middleware import get_current_user
from .models import Album, Instrument, Musician, MusicianInstrument, Plan, PlanLeadSinger, PlanSong, Singer, Song
from .telegram import send_telegram_message


TRACKED_MODELS = (Album, Song, Instrument, Musician, MusicianInstrument, Singer, Plan, PlanSong, PlanLeadSinger)


def _user_label():
    user = get_current_user()
    if user and getattr(user, "is_authenticated", False):
        full_name = user.get_full_name()
        return full_name or user.get_username()
    return "Anonymous user"


def _model_label(instance):
    return instance._meta.verbose_name.title()


def _object_label(instance):
    try:
        value = str(instance)
    except Exception:
        value = f"ID {instance.pk}"
    return value or f"ID {instance.pk}"


def _notify(action, instance):
    message = "\n".join(
        [
            f"{action}: {_model_label(instance)}",
            f"Object: {_object_label(instance)}",
            f"By: {_user_label()}",
        ]
    )
    transaction.on_commit(lambda: send_telegram_message(message))


@receiver(post_save)
def notify_model_saved(sender, instance, created, update_fields=None, **kwargs):
    if sender not in TRACKED_MODELS:
        return
    if sender is Plan and update_fields and set(update_fields) == {"concatenated_powerpoint"}:
        return

    _notify("Added" if created else "Changed", instance)


@receiver(post_delete)
def notify_model_deleted(sender, instance, **kwargs):
    if sender not in TRACKED_MODELS:
        return

    _notify("Deleted", instance)


@receiver(m2m_changed, sender=Plan.singers.through)
@receiver(m2m_changed, sender=Plan.choir.through)
@receiver(m2m_changed, sender=Plan.musicians.through)
def notify_plan_m2m_changed(sender, instance, action, pk_set, **kwargs):
    if action not in {"post_add", "post_remove", "post_clear"}:
        return

    relation_name = {
        Plan.singers.through: "singers",
        Plan.choir.through: "choir",
        Plan.musicians.through: "musicians",
    }.get(sender, "members")

    action_label = {
        "post_add": "Added",
        "post_remove": "Deleted",
        "post_clear": "Deleted",
    }[action]
    count = len(pk_set) if pk_set else "all"
    message = "\n".join(
        [
            f"{action_label}: Plan {relation_name}",
            f"Object: {instance}",
            f"Count: {count}",
            f"By: {_user_label()}",
        ]
    )
    transaction.on_commit(lambda: send_telegram_message(message))


@receiver(m2m_changed, sender=Plan.songs.through)
def create_powerpoint(sender, instance, **kwargs):
    if kwargs["action"] == "post_add":
        print(f"Signal received for Plan ID: {instance.id}")
        instance.concatenated_powerpoint = instance.create_concatenated_powerpoint()
        instance.save(update_fields=["concatenated_powerpoint"])
        print(f"Updated concatenated PowerPoint for Plan ID: {instance.id}")
