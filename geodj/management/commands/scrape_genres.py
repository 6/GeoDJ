from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils.encoding import smart_str
from geodj.musicbrainz import MusicBrainz
from geodj.models import Artist
import csv
import time

class Command(BaseCommand):
    help = 'Scrape top artists from each country'

    def handle(self, *args, **options):
        musicbrainz = MusicBrainz()

        results = []
        for artist in Artist.objects.all():
            time.sleep(1.1)  # Rate limit for APIs
            genres = musicbrainz.get_artist_genres(artist.mbid)
            if len(genres) > 0:
                result = [artist.mbid] + list(genres)
                print "Adding: ", result
                results.append(result)

        with open(settings.BASE_DIR + '/data/artists_genres.csv', 'wb') as genresFile:
            csvWriter = csv.writer(genresFile, delimiter=',')
            for row in results:
                csvWriter.writerow(row)
