eval $(python openfecwebapp/setenv.py)
npm run build
newrelic-admin run-program gunicorn __init__:app
