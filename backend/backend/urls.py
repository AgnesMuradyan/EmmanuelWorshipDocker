from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path, re_path
from django.views.generic import TemplateView

from myapp.views_share import song_share

urlpatterns = [
    re_path(r"^songs/(?P<pk>\d+)/?$", song_share, name="song_share"),

    path("api/", include("myapp.urls")),
    path("admin/", admin.site.urls),

    re_path(r"^(?!admin(?:/|$)).*", TemplateView.as_view(template_name="index.html")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
