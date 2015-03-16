import os

debug = os.getenv('FEC_WEB_DEBUG', False)
api_location = os.getenv('FEC_WEB_API_URL', 'http://localhost:5000')
host = '0.0.0.0'
