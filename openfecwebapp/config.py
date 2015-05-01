import os

# no trailing slash
api_location = os.getenv('FEC_WEB_API_URL', 'http://localhost:5000')
api_version = os.getenv('FEC_WEB_API_VERSION', 'v1')
host = os.getenv('FEC_WEB_HOST', '0.0.0.0')
port = os.getenv('VCAP_APP_PORT', '3000')
api_key = os.getenv('FEC_WEB_API_KEY', '')
api_key_public = os.getenv('FEC_WEB_API_KEY_PUBLIC', '')

# the username and password should be the same for both the
# web app and API
username = os.getenv('FEC_WEB_USERNAME', '')
password = os.getenv('FEC_WEB_PASSWORD', '')

# you can only give a var a string using set-env with Cloud Foundry
# set FEC_WEB_DEBUG to any string but an empty one if you want debug on
debug = bool(os.getenv('FEC_WEB_DEBUG', ''))

# used to turn auth off for testing
# set to a non-empty string in your environment if you want auth off
test = os.getenv('FEC_WEB_TEST')

# used to include the Google Analytics tracking script
# set to a non-empty string in your environment if you want to use Analytics
analytics = os.getenv('FEC_WEB_GOOGLE_ANALYTICS')
