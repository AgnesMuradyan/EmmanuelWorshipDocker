from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# from myapp.views import index
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from myapp.views_share import song_share

urlpatterns = [
    # Share preview route (non-API): /songs/<id>
    re_path(r"^songs/(?P<pk>\d+)/?$", song_share, name="song_share"),

    # Your API (what you posted)
    path("api/", include("myapp.urls")),

    path("admin/", admin.site.urls),

    # SPA catch-all for other frontend routes
    re_path(r"^(?!admin/).*", TemplateView.as_view(template_name="index.html")),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
