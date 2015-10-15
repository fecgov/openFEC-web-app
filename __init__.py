import re
import http
import json
import locale
import logging
import datetime

import furl
import jinja2
from webargs import fields
from webargs.flaskparser import use_kwargs
from dateutil.parser import parse as parse_date

from flask import Flask, render_template, request, redirect, url_for, abort
from flask_sslify import SSLify
from flask.ext.basicauth import BasicAuth
from werkzeug.contrib.fixers import ProxyFix

from openfecwebapp import utils
from openfecwebapp import views
from openfecwebapp import config
from openfecwebapp import constants
from openfecwebapp.api_caller import load_search_results, load_with_nested


locale.setlocale(locale.LC_ALL, '')

START_YEAR = 1979

app = Flask(__name__, static_path='/static', static_folder='dist')

# ===== configure logging =====
logger = logging.getLogger(__name__)
log_level = logging.DEBUG if config.debug else logging.WARN
logging.basicConfig(level=log_level)


@jinja2.contextfunction
def get_context(c):
    return c


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


def get_cycles():
    return range(utils.current_cycle(), START_YEAR, -2)


def cycle_start(value):
    return datetime.datetime(value - 1, 1, 1)


def cycle_end(value):
    return datetime.datetime(value, 12, 31)


def get_election_url(candidate, cycle, district=None):
    return url_for(
        'elections',
        office=candidate['office_full'].lower(),
        state=candidate['state'] if candidate['state'] != 'US' else None,
        district=district or candidate['district'],
        cycle=cycle,
    )


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


def get_base_path():
    return request.headers.get('X-Script-Name', '')


app.jinja_env.globals.update({
    'min': min,
    'max': max,
    'api_location': config.api_location_public,
    'api_version': config.api_version,
    'api_key': config.api_key_public,
    'use_analytics': config.use_analytics,
    'style_url': config.style_url,
    'cms_url': config.cms_url,
    'context': get_context,
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
    'cycles': get_cycles(),
    'assets': assets,
    'asset_for': asset_for,
    'base_path': get_base_path,
    'production': config.production,
    'staging': config.staging
})


@app.route('/')
def search():
    query = request.args.get('search')
    if query:
        result_type = request.args.get('search_type') or 'candidates'
        results = load_search_results(query, result_type)
        return views.render_search_results(results, query, result_type)
    else:
        return render_template('search.html', page='home', dates=utils.date_ranges())


@app.route('/api/')
def api():
    """Redirect to API as described at
    https://18f.github.io/API-All-the-X/pages/developer_hub_kit.
    """
    return redirect(config.api_location, http.client.MOVED_PERMANENTLY)


@app.route('/developers/')
def developers():
    """Redirect to developer portal as described at
    https://18f.github.io/API-All-the-X/pages/developer_hub_kit.
    """
    url = furl.furl(config.api_location)
    url.path.add('developers')
    return redirect(url.url, http.client.MOVED_PERMANENTLY)


@app.route('/candidate/<c_id>/')
@use_kwargs({
    'cycle': fields.Int(),
})
def candidate_page(c_id, cycle=None):
    """Fetch and render data for candidate detail page.

    :param int cycle: Optional cycle for associated committees and financials.
    """
    candidate, committees, cycle = load_with_nested('candidate', c_id, 'committees', cycle)
    return views.render_candidate(candidate, committees, cycle)


@app.route('/committee/<c_id>/')
@use_kwargs({
    'cycle': fields.Int(),
})
def committee_page(c_id, cycle=None):
    """Fetch and render data for committee detail page.

    :param int cycle: Optional cycle for financials.
    """
    committee, candidates, cycle = load_with_nested('committee', c_id, 'candidates', cycle)
    return views.render_committee(committee, candidates, cycle)


@app.route('/candidates/')
def candidates():
    return render_template('candidates.html', result_type='candidates')


@app.route('/committees/')
def committees():
    return render_template(
        'committees.html',
        result_type='committees',
        dates=utils.date_ranges(),
    )


@app.route('/receipts/')
def receipts():
    return render_template('receipts.html', dates=utils.date_ranges())


