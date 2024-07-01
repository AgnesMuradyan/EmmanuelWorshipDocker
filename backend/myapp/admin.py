from django.contrib import admin
from .models import Album, Song, Instrument, Musician, MusicianInstrument, Singer, Plan, PlanSong
from .serializers import SongSerializer
from django import forms
from django.contrib import admin
from django import forms
from .models import Album, Song


class SongAdminForm(forms.ModelForm):
    chords_file = forms.FileField(required=False, help_text="Upload a PDF file for the chords.")
    powerpoint_file = forms.FileField(required=False, help_text="Upload a PowerPoint file.")

    class Meta:
        model = Song
        fields = '__all__'

    def save(self, commit=True):
        instance = super(SongAdminForm, self).save(commit=False)
        chords_file = self.cleaned_data.get('chords_file', None)
        if chords_file:
            instance.chords = chords_file.read()
        powerpoint_file = self.cleaned_data.get('powerpoint_file', None)
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


class PlanSongInline(admin.TabularInline):
    model = PlanSong
    extra = 1
    fields = ('song', 'order')
    raw_id_fields = ('song',)

# class PlanAdmin(admin.ModelAdmin):
#     list_display = ('date',)
#     filter_horizontal = ('lead_singers', 'singers', 'musicians', 'songs')
#     inlines = [PlanSongInline]


class PlanAdmin(admin.ModelAdmin):
    inlines = [PlanSongInline]
    list_display = ('date', 'day_type')



admin.site.register(Plan, PlanAdmin)
admin.site.register(Song, SongAdmin)
admin.site.register(Album)
# admin.site.register(Song)
admin.site.register(Instrument)
admin.site.register(Musician)
admin.site.register(MusicianInstrument)
admin.site.register(Singer)
# admin.site.register(Plan)
