from django.contrib import admin
from geodj.models import Country, Artist, Genre

class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'iso_code', 'continent')

class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name', 'mbid', 'country')

class GenreAdmin(admin.ModelAdmin):
    list_display = ('name',)

admin.site.register(Country, CountryAdmin)
admin.site.register(Artist, ArtistAdmin)
admin.site.register(Genre, GenreAdmin)
