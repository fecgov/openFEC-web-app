# turning off slack for now!
# invoke notify
gunicorn -w 2 openfecwebapp.app:app
