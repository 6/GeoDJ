from django.db import models
from django.utils.encoding import smart_str
import random
from geodj.youtube import YoutubeMusic

class Country(models.Model):
    name = models.TextField()
    iso_code = models.CharField(max_length=2, unique=True)

    def __unicode__(self):
        return self.name

    def random_artist(self):
        return random.choice(self.artist_set.all())

    @staticmethod
    def with_artists():
        return Country.objects.annotate(number_of_artists=models.Count('artist')).filter(number_of_artists__gte=1)

class Artist(models.Model):
    name = models.TextField()
    mbid = models.TextField(unique=True)
    country = models.ForeignKey(Country)

    def __unicode__(self):
        return self.name

    def youtube_videos(self):
        return YoutubeMusic().search(smart_str(self.name))
