from django.http import HttpResponse
from django.shortcuts import render
from django.core import serializers
from models import Country, Artist

def index(request):
    countries = Country.with_artists().order_by('?')
    context = {
        'countries': serializers.serialize("json", countries),
    }
    return render(request, 'index.html', context)
