import logging

from django import forms
from rest_framework import serializers

from .models import (
    Album,
    Instrument,
    Member,
    Musician,
    MusicianInstrument,
    Plan,
    PlanLeadSinger,
    PlanSong,
    Singer,
    Song,
)

logger = logging.getLogger(__name__)


class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ['id', 'title']

class SongChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ("id", "title")

class SongSerializer(serializers.ModelSerializer):
    album = AlbumSerializer(read_only=True)
    chords_file = forms.FileField(required=False)

    class Meta:
        model = Song
        fields = '__all__'

    def save(self, commit=True):
        instance = super(SongSerializer, self).save(commit=False)
        file = self.cleaned_data.get('chords_file', None)
        if file:
            instance.chords = file.read()
        if commit:
            instance.save()
        return instance


class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = ['id', 'name']


class MusicianInstrumentSerializer(serializers.ModelSerializer):
    musician = serializers.StringRelatedField()
    instrument = serializers.StringRelatedField()

    class Meta:
        model = MusicianInstrument
        fields = ['id', 'musician', 'instrument']


class MusicianSerializer(serializers.ModelSerializer):
    instruments = InstrumentSerializer(many=True, read_only=True)

    class Meta:
        model = Musician
        fields = ['id', 'first_name', 'last_name', 'birth_date', 'phone_number', 'instruments']


class SingerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Singer
        fields = ['id', 'first_name', 'last_name', 'birth_date', 'phone_number', 'role']


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'first_name', 'last_name', 'birth_date', 'phone_number']


class PlanSongSerializer(serializers.ModelSerializer):
    plan_date = serializers.DateField(source='plan.date', read_only=True)
    song_title = serializers.CharField(source='song.title', read_only=True)
    song_id = serializers.IntegerField(source='song.id')

    class Meta:
        model = PlanSong
        fields = ['id', 'plan_date', 'song_title', 'order', 'song_id']

    def create(self, validated_data):
        song_id = validated_data.pop('song')['id']
        song = Song.objects.get(id=song_id)
        validated_data['song'] = song
        return super().create(validated_data)

    def update(self, instance, validated_data):
        song_id = validated_data.pop('song', {}).get('id', None)
        if song_id:
            song = Song.objects.get(id=song_id)
            instance.song = song
        instance.order = validated_data.get('order', instance.order)
        instance.save()
        return instance

class PlanLeadSingerSerializer(serializers.ModelSerializer):
    singer_id = serializers.IntegerField(source='singer.id', read_only=True)
    first_name = serializers.CharField(source='singer.first_name', read_only=True)
    last_name = serializers.CharField(source='singer.last_name', read_only=True)

    class Meta:
        model = PlanLeadSinger
        fields = ['id', 'order', 'singer_id', 'first_name', 'last_name']

class PlanSerializer(serializers.ModelSerializer):
    lead_singers = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Singer.objects.all(), required=False
    )
    lead_singers_ordered = PlanLeadSingerSerializer(
        many=True, read_only=True, source='planleadsinger_set'
    )
    singers = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Singer.objects.all(), required=False
    )
    choir = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Singer.objects.all(), required=False
    )
    musicians = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Musician.objects.all(), required=False
    )
    songs = PlanSongSerializer(many=True, source='plansong_set', required=False)
    plansong_set = PlanSongSerializer(many=True, write_only=True, required=False)
    concatenated_powerpoint = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = '__all__'

    def get_concatenated_powerpoint(self, obj):
        return obj.concatenated_powerpoint is not None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['lead_singers'] = SingerSerializer(instance.lead_singers.all(), many=True).data
        data['singers'] = SingerSerializer(instance.singers.all(), many=True).data
        data['choir'] = SingerSerializer(instance.choir.all(), many=True).data
        data['musicians'] = MusicianSerializer(instance.musicians.all(), many=True).data
        data['songs'] = PlanSongSerializer(instance.plansong_set.all(), many=True).data
        data.pop('plansong_set', None)
        return data

    def _song_id_from_plan_song(self, song_data):
        song = song_data.get('song')
        if isinstance(song, dict):
            return song.get('id')
        return song_data.get('song_id')

    def _replace_lead_singers(self, plan, lead_singers):
        plan.planleadsinger_set.all().delete()
        for order, singer in enumerate(lead_singers, start=1):
            PlanLeadSinger.objects.create(plan=plan, singer=singer, order=order)

    def _replace_plan_songs(self, plan, songs_data):
        plan.plansong_set.all().delete()
        for order, song_data in enumerate(songs_data, start=1):
            song_id = self._song_id_from_plan_song(song_data)
            if song_id:
                PlanSong.objects.create(
                    plan=plan,
                    song_id=song_id,
                    order=song_data.get('order') or order,
                )

    def create(self, validated_data):
        songs_data = validated_data.pop('plansong_set', [])
        lead_singers = validated_data.pop('lead_singers', [])
        singers = validated_data.pop('singers', [])
        choir = validated_data.pop('choir', [])
        musicians = validated_data.pop('musicians', [])
        plan = Plan.objects.create(**validated_data)
        self._replace_lead_singers(plan, lead_singers)
        plan.singers.set(singers)
        plan.choir.set(choir)
        plan.musicians.set(musicians)
        self._replace_plan_songs(plan, songs_data)
        return plan

    def update(self, instance, validated_data):
        songs_data = validated_data.pop('plansong_set', None)
        lead_singers = validated_data.pop('lead_singers', None)
        singers = validated_data.pop('singers', None)
        choir = validated_data.pop('choir', None)
        musicians = validated_data.pop('musicians', None)
        instance.date = validated_data.get('date', instance.date)
        instance.day_type = validated_data.get('day_type', instance.day_type)
        instance.concatenated_powerpoint = validated_data.get('concatenated_powerpoint', instance.concatenated_powerpoint)
        instance.save()

        if lead_singers is not None:
            self._replace_lead_singers(instance, lead_singers)
        if singers is not None:
            instance.singers.set(singers)
        if choir is not None:
            instance.choir.set(choir)
        if musicians is not None:
            instance.musicians.set(musicians)
        if songs_data is not None:
            self._replace_plan_songs(instance, songs_data)

        return instance

class PlanChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ("id", "date", "day_type")