@app.route('/disbursements/')
def disbursements():
    return render_template('disbursements.html', dates=utils.date_ranges())


@app.route('/filings/')
def filings():
    return render_template(
        'filings.html',
        dates=utils.date_ranges(),
        result_type='committees',
    )


@app.route('/elections/')
def election_lookup():
    return render_template('election-lookup.html')


@app.route('/elections/<office>/<int:cycle>/')
@app.route('/elections/<office>/<state>/<int:cycle>/')
@app.route('/elections/<office>/<state>/<district>/<int:cycle>/')
def elections(office, cycle, state=None, district=None):
    if office.lower() not in ['president', 'senate', 'house']:
        abort(404)
    if state and state.upper() not in constants.states:
        abort(404)
    cycles = get_cycles()
    if office.lower() == 'president':
        cycles = [each for each in cycles if each % 4 == 0]
    return render_template(
        'elections.html',
        office=office,
        cycle=cycle,
        cycles=cycles,
        state=state,
        state_full=constants.states[state.upper()] if state else None,
        district=district,
        title=election_title(cycle, office, state, district),
    )


app.add_url_rule('/issue/', view_func=views.GithubView.as_view('issue'))


def election_title(cycle, office, state=None, district=None):
    base = ' '.join([str(cycle), 'Election', 'United States', office.capitalize()])
    parts = [base]
    if state:
        parts.append(constants.states[state.upper()])
    if district:
        parts.append('District {0}'.format(district))
    return ' - '.join(parts)


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500


@app.template_filter('currency')
def currency_filter(num, grouping=True):
    if isinstance(num, (int, float)):
        return locale.currency(num, grouping=grouping)
    return None


def ensure_date(value):
    if isinstance(value, (datetime.date, datetime.datetime)):
        return value
    return parse_date(value)


@app.template_filter('date')
def date_filter(value, fmt='%m/%d/%Y'):
    if value is None:
        return None
    return ensure_date(value).strftime(fmt)


@app.template_filter('json')
def json_filter(value):
    return json.dumps(value)


def _unique(values):
    ret = []
    for value in values:
        if value not in ret:
            ret.append(value)
    return ret


def _fmt_chart_tick(value):
    return parse_date(value).strftime('%m/%d/%y')


@app.template_filter('fmt_chart_ticks')
def fmt_chart_ticks(group, keys):
    if not group or not keys:
        return ''
    if isinstance(keys, (list, tuple)):
        values = [_fmt_chart_tick(group[key]) for key in keys]
        values = _unique(values)
        return ' – '.join(values)
    return _fmt_chart_tick(group[keys])


@app.template_filter()
def fmt_year_range(year):
    if type(year) == int:
        return "{}–{}".format(year - 1, year)
    return None


@app.template_filter()
def fmt_report_desc(report_full_description):
    if report_full_description:
        return re.sub('{.+}', '', report_full_description)


@app.template_filter()
def restrict_cycles(value, start_year=START_YEAR):
    return [each for each in value if start_year <= each <= utils.current_cycle()]


@app.template_filter()
def fmt_state_full(value):
    return constants.states[value.upper()]

# If HTTPS is on, apply full HSTS as well, to all subdomains.
# Only use when you're sure. 31536000 = 1 year.
if config.force_https:
    sslify = SSLify(app, permanent=True, age=31536000, subdomains=True)


if config.production:
    app.config['PREFERRED_URL_SCHEME'] = 'https'


# Note: Apply basic auth check after HTTPS redirect so that users aren't prompted
# for credentials over HTTP; h/t @noahkunin.
if not config.test:
    app.config['BASIC_AUTH_USERNAME'] = config.username
    app.config['BASIC_AUTH_PASSWORD'] = config.password
    app.config['BASIC_AUTH_FORCE'] = True
    basic_auth = BasicAuth(app)


app.wsgi_app = utils.ReverseProxied(app.wsgi_app)
app.wsgi_app = ProxyFix(app.wsgi_app)


if __name__ == '__main__':
    files = ['./rev-manifest.json']
    app.run(host=config.host, port=int(config.port), debug=config.debug, extra_files=files)
