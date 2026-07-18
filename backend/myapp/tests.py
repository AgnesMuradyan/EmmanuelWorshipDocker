from django.test import TestCase
from django.test import override_settings
from unittest.mock import patch
from rest_framework.test import APIClient

from .models import Album, Musician, Plan, PlanLeadSinger, PlanSong, Singer, Song
from .serializers import PlanSerializer
from .telegram import send_telegram_message


class PlanSerializerTests(TestCase):
    def setUp(self):
        self.album = Album.objects.create(title="Worship")
        self.song_one = Song.objects.create(title="Alpha", album=self.album)
        self.song_two = Song.objects.create(title="Beta", album=self.album)
        self.lead_one = Singer.objects.create(first_name="Anna", last_name="Lead", role=Singer.SOLOIST)
        self.lead_two = Singer.objects.create(first_name="Mariam", last_name="Lead", role=Singer.SOLOIST)
        self.singer = Singer.objects.create(first_name="Choir", last_name="Voice", role=Singer.CHOIR)
        self.musician = Musician.objects.create(first_name="David", last_name="Keys")

    def test_create_plan_stores_ordered_songs_and_lead_singers(self):
        serializer = PlanSerializer(
            data={
                "date": "2026-07-05",
                "day_type": Plan.SUNDAY,
                "lead_singers": [self.lead_two.id, self.lead_one.id],
                "singers": [self.singer.id],
                "musicians": [self.musician.id],
                "plansong_set": [
                    {"song_id": self.song_two.id, "order": 1},
                    {"song_id": self.song_one.id, "order": 2},
                ],
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        plan = serializer.save()

        self.assertEqual(list(plan.singers.values_list("id", flat=True)), [self.singer.id])
        self.assertEqual(list(plan.musicians.values_list("id", flat=True)), [self.musician.id])
        self.assertEqual(
            list(PlanLeadSinger.objects.filter(plan=plan).values_list("singer_id", "order")),
            [(self.lead_two.id, 1), (self.lead_one.id, 2)],
        )
        self.assertEqual(
            list(PlanSong.objects.filter(plan=plan).values_list("song_id", "order")),
            [(self.song_two.id, 1), (self.song_one.id, 2)],
        )

    def test_representation_contains_expanded_relationships(self):
        plan = Plan.objects.create(date="2026-07-05", day_type=Plan.SUNDAY)
        PlanLeadSinger.objects.create(plan=plan, singer=self.lead_one, order=1)
        PlanSong.objects.create(plan=plan, song=self.song_one, order=1)
        plan.singers.set([self.singer])
        plan.musicians.set([self.musician])

        data = PlanSerializer(plan).data

        self.assertEqual(data["lead_singers"][0]["id"], self.lead_one.id)
        self.assertEqual(data["lead_singers_ordered"][0]["singer_id"], self.lead_one.id)
        self.assertEqual(data["songs"][0]["song_id"], self.song_one.id)
        self.assertFalse(data["concatenated_powerpoint"])


class SongChoicesApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        album = Album.objects.create(title="Worship")
        Song.objects.create(title="Beta Song", album=album)
        Song.objects.create(title="Alpha Song", album=album)

    def test_song_choices_are_paginated_and_ordered_by_title(self):
        response = self.client.get("/api/songs/choices/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(
            [song["title"] for song in response.data["results"]],
            ["Alpha Song", "Beta Song"],
        )

    def test_song_choices_support_search(self):
        response = self.client.get("/api/songs/choices/", {"search": "Beta"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Beta Song")


class TelegramNotificationTests(TestCase):
    @override_settings(
        TELEGRAM_BOT_TOKEN="token",
        TELEGRAM_CHANNEL_ID="@channel",
        TELEGRAM_NOTIFICATIONS_ENABLED=True,
    )
    @patch("myapp.telegram.httpx.post")
    def test_send_telegram_message_posts_to_bot_api(self, post):
        post.return_value.raise_for_status.return_value = None

        self.assertTrue(send_telegram_message("Song changed"))

        post.assert_called_once_with(
            "https://api.telegram.org/bottoken/sendMessage",
            json={
                "chat_id": "@channel",
                "text": "Song changed",
                "disable_web_page_preview": True,
            },
            timeout=5,
        )

    @override_settings(TELEGRAM_BOT_TOKEN="", TELEGRAM_CHANNEL_ID="", TELEGRAM_NOTIFICATIONS_ENABLED=True)
    @patch("myapp.telegram.httpx.post")
    def test_send_telegram_message_skips_without_configuration(self, post):
        self.assertFalse(send_telegram_message("Song changed"))
        post.assert_not_called()

    @override_settings(
        TELEGRAM_BOT_TOKEN="token",
        TELEGRAM_CHANNEL_ID="@channel",
        TELEGRAM_NOTIFICATIONS_ENABLED=True,
    )
    @patch("myapp.signals.send_telegram_message")
    def test_model_save_sends_change_notification_after_commit(self, send_message):
        with self.captureOnCommitCallbacks(execute=True):
            Album.objects.create(title="Worship")

        self.assertEqual(send_message.call_count, 1)
        message = send_message.call_args.args[0]
        self.assertIn("Added: Album", message)
        self.assertIn("Object: Worship", message)
