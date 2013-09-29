from django.http import HttpResponse
from django.shortcuts import render
from django.core import serializers
from django.utils import simplejson
from models import Country, Artist
import random

def index(request):
    countries = Country.with_artists(min=3).order_by('?')
    context = {
        'countries': serializers.serialize("json", countries),
    }
    return render(request, 'index.html', context)

def videos_by_country(request, country_id):
    country = Country.objects.get(pk=country_id)
    videos = None
    for artist in country.random_artists():
        videos = artist.youtube_videos()
        if len(videos['results']) > 0:
            break
    return HttpResponse(simplejson.dumps(videos), mimetype='application/json')

def videos_by_genre(request, genre):
    videos = None
    artists = list(Artist.by_genre(genre))
    random.shuffle(artists)
    for artist in artists:
        videos = artist.youtube_videos()
        if len(videos['results']) > 0:
            videos['country'] = artist.country.name
            break
    return HttpResponse(simplejson.dumps(videos), mimetype='application/json')
