from django.conf.urls import patterns, include, url
from geodj import views
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^countries/(?P<country_id>\d+)/videos$', views.videos, name='videos'),
)
