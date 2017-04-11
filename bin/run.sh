# turning off slack for now!
# invoke notify
gunicorn --log-level debug -k gevent -w 2 openfecwebapp.app:app
