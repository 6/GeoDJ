from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from geodj.models import Artist, Genre
import csv

class Command(BaseCommand):
    help = 'Import genres from CSV into database'

    def handle(self, *args, **options):
        with open(settings.BASE_DIR + "/data/artists_genres.csv", 'r') as genresFile:
            csvReader = csv.reader(genresFile, delimiter=',')
            for row in csvReader:
                mbid = row[0]
                genres = row[1:]
                artist = Artist.objects.get(mbid=mbid)
                for genre_name in genres:
                    genre, created = Genre.objects.get_or_create(name=genre_name)
                    artist.genres.add(genre)
                    artist.save()
