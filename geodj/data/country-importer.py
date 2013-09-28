from django.core.management.base import BaseCommand, CommandError
from django.db import models

import csv

class Command(BaseCommand):
    help = 'manage.py custom commands'

    def handle(self, *args, **options):
        readFile = open("data/countrynames.csv", 'r')

        [iso_code, name] = line.split("\n")

        name=self.convertToFloatOrNull(name)
        iso_code=self.convertToFloatOrNull(iso_code)

        for line in readFile:
            C = Country(name=name,iso_code=iso_code)
            C.save()
        readFile.close()
