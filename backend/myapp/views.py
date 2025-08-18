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
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Song
from .serializers import SongSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import SongSerializer, SongChoiceSerializer
from io import BytesIO
from django.http import HttpResponse
from docx import Document
from io import BytesIO
from django.http import HttpResponse
from rest_framework.decorators import action
from docx import Document
from docx.shared import Pt
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def index(request):
    return render(request, 'index.html')


class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer


class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all().order_by("title")
    serializer_class = SongSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "album__title"]
    ordering_fields = ["title", "created_at", "id"]

    @action(detail=False, methods=["get"], url_path="choices")
    def choices(self, request):
        qs = self.filter_queryset(self.get_queryset()) \
                 .order_by("title") \
                 .values("id", "title")  # ✅ returns dicts straight from DB

        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(list(page))
        return Response(list(qs))

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
    filter_backends = [OrderingFilter]
    ordering_fields = ["date", "id", "day_type"]
    ordering = ["-date", "-id"]

    def get_queryset(self):
        qs = super().get_queryset()
        # existing filters:
        date_val = self.request.query_params.get("date")
        if date_val:
            qs = qs.filter(date=date_val)

        dt_csv = self.request.query_params.get("day_type")
        if dt_csv:
            wanted = [v.strip().upper() for v in dt_csv.split(",") if v.strip()]
            qs = qs.filter(day_type__in=wanted)
        return qs

    @action(detail=False, methods=["get"], url_path="choices")
    def choices(self, request):
        qs = self.filter_queryset(self.get_queryset()) \
            .order_by("-date", "-id") \
            .values("id", "date", "day_type")
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(list(page))
        return Response(list(qs))

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

    @action(detail=True, methods=['get'], url_path='download-summary-docx', url_name='download_summary_docx')
    def download_summary_docx(self, request, pk=None):
        # Prefetch to avoid N+1 queries
        plan = (
            self.get_queryset()
            .prefetch_related('lead_singers', 'singers', 'songs')
            .get(pk=pk)
        )

        doc = Document()

        # Set global font to Calibri 16
        normal = doc.styles['Normal']
        normal.font.name = 'Calibri'
        normal.font.size = Pt(16)

        def full_names(qs):
            names = []
            for obj in qs:
                first = getattr(obj, 'first_name', '') or ''
                last = getattr(obj, 'last_name', '') or ''
                n = f"{first} {last}".strip()
                if n:
                    names.append(n)
            return names

        def comma_join(items):
            return ', '.join(items) if items else '—'

        def add_bold_line(text):
            p = doc.add_paragraph()
            r = p.add_run(text)
            r.bold = True
            r.font.name = 'Calibri'
            r.font.size = Pt(16)
            return p

        def add_label_value(label_armenian, value_text):
            """Label (bold 16) + value (regular 16) on same line."""
            p = doc.add_paragraph()
            r_label = p.add_run(f"{label_armenian}՝ ")
            r_label.bold = True
            r_label.font.name = 'Calibri'
            r_label.font.size = Pt(16)

            r_val = p.add_run(value_text if value_text else '—')
            r_val.bold = False
            r_val.font.name = 'Calibri'
            r_val.font.size = Pt(16)
            return p

        def add_horizontal_rule():
            """Adds a stand-alone paragraph that renders a horizontal line (bottom border)."""
            p = doc.add_paragraph()
            p_el = p._element
            pPr = p_el.get_or_add_pPr()
            pBdr = OxmlElement('w:pBdr')
            bottom = OxmlElement('w:bottom')
            bottom.set(qn('w:val'), 'single')
            bottom.set(qn('w:sz'), '12')  # thickness (1/8 pt units)
            bottom.set(qn('w:space'), '1')
            bottom.set(qn('w:color'), 'auto')
            pBdr.append(bottom)
            pPr.append(pBdr)
            return p

        # --- Date line (bold, 16) ---
        try:
            # Armenian-style punctuation for date: dd.MM․yy
            date_str = plan.date.strftime('%d.%m․%y')
        except Exception:
            date_str = str(plan.date)
        add_bold_line(date_str)

        # --- Վարողներ (lead singers) ---
        lead_text = comma_join(full_names(plan.lead_singers.all()))
        add_label_value('Վարողներ', lead_text)

        # --- Վոկալ (singers) ---
        vocal_text = comma_join(full_names(plan.singers.all()))
        add_label_value('Վոկալ', vocal_text)

        # --- spacer then a horizontal line before "Երգեր" ---
        doc.add_paragraph("")  # blank line (not bold, 16 via Normal)
        add_horizontal_rule()

        # --- "Երգեր՝" title (bold, 16) ---
        add_bold_line("Երգեր՝")

        # Preserve custom ordering if available
        try:
            songs_qs = plan.songs.all().order_by('plansong__order', 'id')
        except Exception:
            songs_qs = plan.songs.all()

        titles = []
        for s in songs_qs:
            title = getattr(s, 'song_title', None) or getattr(s, 'title', None) or str(s)
            titles.append(title)

        if titles:
            for t in titles:
                p = doc.add_paragraph(t, style='List Number')  # numbered list items
                # Ensure numbering items are Calibri 16 (inherits from Normal, but set explicitly for safety)
                for r in p.runs:
                    r.bold = False
                    r.font.name = 'Calibri'
                    r.font.size = Pt(16)
        else:
            p = doc.add_paragraph('—')
            for r in p.runs:
                r.bold = False
                r.font.name = 'Calibri'
                r.font.size = Pt(16)

        # Serialize to bytes
        buf = BytesIO()
        doc.save(buf)
        buf.seek(0)

        resp = HttpResponse(
            buf.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        resp['Content-Disposition'] = f'attachment; filename="Plan_{plan.date}_summary.docx"'
        return resp



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
