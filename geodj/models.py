from django.db import models

class Country(models.Model):
  # def __init__(self, name, iso_code):
  #   self.name = name
  #   self.iso_code = iso_code
  
  name = models.CharField(max_length = 200)
  iso_code = models.CharField(max_length=3)


class Artist(models.Model):
  # def __init__(self, name, mbid, country_id):
  #   self.name = name
  #   self.mbid = mbid
  #   self.country_id = country_id

  name = models.CharField(max_length = 200)
  mbid = models.TextField()
  country_id = models.TextField()
