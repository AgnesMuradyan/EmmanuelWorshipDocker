from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AlbumViewSet,
    SongViewSet,
    InstrumentViewSet,
    MusicianViewSet,
    MusicianInstrumentViewSet,
    SingerViewSet,
    PlanViewSet, PlanSongViewSet,
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
    path('', include(router.urls)),
]


# urlpatterns = [
#     path('api/', include(router.urls)),
#     path('songs/', SongList.as_view(), name='song-list'),
#     path('songs/<int:pk>/', SongDetail.as_view(), name='song-detail'),
# ]
