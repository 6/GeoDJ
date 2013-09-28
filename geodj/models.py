from django.db import models

class Country(models.Model):
    name = models.TextField()
    iso_code = models.CharField(max_length=2, unique=True)

    def __unicode__(self):
        return self.name

    @staticmethod
    def with_artists():
        return Country.objects.annotate(number_of_artists=models.Count('artist')).filter(number_of_artists__gte=1)

class Artist(models.Model):
    name = models.TextField()
    mbid = models.TextField(unique=True)
    country = models.ForeignKey(Country)

    def __unicode__(self):
        return self.name
