#### up and running locally

Install requirements:
```
pip install -r requirements.xt
```

If you haven't already, install postgres and create the database `geodj_development`.

Then, run the following commands to bootstrap the DB with some data:
```
python manage.py syncdb
python manage.py import_countries
python manage.py import_continents
python manage.py import_artists
python manage.py import_genres
```

Install Heroku Toolbelt for foreman: https://toolbelt.heroku.com/

To start the server, run `foreman start`, then go to [http://localhost:5000](http://localhost:5000)
