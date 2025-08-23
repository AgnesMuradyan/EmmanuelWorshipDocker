# admin.py
from django.contrib import admin
from django import forms
from django.db import transaction, connections  # <-- add this
from .models import Album, Song, Instrument, Musician, MusicianInstrument, Singer, Plan, PlanSong
from .serializers import SongSerializer

class SongAdminForm(forms.ModelForm):
    chords_file = forms.FileField(required=False, help_text="Upload a PDF file for the chords.")
    powerpoint_file = forms.FileField(required=False, help_text="Upload a PowerPoint file.")

    class Meta:
        model = Song
        fields = '__all__'

    def save(self, commit=True):
        instance = super().save(commit=False)
        chords_file = self.cleaned_data.get('chords_file')
        if chords_file:
            instance.chords = chords_file.read()
        powerpoint_file = self.cleaned_data.get('powerpoint_file')
        if powerpoint_file:
            instance.powerpoint = powerpoint_file.read()
        if commit:
            instance.save()
        return instance

class SongAdmin(admin.ModelAdmin):
    form = SongAdminForm
    list_display = ['title', 'original_key', 'album', 'created_at', 'updated_at']
    search_fields = ['title', 'original_key', 'album__title']
    fieldsets = (
        (None, {
            'fields': ('title', 'original_link', 'original_key', 'album', 'verse', 'chords_file', 'powerpoint_file')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

class PlanSongForm(forms.ModelForm):
    class Meta:
        model = PlanSong
        fields = '__all__'

    def validate_unique(self):
        """
        Skip Django's model-level unique validation so we don't block swaps like 1↔2.
        DB (deferrable) constraint will still enforce uniqueness at commit.
        """
        # Intentionally do NOT call super().validate_unique()
        return

class PlanSongInline(admin.TabularInline):
    model = PlanSong
    form = PlanSongForm            # <— use the custom form
    extra = 0
    fields = ('song', 'order')
    raw_id_fields = ('song',)
    ordering = ('order',)

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    inlines = [PlanSongInline]
    list_display = ('date', 'day_type')

    def save_related(self, request, form, formsets, change):
        # Defer the DB uniqueness check until COMMIT so swaps don't fail
        with transaction.atomic():
            with connections['default'].cursor() as cursor:
                cursor.execute('SET CONSTRAINTS uniq_plan_order DEFERRED')
            super().save_related(request, form, formsets, change)

admin.site.register(Song, SongAdmin)
admin.site.register(Album)
admin.site.register(Instrument)
admin.site.register(Musician)
admin.site.register(MusicianInstrument)
admin.site.register(Singer)
