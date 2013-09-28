from gdata.youtube.service import YouTubeService, YouTubeVideoQuery
from django.utils.encoding import smart_str

class YoutubeMusic:
    def __init__(self):
        self.service = YouTubeService()

    def search(self, artist):
        query = YouTubeVideoQuery()
        query.vq = artist
        query.orderby = 'relevance'
        query.racy = 'exclude'
        query.categories.append("/Music")
        feed = self.service.YouTubeQuery(query)
        results = []
        for entry in feed.entry:
            if not self.is_valid_entry(artist, entry):
                continue
            results.append({
                'url': entry.media.player.url,
                'title': smart_str(entry.media.title.text),
                'duration': int(entry.media.duration.seconds),
            })
        return {'artist': artist, 'results': results}

    def is_valid_entry(self, artist, entry):
        duration = int(entry.media.duration.seconds)
        if entry.rating is not None and float(entry.rating.average) < 3:
            return False
        if duration < (2 * 60) or duration > (9 * 60):
            return False
        if artist.lower() not in smart_str(entry.media.title.text).lower():
            return False
        return True
