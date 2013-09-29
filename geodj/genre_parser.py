import re
from django.utils.encoding import smart_str

class GenreParser:
    @staticmethod
    def parse(genre):
        genre = smart_str(genre).lower()
        if re.search(r"\b(jazz|blues)\b", genre):
            return "jazz"
        if re.search(r"\b(ska|reggae|ragga|dub)\b", genre):
            return "ska"
        elif re.search(r"\b(r&b|funk|soul)\b", genre):
            return "r&b"
        elif re.search(r"\bfolk\b", genre):
            return "folk"
        elif re.search(r"\b(country|bluegrass)\b", genre):
            return "country"
        elif re.search(r"\b(rap|hip hop|crunk|trip hop)\b", genre):
            return "hiphop"
        elif re.search(r"\bpop\b", genre):
            return "pop"
        elif re.search(r"\b(rock|metal|punk)\b", genre):
            return "rock"
        elif re.search(r"\b(electronic|electronica|electro|house|techno|ambient|chiptune|industrial|downtempo|drum and bass|trance|dubstep)\b", genre):
            return "electronic"
        elif re.search(r"\b(classical|orchestra|opera|piano|violin|cello)\b", genre):
            return "classical"
