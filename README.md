#### up and running locally

Install requirements:
```
pip install -r requirements.xt
```

If you haven't already, install postgres and create the database `geodj_development`. Then run:
```
python manage.py syncdb
python manage.py import_countries
python manage.py import_artists
```

Install Heroku Toolbelt for foreman: https://toolbelt.heroku.com/

To start the server, run `foreman start`, then go to [http://localhost:5000](http://localhost:5000)
