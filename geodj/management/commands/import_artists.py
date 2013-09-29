from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from geodj.models import Country, Artist
import csv

class Command(BaseCommand):
    help = 'Import artists from CSV into database'

    def handle(self, *args, **options):
        with open(settings.BASE_DIR + "/data/artists.csv", 'r') as artistsFile:
            csvReader = csv.reader(artistsFile, delimiter=',')
            for row in csvReader:
                [iso_code, name, mbid] = row
                country = Country.objects.get(iso_code=iso_code)
                Artist(name=name, mbid=mbid, country=country).save()
