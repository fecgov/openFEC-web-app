import http

import furl
from webargs import Arg
from webargs.flaskparser import use_kwargs
from dateutil.parser import parse as parse_date

from flask import Flask, render_template, request, redirect
from flask_sslify import SSLify
from flask.ext.basicauth import BasicAuth

from openfecwebapp import utils
from openfecwebapp import config
from openfecwebapp.views import render_search_results, render_candidate, render_committee
from openfecwebapp.api_caller import load_search_results, load_with_nested

import jinja2
import json
import locale
import logging
import re


locale.setlocale(locale.LC_ALL, '')

START_YEAR = 1979

app = Flask(__name__)

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


app.jinja_env.globals.update({
    'min': min,
    'max': max,
    'api_location': config.api_location_public,
    'api_version': config.api_version,
    'api_key': config.api_key_public,
    'use_analytics': config.use_analytics,
    'context': get_context,
    'absolute_url': get_absolute_url,
    'contact_email': '18F-FEC@gsa.gov',
    'default_cycles': _get_default_cycles(),
    'series_has_data': series_has_data,
    'group_has_data': group_has_data,
    'series_group_has_data': series_group_has_data,
})


try:
    app.jinja_env.globals['assets'] = json.load(open('./rev-manifest.json'))
except OSError:
    logger.error(
        'Manifest "rev-manifest.json" not found. Did you remember to run '
        '"npm run build"?'
    )
    raise


@app.route('/')
def search():
    query = request.args.get('search')
    if query:
        result_type = request.args.get('search_type') or 'candidates'
        results = load_search_results(query, result_type)
        return render_search_results(results, query, result_type)
    else:
        return render_template('search.html', page='home')


@app.route('/api')
def api():
    """Redirect to API as described at
    https://18f.github.io/API-All-the-X/pages/developer_hub_kit.
    """
    return redirect(config.api_location, http.client.MOVED_PERMANENTLY)


@app.route('/developers')
def developers():
    """Redirect to developer portal as described at
    https://18f.github.io/API-All-the-X/pages/developer_hub_kit.
    """
    url = furl.furl(config.api_location)
    url.path.add('developers')
    return redirect(url.url, http.client.MOVED_PERMANENTLY)


@app.route('/candidate/<c_id>')
@use_kwargs({
    'cycle': Arg(int),
})
def candidate_page(c_id, cycle=None):
    """Fetch and render data for candidate detail page.

    :param int cycle: Optional cycle for associated committees and financials.
    """
    candidate, committees, cycle = load_with_nested('candidate', c_id, 'committees', cycle)
    return render_candidate(candidate, committees, cycle)


@app.route('/committee/<c_id>')
@use_kwargs({
    'cycle': Arg(int),
})
def committee_page(c_id, cycle=None):
    """Fetch and render data for committee detail page.

    :param int cycle: Optional cycle for financials.
    """
    committee, candidates, cycle = load_with_nested('committee', c_id, 'candidates', cycle)
    return render_committee(committee, candidates, cycle)


@app.route('/candidates')
def candidates():
    return render_template('candidates.html', result_type='candidates')


@app.route('/committees')
def committees():
    return render_template('committees.html', result_type='committees')


@app.route('/donations')
def donations():
    return render_template('donations.html', dates=utils.date_ranges())


@app.route('/expenditures')
def expenditures():
    return render_template('expenditures.html')


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


@app.template_filter('date')
def date_filter(value, fmt='%m/%d/%Y'):
    return value.strftime(fmt)


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


@app.template_filter('date_sm')
def date_filter_sm(date_str):
    if not date_str:
        return ''
    return parse_date(date_str).strftime('%m/%y')


@app.template_filter('date_md')
def date_filter_md(date_str):
    if not date_str:
        return ''
    return parse_date(date_str).strftime('%b %Y')


@app.template_filter()
def fmt_year_range(year):
    if type(year) == int:
        return "{} - {}".format(year - 1, year)
    return None


@app.template_filter()
def fmt_report_desc(report_full_description):
    if report_full_description:
        return re.sub('{.+}', '', report_full_description)


@app.template_filter()
def restrict_cycles(value, start_year=START_YEAR):
    return [each for each in value if start_year <= each <= utils.current_cycle()]


# If HTTPS is on, apply full HSTS as well, to all subdomains.
# Only use when you're sure. 31536000 = 1 year.
if config.force_https:
    sslify = SSLify(app, permanent=True, age=31536000, subdomains=True)


if config.server_name:
    app.config['SERVER_NAME'] = config.server_name


if config.production:
    app.config['PREFERRED_URL_SCHEME'] = 'https'


# Note: Apply basic auth check after HTTPS redirect so that users aren't prompted
# for credentials over HTTP; h/t @noahkunin.
if not config.test:
    app.config['BASIC_AUTH_USERNAME'] = config.username
    app.config['BASIC_AUTH_PASSWORD'] = config.password
    app.config['BASIC_AUTH_FORCE'] = True
    basic_auth = BasicAuth(app)


if __name__ == '__main__':
    files = ['./rev-manifest.json']
    app.run(host=config.host, port=int(config.port), debug=config.debug, extra_files=files)
