from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Album, Song, Instrument, Musician, MusicianInstrument, Singer, Plan, PlanSong
from .serializers import (
    AlbumSerializer,
    SongSerializer,
    InstrumentSerializer,
    MusicianSerializer,
    MusicianInstrumentSerializer,
    SingerSerializer,
    PlanSerializer, PlanSongSerializer
)
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView


def index(request):
    return render(request, 'index.html')


class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer


class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

    @action(detail=True, methods=['get'], url_path='view-chords', url_name='view_chords')
    def view_chords(self, request, pk=None):
        song = self.get_object()
        if not song.chords:
            return Response({'status': 'no chords available'}, status=status.HTTP_404_NOT_FOUND)
        response = HttpResponse(song.chords, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{song.title}_chords.pdf"'
        return response

    @action(detail=True, methods=['get'], url_path='view-powerpoint', url_name='view_powerpoint')
    def view_powerpoint(self, request, pk=None):
        song = self.get_object()
        if not song.powerpoint:
            return Response({'status': 'no PowerPoint available'}, status=status.HTTP_404_NOT_FOUND)
        response = HttpResponse(song.powerpoint, content_type='application/vnd.openxmlformats-officedocument.presentationml.presentation')
        response['Content-Disposition'] = f'attachment; filename="{song.title}_powerpoint.pptx"'
        return response


class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    @action(detail=True, methods=['get'], url_path='view-songs', url_name='view_songs')
    def view_songs(self, request, pk=None):
        plan = self.get_object()
        if not plan.songs.exists():
            return Response({'status': 'no songs available'}, status=status.HTTP_404_NOT_FOUND)
        songs = plan.songs.all()
        return Response({'songs': [song.song_title for song in songs]})

    @action(detail=True, methods=['get'], url_path='view-musicians', url_name='view_musicians')
    def view_musicians(self, request, pk=None):
        plan = self.get_object()
        if not plan.musicians.exists():
            return Response({'status': 'no musicians available'}, status=status.HTTP_404_NOT_FOUND)
        musicians = plan.musicians.all()
        return Response({'musicians': [f'{musician.first_name} {musician.last_name}' for musician in musicians]})

    @action(detail=True, methods=['get'], url_path='view-singers', url_name='view_singers')
    def view_singers(self, request, pk=None):
        plan = self.get_object()
        if not plan.singers.exists():
            return Response({'status': 'no singers available'}, status=status.HTTP_404_NOT_FOUND)
        singers = plan.singers.all()
        return Response({'singers': [f'{singer.first_name} {singer.last_name}' for singer in singers]})

    @action(detail=True, methods=['get'], url_path='view-lead-singers', url_name='view_lead_singers')
    def view_lead_singers(self, request, pk=None):
        plan = self.get_object()
        if not plan.lead_singers.exists():
            return Response({'status': 'no lead singers available'}, status=status.HTTP_404_NOT_FOUND)
        lead_singers = plan.lead_singers.all()
        return Response({'lead_singers': [f'{singer.first_name} {singer.last_name}' for singer in lead_singers]})

    @action(detail=True, methods=['get'], url_path='download-concatenated-powerpoint',
            url_name='download_concatenated_powerpoint')
    def download_concatenated_powerpoint(self, request, pk=None):
        plan = self.get_object()
        pptx_data = plan.create_concatenated_powerpoint()

        if not pptx_data:
            return Response({'status': 'no concatenated PowerPoint available'}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(pptx_data,
                                content_type='application/vnd.openxmlformats-officedocument.presentationml.presentation')
        response['Content-Disposition'] = f'attachment; filename="Plan_{plan.date}_concatenated_powerpoint.pptx"'
        return response



class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer


class MusicianViewSet(viewsets.ModelViewSet):
    queryset = Musician.objects.all()
    serializer_class = MusicianSerializer


class MusicianInstrumentViewSet(viewsets.ModelViewSet):
    queryset = MusicianInstrument.objects.all()
    serializer_class = MusicianInstrumentSerializer


class SingerViewSet(viewsets.ModelViewSet):
    queryset = Singer.objects.all()
    serializer_class = SingerSerializer


class PlanSongViewSet(viewsets.ModelViewSet):
    queryset = PlanSong.objects.all()
    serializer_class = PlanSongSerializer


# class PlanViewSet(viewsets.ModelViewSet):
#     queryset = Plan.objects.all()
#     serializer_class = PlanSerializer
#
# class PlanList(APIView):
#     def get(self, request):
#         plans = Plan.objects.all()
#         serializer = PlanSerializer(plans, many=True)
#         return Response(serializer.data)
#
# class PlanDetail(APIView):
#     def get(self, request, pk):
#         plan = get_object_or_404(Plan, pk=pk)
#         serializer = PlanSerializer(plan)
#         return Response(serializer.data)



# class SongList(APIView):
#     def get(self, request):
#         songs = Song.objects.all()
#         serializer = SongSerializer(songs, many=True)
#         return Response(serializer.data)
#
#
# class SongDetail(APIView):
#     def get(self, request, pk):
#         song = get_object_or_404(Song, pk=pk)
#         serializer = SongSerializer(song)
#         return Response(serializer.data)
