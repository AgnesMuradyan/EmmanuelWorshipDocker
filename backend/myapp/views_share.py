# add/keep your imports
import re
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils.html import escape
from django.templatetags.static import static
from .models import Song, Plan  # adjust if your app naming differs

BOTS = (
    "facebookexternalhit","facebot","twitterbot",
    "slackbot","slackbot-linkexpanding","telegrambot",
    "discordbot","linkedinbot","pinterestbot","whatsapp","vkshare","skypeuripreview"
)

FRONTEND_ORIGIN = "https://emmanuelworship.church"

def _is_bot(req):
    ua = (req.META.get("HTTP_USER_AGENT") or "").lower()
    return any(s in ua for s in BOTS)

def _desc(txt, limit=200):
    return escape(re.sub(r"\s+", " ", (txt or "")).strip()[:limit])

def _canonical(req):
    # Always point OG URL at the frontend domain so the card shows your site
    return f"{FRONTEND_ORIGIN}{req.path}"

def _share_image(req):
    # Use a public absolute image URL. You can host this on FE or BE; either is fine.
    return f"{FRONTEND_ORIGIN}/static/img/share-default.jpg"

def song_share(request, pk: int):
    if not _is_bot(request):
        return redirect(f"{FRONTEND_ORIGIN}{request.path}", permanent=False)

    song = Song.objects.filter(pk=pk).first()
    title = song.title if song else "Song not found"
    desc  = _desc(getattr(song, "verse", "")) if song else "This song may have been removed or the link is incorrect."
    url   = _canonical(request)
    img   = _share_image(request)

    html = f"""<!doctype html><html><head>
      <meta charset="utf-8" />
      <title>{escape(title)}</title>
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="emmanuelworship.church" />
      <meta property="og:title" content="{escape(title)}" />
      <meta property="og:description" content="{desc}" />
      <meta property="og:url" content="{escape(url)}" />
      <meta property="og:image" content="{escape(img)}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="{escape(title)}" />
      <meta name="twitter:description" content="{desc}" />
      <meta name="twitter:image" content="{escape(img)}" />
      <link rel="canonical" href="{escape(url)}" />
    </head><body></body></html>"""
    resp = HttpResponse(html, status=200)
    resp["X-Share-View"] = "song"
    return resp

def plan_share(request, pk: int):
    if not _is_bot(request):
        return redirect(f"{FRONTEND_ORIGIN}{request.path}", permanent=False)

    plan = Plan.objects.filter(pk=pk).first()
    title = getattr(plan, "title", None) or f"Plan {pk}"
    desc  = _desc(getattr(plan, "notes", ""))
    url   = _canonical(request)
    img   = _share_image(request)

    html = f"""<!doctype html><html><head>
      <meta charset="utf-8" />
      <title>{escape(title)}</title>
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="emmanuelworship.church" />
      <meta property="og:title" content="{escape(title)}" />
      <meta property="og:description" content="{desc}" />
      <meta property="og:url" content="{escape(url)}" />
      <meta property="og:image" content="{escape(img)}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="{escape(title)}" />
      <meta name="twitter:description" content="{desc}" />
      <meta name="twitter:image" content="{escape(img)}" />
      <link rel="canonical" href="{escape(url)}" />
    </head><body></body></html>"""
    resp = HttpResponse(html, status=200)
    resp["X-Share-View"] = "plan"
    return resp
