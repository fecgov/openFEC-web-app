# turning off slack for now!
# invoke notify
gunicorn -k gevent -w 2 openfecwebapp.app:app
