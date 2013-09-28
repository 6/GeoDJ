from django.http import HttpResponse
from django.shortcuts import render
from models import Country, Artist

def index(request):

    return render(request, 'index.html')
