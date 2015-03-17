import os

debug = os.getenv('FEC_WEB_DEBUG', False)
api_location = os.getenv('FEC_WEB_API_URL', 'http://localhost:5000')
host = os.getenv('FEC_WEB_HOST', '0.0.0.0')
port = os.getenv('VCAP_APP_PORT', '3000')
username = os.getenv('FEC_WEB_USERNAME', '')
password = os.getenv('FEC_WEB_PASSWORD', '')
# you can only give a var a string using set-env with Cloud Foundry
# set FEC_WEB_DEBUG to any string but an empty one if you want debug on
debug = bool(os.getenv('FEC_WEB_DEBUG', ''))
