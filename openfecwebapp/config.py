import os

from openfecwebapp.env import env

# no trailing slash
api_location = os.getenv('FEC_WEB_API_URL', 'http://localhost:5000')
api_location_public = os.getenv('FEC_WEB_API_URL_PUBLIC', api_location)
api_version = os.getenv('FEC_WEB_API_VERSION', 'v1')
host = os.getenv('FEC_WEB_HOST', '0.0.0.0')
port = os.getenv('FEC_WEB_PORT', '3000')
api_key = env.get_credential('FEC_WEB_API_KEY', '')
api_key_public = env.get_credential('FEC_WEB_API_KEY_PUBLIC', '')
cache = os.getenv('FEC_WEB_CACHE')
cache_size = int(os.getenv('FEC_WEB_CACHE_SIZE', 1000))
transition_url = env.get_credential('FEC_TRANSITION_URL', 'https://transition.fec.gov')
classic_url = env.get_credential('FEC_CLASSIC_URL', 'http://classic.fec.gov')
cms_url = os.getenv('FEC_CMS_URL', '')
canonical_base = 'https://beta.fec.gov'

site_orientation_banner = bool(env.get_credential('FEC_SITE_ORIENTATION_BANNER'))

# you can only give a var a string using set-env with Cloud Foundry
# set FEC_WEB_DEBUG to any string but an empty one if you want debug on
debug = bool(os.getenv('FEC_WEB_DEBUG'))

environments = {'dev', 'stage', 'prod'}
environment = (
    os.getenv('FEC_WEB_ENVIRONMENT')
    if os.getenv('FEC_WEB_ENVIRONMENT') in environments
    else 'dev'
)

features = {
    'press': bool(env.get_credential('FEC_FEATURE_PRESS', '')),
    'latest_updates': bool(env.get_credential('FEC_FEATURE_UPDATES', ''))
}

# Whether the app should force HTTPS/HSTS.
force_https = bool(os.getenv('FEC_FORCE_HTTPS', ''))

# used to include the Google Analytics tracking script
# set to a non-empty string in your environment if you want to use Analytics
use_analytics = bool(os.getenv('FEC_WEB_GOOGLE_ANALYTICS'))

github_token = env.get_credential('FEC_GITHUB_TOKEN')

hmac_secret = env.get_credential('HMAC_SECRET')
hmac_headers = env.get_credential('HMAC_HEADERS', '').split(',')
