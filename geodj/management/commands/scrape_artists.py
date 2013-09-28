from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils.encoding import smart_str
from geodj.models import Country
import os
import csv
import time
import pylast
import musicbrainzngs

class LastFM:
    def __init__(self):
        self.network = pylast.LastFMNetwork(api_key=os.environ['LASTFM_API_KEY'])

    def artists_by_country(self, country):
        try:
            tag = pylast.Tag(country.name.lower(), self.network)
            results = tag.get_top_artists()
            return [result[0] for result in results]
        except Exception as exc:
            print "Something went wrong for last.fm: %s" % exc
            return []

class MusicBrainz:
    def __init__(self):
        musicbrainzngs.set_useragent("GeoDJ", "0.0.1", "https://github.com/6/djangodash2013")

    def is_artist_from_country(self, musicbrainz_id, country_code):
        if musicbrainz_id is None or musicbrainz_id.strip() == "":
            return False
        try:
            result = musicbrainzngs.get_artist_by_id(musicbrainz_id)
        except musicbrainzngs.WebServiceError as exc:
            print "Something went wrong with the request: %s" % exc
            return False
        except musicbrainzngs.MusicBrainzError as exc:
            print "Something went wrong with MusicBrainz: %s" % exc
            return False
        else:
            if 'artist' in result and 'country' in result['artist']:
                return result['artist']['country'] == country_code
            return False

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
