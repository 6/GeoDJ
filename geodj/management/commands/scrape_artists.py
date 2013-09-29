from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils.encoding import smart_str
from geodj.models import Country
from geodj.lastfm import LastFM
from geodj.musicbrainz import MusicBrainz
import csv
import time

class Command(BaseCommand):
    help = 'Scrape top artists from each country'

    def handle(self, *args, **options):
        lastfm = LastFM()
        musicbrainz = MusicBrainz()

        results = []
        for country in Country.objects.all():
            for artist in lastfm.artists_by_country(country):
                time.sleep(1.1) # Rate limit for APIs
                musicbrainz_id = artist.get_mbid()
                if not musicbrainz.is_artist_from_country(musicbrainz_id, country.iso_code):
                    continue
                result = [country.iso_code, smart_str(artist.name), musicbrainz_id]
                print "Adding: ", result
                results.append(result)

        with open(settings.BASE_DIR + '/data/artists.csv', 'wb') as artistsFile:
            csvWriter = csv.writer(artistsFile, delimiter=',')
            for row in results:
                csvWriter.writerow(row)
