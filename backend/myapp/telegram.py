import logging

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


def send_telegram_message(text):
    token = getattr(settings, "TELEGRAM_BOT_TOKEN", "")
    channel_id = getattr(settings, "TELEGRAM_CHANNEL_ID", "")
    enabled = getattr(settings, "TELEGRAM_NOTIFICATIONS_ENABLED", True)

    if not enabled or not token or not channel_id:
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": channel_id,
        "text": text,
        "disable_web_page_preview": True,
    }

    try:
        response = httpx.post(url, json=payload, timeout=5)
        response.raise_for_status()
    except httpx.HTTPError:
        logger.exception("Failed to send Telegram notification")
        return False

    return True
