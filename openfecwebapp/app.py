import re
import json
import locale
import hashlib
import logging
import datetime

import furl
from raven.contrib.flask import Sentry

from hmac_authentication import hmacauth
from flask import Flask, render_template, request, url_for
from flask_sslify import SSLify
from werkzeug.contrib.fixers import ProxyFix

from openfecwebapp import utils
from openfecwebapp import views
from openfecwebapp import config
from openfecwebapp import constants
from openfecwebapp.env import env


locale.setlocale(locale.LC_ALL, '')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_path='/static', static_folder='../dist')

from openfecwebapp import routes  # noqa
from openfecwebapp import filters  # noqa


def get_absolute_url():
    url = furl.furl(request.url)
    if app.config['SERVER_NAME']:
        url.host = app.config['SERVER_NAME']
        url.scheme = app.config['PREFERRED_URL_SCHEME']
    return url.url


def _get_default_cycles():
    cycle = utils.current_cycle()
    return list(range(cycle - 4, cycle + 2, 2))


def series_has_data(values, key):
    return next(
        (True for value in values if value.get(key) is not None),
        False,
    )


def group_has_data(value, keys):
    return next(
        (True for key in keys if value.get(key) is not None),
        False,
    )


def series_group_has_data(groups, keys):
    return next(
        (True for group in groups if group_has_data(group, keys)),
        False,
    )


def cycle_start(value):
    return datetime.datetime(value - 1, 1, 1)


def cycle_end(value):
    return datetime.datetime(value, 12, 31)


def nullify(value, *nulls):
    return value if value not in nulls else None


def get_election_url(candidate, cycle, district=None):
    if cycle:
        return url_for(
            'elections',
            office=candidate['office_full'].lower(),
            state=nullify(candidate['state'], 'US'),
            district=nullify(district or candidate['district'], '00'),
            cycle=cycle,
        )
    else:
        return None


try:
    assets = json.load(open('./rev-manifest.json'))
except OSError:
    logger.error(
        'Manifest "rev-manifest.json" not found. Did you remember to run '
        '"npm run build"?'
    )
    raise

assets = {
    key: value.replace('dist', '')
    for key, value in assets.items()
}

def asset_for(path):
    return url_for('static', filename=assets[path].lstrip('/'))

def asset_for_page(slug):
    path = 'dist/js/pages/' + slug + '.js'
    return asset_for(path)

def get_base_path():
    return request.headers.get('X-Script-Name', '')


def format_election_years(cycle, election_full, duration):
    start = (
        cycle - duration + 1
        if election_full and duration
        else cycle - 1
    )
    return '{}–{}'.format(start, cycle)


CLEAN_PATTERN = re.compile(r'[^\w-]')
def clean_id(value):
    return CLEAN_PATTERN.sub('', value)


app.jinja_env.globals.update(vars(config))
app.jinja_env.globals.update({
    'min': min,
    'max': max,
    'context': filters.get_context,
    'absolute_url': get_absolute_url,
    'contact_email': 'betafeedback@fec.gov',
    'default_cycles': _get_default_cycles(),
    'series_has_data': series_has_data,
    'group_has_data': group_has_data,
    'series_group_has_data': series_group_has_data,
    'cycle_start': cycle_start,
    'cycle_end': cycle_end,
    'election_url': get_election_url,
    'constants': constants,
    'cycles': utils.get_cycles(),
    'assets': assets,
    'asset_for': asset_for,
    'asset_for_page': asset_for_page,
    'base_path': get_base_path,
    'today': datetime.date.today,
    'format_election_years': format_election_years,
    'clean_id': clean_id,
})

app.add_url_rule('/issue/', view_func=views.GithubView.as_view('issue'))


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500


# If HTTPS is on, apply full HSTS as well, to all subdomains.
# Only use when you're sure. 31536000 = 1 year.
if config.force_https:
    sslify = SSLify(app, permanent=True, age=31536000, subdomains=True)


if config.environment in ['stage', 'prod']:
    app.config['PREFERRED_URL_SCHEME'] = 'https'


# if config.environment == 'prod':
#     auth = hmacauth.HmacAuth(
#         digest=hashlib.sha1,
#         secret_key=config.hmac_secret,
#         signature_header='X-Signature',
#         headers=config.hmac_headers,
#     )
#     app.wsgi_app = hmacauth.HmacMiddleware(app.wsgi_app, auth)

def initialize_newrelic():
    license_key = env.get_credential('NEW_RELIC_LICENSE_KEY')
    if license_key:
        import newrelic.agent
        settings = newrelic.agent.global_settings()
        settings.license_key = license_key
        newrelic.agent.initialize()

initialize_newrelic()

if config.sentry_dsn:
    Sentry(app, dsn=config.sentry_dsn)

app.wsgi_app = utils.ReverseProxied(app.wsgi_app)
app.wsgi_app = ProxyFix(app.wsgi_app)
