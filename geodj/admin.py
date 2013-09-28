from django.contrib import admin
from geodj.models import Country, Artist

class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'iso_code')

class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name', 'mbid', 'country')

admin.site.register(Country, CountryAdmin)
admin.site.register(Artist, ArtistAdmin)
