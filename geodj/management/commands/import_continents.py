from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from geodj.models import Country
import csv

class Command(BaseCommand):
    help = 'Import continents from CSV into database'

    def handle(self, *args, **options):
        with open(settings.BASE_DIR + "/data/countries_continents.csv", 'r') as continentsFile:
            csvReader = csv.reader(continentsFile, delimiter=',')
            for row in csvReader:
                [continent, country] = row
                try:
                    country = Country.objects.get(name=country)
                    country.continent = continent
                    country.save()
                except:
                    pass
