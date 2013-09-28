from django.db import models

class Country(models.Model):
    name = models.TextField()
    iso_code = models.CharField(max_length=2)

class Artist(models.Model):
    name = models.TextField()
    mbid = models.TextField()
    country = models.ForeignKey(Country)
