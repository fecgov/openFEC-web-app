import os

debug = os.getenv('FEC_WEB_DEBUG', False)
api_location = os.getenv('FEC_WEB_API_URL', 'http://localhost:5000')
host = os.getenv('FEC_HOST', '0.0.0.0')
port = os.getenv('VCAP_APP_PORT', '3000')
