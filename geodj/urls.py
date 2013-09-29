from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView, RedirectView
from geodj import views
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^countries/(?P<country_id>\d+)/videos$', views.videos, name='videos'),
    url(r'^robots\.txt$', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    url(r'^apple-touch-icon\.png$', RedirectView.as_view(url='/static/images/apple-touch-icon.png')),
    url(r'^favicon\.ico$', RedirectView.as_view(url='/static/images/favicon.ico')),
)
