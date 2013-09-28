from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from geodj.models import Country

class Command(BaseCommand):
    help = 'Import countries from CSV into database'

    def handle(self, *args, **options):
        with open(settings.BASE_DIR + "/data/countrynames.csv", 'r') as countriesFile:
            for line in countriesFile:
                [iso_code, name] = line.split(",")
                Country(name=name.strip(), iso_code=iso_code.strip()).save()
