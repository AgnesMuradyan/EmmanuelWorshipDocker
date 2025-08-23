from django.urls import path, include
from .views import create_slide_dl  # make sure this is the right import
from rest_framework.routers import DefaultRouter
from .views import (
    AlbumViewSet, SongViewSet, InstrumentViewSet, MusicianViewSet,
    MusicianInstrumentViewSet, SingerViewSet, PlanViewSet, PlanSongViewSet,
)

router = DefaultRouter()
router.register(r'songs', SongViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'instruments', InstrumentViewSet)
router.register(r'musicians', MusicianViewSet)
router.register(r'musicianinstruments', MusicianInstrumentViewSet)
router.register(r'singers', SingerViewSet)
router.register(r'plans', PlanViewSet)
router.register(r'plansongs', PlanSongViewSet)

urlpatterns = [
    path('create_slide_dl/', create_slide_dl, name='create_slide_dl'),  # <-- put BEFORE include(router.urls)
    path('', include(router.urls)),
]
