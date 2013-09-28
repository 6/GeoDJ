from gdata.youtube.service import YouTubeService, YouTubeVideoQuery

class YoutubeMusic:
    def __init__(self):
        self.service = YouTubeService()

    def search(self, artist):
        query = YouTubeVideoQuery()
        query.vq = artist
        query.orderby = 'viewCount'
        query.racy = 'exclude'
        query.categories.append("/Music")
        feed = self.service.YouTubeQuery(query)
        results = []
        for entry in feed.entry:
            if not self.is_valid_entry(artist, entry):
                continue
            results.append({
                'url': entry.media.player.url,
                'duration': int(entry.media.duration.seconds),
            })
        return results

    def is_valid_entry(self, artist, entry):
        duration = int(entry.media.duration.seconds)
        if entry.rating is not None and float(entry.rating.average) < 3:
            return False
        if duration < (2 * 60) or duration > (9 * 60):
            return False
        if artist.lower() not in entry.media.title.text.lower():
            return False
        return True
