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
    videos = country.random_artist().youtube_videos()
    return HttpResponse(simplejson.dumps(videos), mimetype='application/json')
