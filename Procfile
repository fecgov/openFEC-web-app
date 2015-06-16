web: eval $(python openfecwebapp/setenv.py) && npm run build && (pkill gunicorn || true) && newrelic-admin run-program gunicorn __init__:app --bind 127.0.0.1:8000 --daemon && bash ./boot.sh
