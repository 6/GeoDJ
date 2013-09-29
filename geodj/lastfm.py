import os
import pylast

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
