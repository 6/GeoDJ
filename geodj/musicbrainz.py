import musicbrainzngs

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
