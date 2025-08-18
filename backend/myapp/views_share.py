# myapp/views_share.py
import re
from django.http import HttpResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.utils.html import escape
from .models import Song

BOT_UA = ("facebookexternalhit","twitterbot","slackbot",
          "whatsapp","telegrambot","discordbot","linkedinbot","vkshare")

def _desc_from_verse(verse: str | None, limit: int = 200) -> str:
    raw = verse or ""
    # collapse whitespace/newlines/tabs
    flat = re.sub(r"\s+", " ", raw).strip()
    # hard limit (OG recommend ~200 chars)
    flat = flat[:limit]
    # escape &, <, >, " so meta content stays valid
    return escape(flat)

def song_share(request, pk: int):
    ua = (request.META.get("HTTP_USER_AGENT") or "").lower()
    is_bot = any(s in ua for s in BOT_UA)

    if not is_bot:
        return render(request, "index.html")

    song = Song.objects.filter(pk=pk).first()
    url  = request.build_absolute_uri()
    img  = request.build_absolute_uri(static("img/share-default.jpg"))

    if song:
        title = f"{song.title} – EmmanuelWorship"
        desc  = _desc_from_verse(song.verse)
    else:
        title = "Song not found – EmmanuelWorship"
        desc  = "This song may have been removed or the link is incorrect."

    html = f"""<!doctype html><html><head>
      <meta charset="utf-8" />
      <title>{escape(title)}</title>

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="EmmanuelWorship" />
      <meta property="og:title" content="{escape(title)}" />
      <meta property="og:description" content="{desc}" />
      <meta property="og:url" content="{escape(url)}" />
      <meta property="og:image" content="{escape(img)}" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="{escape(title)}" />
      <meta name="twitter:description" content="{desc}" />
      <meta name="twitter:image" content="{escape(img)}" />
    </head><body></body></html>"""
    return HttpResponse(html, status=200)
