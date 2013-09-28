from django.http import HttpResponse
from django.shortcuts import render
from django.core import serializers
from django.utils import simplejson
from models import Country, Artist

def index(request):
    countries = Country.with_artists().order_by('?')
    context = {
        'countries': serializers.serialize("json", countries),
    }
    return render(request, 'index.html', context)

def videos(request, country_id):
    country = Country.objects.get(pk=country_id)
    videos = None
    for artist in country.random_artists():
        videos = artist.youtube_videos()
        if len(videos['results']) > 0:
            break
    return HttpResponse(simplejson.dumps(videos), mimetype='application/json')
