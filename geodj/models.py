from django.db import models

class Country(models.Model):
    name = models.TextField()
    iso_code = models.CharField(max_length=2, unique=True)

    def __unicode__(self):
        return self.name

class Artist(models.Model):
    name = models.TextField()
    mbid = models.TextField(unique=True)
    country = models.ForeignKey(Country)
