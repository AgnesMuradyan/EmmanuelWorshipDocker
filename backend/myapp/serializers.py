from django.shortcuts import get_object_or_404
from rest_framework import serializers
from .models import (
    Album, Song, Member, Instrument, Musician, MusicianInstrument, Singer, Plan, PlanSong
)
from django import forms
import logging

logger = logging.getLogger(__name__)

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ['id', 'title']


class SongSerializer(serializers.ModelSerializer):
    album = AlbumSerializer(read_only=True)
    chords_file = forms.FileField(required=False)

    class Meta:
        model = Song
        fields = '__all__'
        # widgets = {
        #     'chords': forms.FileInput(),
        # }

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
    song_id = serializers.IntegerField(source='song.id')  # Fetch the song ID from the related Song instance

    class Meta:
        model = PlanSong
        fields = ['id', 'plan_date', 'song_title', 'order', 'song_id']

    def create(self, validated_data):
        song_id = validated_data.pop('song')['id']
        song = Song.objects.get(id=song_id)  # Fetch the actual song instance
        validated_data['song'] = song  # Use the song instance instead of the ID
        return super().create(validated_data)

    def update(self, instance, validated_data):
        song_id = validated_data.pop('song', {}).get('id', None)
        if song_id:
            song = Song.objects.get(id=song_id)
            instance.song = song
        instance.order = validated_data.get('order', instance.order)
        instance.save()
        return instance



class PlanSerializer(serializers.ModelSerializer):
    lead_singers = SingerSerializer(many=True, read_only=True)
    singers = SingerSerializer(many=True, read_only=True)
    musicians = MusicianSerializer(many=True, read_only=True)
    songs = PlanSongSerializer(many=True, source='plansong_set')

    concatenated_powerpoint = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = '__all__'

    def get_concatenated_powerpoint(self, obj):
        return obj.concatenated_powerpoint is not None

    def create(self, validated_data):
        songs_data = validated_data.pop('plansong_set', [])
        plan = Plan.objects.create(**validated_data)
        for song_data in songs_data:
            PlanSong.objects.create(plan=plan, song=song_data['song'], order=song_data['order'])
        return plan

    def update(self, instance, validated_data):
        songs_data = validated_data.pop('plansong_set', [])
        instance.date = validated_data.get('date', instance.date)
        instance.concatenated_powerpoint = validated_data.get('concatenated_powerpoint', instance.concatenated_powerpoint)
        instance.save()

        instance.plansong_set.all().delete()
        for song_data in songs_data:
            PlanSong.objects.create(plan=instance, song_id=song_data['song_id'], order=song_data['order'])

        return instance




