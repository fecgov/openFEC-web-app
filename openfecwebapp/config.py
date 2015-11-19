import os

# no trailing slash
api_location = os.getenv('FEC_WEB_API_URL', 'http://localhost:5000')
api_location_public = os.getenv('FEC_WEB_API_URL_PUBLIC', api_location)
api_version = os.getenv('FEC_WEB_API_VERSION', 'v1')
host = os.getenv('FEC_WEB_HOST', '0.0.0.0')
port = os.getenv('FEC_WEB_PORT', '3000')
api_key = os.getenv('FEC_WEB_API_KEY', '')
api_key_public = os.getenv('FEC_WEB_API_KEY_PUBLIC', '')
cache = os.getenv('FEC_WEB_CACHE')
cache_size = int(os.getenv('FEC_WEB_CACHE_SIZE', 1000))

style_url = os.getenv('FEC_WEB_STYLE_URL')
cms_url = os.getenv('FEC_CMS_URL', '')

# the username and password should be the same for both the
# web app and API
username = os.getenv('FEC_WEB_USERNAME', '')
password = os.getenv('FEC_WEB_PASSWORD', '')

# you can only give a var a string using set-env with Cloud Foundry
# set FEC_WEB_DEBUG to any string but an empty one if you want debug on
debug = bool(os.getenv('FEC_WEB_DEBUG'))

environments = {'dev', 'stage', 'prod'}
environment = (
    os.getenv('FEC_WEB_ENVIRONMENT')
    if os.getenv('FEC_WEB_ENVIRONMENT') in environments
    else 'dev'
)

# Whether the app should force HTTPS/HSTS.
force_https = bool(os.getenv('FEC_FORCE_HTTPS', ''))

# used to turn auth off for testing
# set to a non-empty string in your environment if you want auth off
test = os.getenv('FEC_WEB_TEST')

# used to include the Google Analytics tracking script
# set to a non-empty string in your environment if you want to use Analytics
use_analytics = bool(os.getenv('FEC_WEB_GOOGLE_ANALYTICS'))

github_token = os.getenv('FEC_GITHUB_TOKEN')
sentry_dsn = os.getenv('SENTRY_DSN')

hmac_secret = os.getenv('HMAC_SECRET')
hmac_headers = os.getenv('HMAC_HEADERS', '').split(',')
