# myapp/views_share.py
import re
from django.http import HttpResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.utils.html import escape
from .models import Song

BOTS = ("facebookexternalhit","facebot","twitterbot","slackbot","slackbot-linkexpanding",
        "telegrambot","discordbot","linkedinbot","pinterestbot","whatsapp","vkshare","skypeuripreview")

def _is_bot(req):
    ua = (req.META.get("HTTP_USER_AGENT") or "").lower()
    return any(s in ua for s in BOTS)

def _desc(txt, limit=200):
    return escape(re.sub(r"\s+", " ", (txt or "")).strip()[:limit])

def song_share(request, pk: int):
    if not _is_bot(request):
        return render(request, "index.html")

    song = Song.objects.filter(pk=pk).first()

    # Build canonical URL with the **frontend** host if forwarded
    fwd_host  = request.META.get("HTTP_X_FORWARDED_HOST") or request.META.get("HTTP_X_ORIGINAL_HOST")
    fwd_proto = request.META.get("HTTP_X_FORWARDED_PROTO") or request.scheme
    host      = fwd_host or request.get_host()
    canonical = f"{fwd_proto}://{host}{request.path}"

    site_name = host  # shows as the small line under the title (e.g., emmanuelworship.church)
    img = f"{fwd_proto}://{host}/static/img/share-default.jpg"

    if song:
        title = song.title                         # <-- title ONLY
        desc  = _desc(song.verse)
    else:
        title = "Song not found"
        desc  = "This song may have been removed or the link is incorrect."

    html = f"""<!doctype html><html><head>
      <meta charset="utf-8" />
      <title>{escape(title)}</title>

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="{escape(site_name)}" />
      <meta property="og:title" content="{escape(title)}" />
      <meta property="og:description" content="{desc}" />
      <meta property="og:url" content="{escape(canonical)}" />
      <meta property="og:image" content="{escape(img)}" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="{escape(title)}" />
      <meta name="twitter:description" content="{desc}" />
      <meta name="twitter:image" content="{escape(img)}" />
      <link rel="canonical" href="{escape(canonical)}" />
    </head><body></body></html>"""
    resp = HttpResponse(html, status=200)
    resp["X-Share-View"] = "song"
    return resp
