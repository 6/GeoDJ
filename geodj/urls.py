from django.conf.urls import patterns, include, url
from geodj import views
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^admin/', include(admin.site.urls)),
    # Examples:
    # url(r'^$', 'geodj.views.home', name='home'),
    # url(r'^geodj/', include('geodj.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
)
