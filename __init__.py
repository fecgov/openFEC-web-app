from flask import Flask, render_template, request
from flask.ext.basicauth import BasicAuth
from flask_sslify import SSLify
from dateutil.parser import parse as parse_date
from openfecwebapp.config import (port, debug, host, api_location, api_version, api_key_public,
                                  username, password, test, force_https, analytics)
from openfecwebapp.views import render_search_results, render_table, render_candidate, render_committee
from openfecwebapp.api_caller import load_search_results, load_single_type, load_single_type_summary, load_nested_type, install_cache

import datetime
import jinja2
import json
import locale
import logging
import re
import sys


locale.setlocale(locale.LC_ALL, '')

app = Flask(__name__)

# ===== configure logging =====
logger = logging.getLogger(__name__)
log_level = logging.DEBUG if debug else logging.WARN
logging.basicConfig(level=log_level)


@jinja2.contextfunction
def get_context(c):
    return c


def _get_default_cycles():
    now = datetime.datetime.now().year
    cycle = now + now % 2
    return list(range(cycle - 4, cycle + 2, 2))


app.jinja_env.globals['api_location'] = api_location
app.jinja_env.globals['api_version'] = api_version
app.jinja_env.globals['api_key'] = api_key_public
app.jinja_env.globals['context'] = get_context
app.jinja_env.globals['contact_email'] = '18F-FEC@gsa.gov'
app.jinja_env.globals['default_cycles'] = _get_default_cycles()

try:
    app.jinja_env.globals['assets'] = json.load(open('./rev-manifest.json'))
except OSError:
    logger.error(
        'Manifest "rev-manifest.json" not found. Did you remember to run '
        '"npm run build"?'
    )
    raise

if not test:
    app.config['BASIC_AUTH_USERNAME'] = username
    app.config['BASIC_AUTH_PASSWORD'] = password
    app.config['BASIC_AUTH_FORCE'] = True
    basic_auth = BasicAuth(app)

if analytics:
    app.config['USE_ANALYTICS'] = True


def _convert_to_dict(params):
    """ move from immutablemultidict -> multidict -> dict """
    params = params.copy().to_dict(flat=False)
    return {key: value for key, value in params.items() if value and value != ['']}


@app.route('/')
def search():
    query = request.args.get('search')
    if query:
        candidates, committees = load_search_results(query)
        return render_search_results(candidates, committees, query)
    else:
        return render_template('search.html')


@app.route('/candidate/<c_id>/<cycle>')
def candidate_page_with_cycle(c_id, cycle):
    data = load_single_type('candidate', c_id, {'year': cycle})
    return render_candidate(data)


@app.route('/candidate/<c_id>')
def candidate_page(c_id):
    data = load_single_type('candidate', c_id, {})
    committee_data = load_nested_type('candidate', c_id, 'committees')['results']
    return render_candidate(data, committees=committee_data)


@app.route('/committee/<c_id>')
def committee_page(c_id):
    data = load_single_type('committee', c_id, {})
    candidate_data = load_nested_type('committee', c_id, 'candidates')['results']
    return render_committee(data, candidates=candidate_data)


@app.route('/candidates')
def candidates():
    params = _convert_to_dict(request.args)
    results = load_single_type_summary('candidates', params)
    return render_table('candidates', results, params)


@app.route('/committees')
def committees():
    params = _convert_to_dict(request.args)
    results = load_single_type_summary('committees', params)
    return render_table('committees', results, params)


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500


@app.template_filter('currency')
def currency_filter(num, grouping=True):
    if num is not None:
        return locale.currency(num, grouping=grouping)


@app.template_filter('date_sm')
def date_filter_sm(date_str):
    if not date_str:
        return ''
    return parse_date(date_str).strftime('%m/%y')


@app.template_filter()
def fmt_year_range(year):
    if type(year) == int:
        return "{} - {}".format(year - 1, year)
    return None


@app.template_filter()
def fmt_report_desc(report_full_description):
    if report_full_description is not None:
        return re.sub('{.+}', '', report_full_description)


# If HTTPS is on, apply full HSTS as well, to all subdomains.
# Only use when you're sure. 31536000 = 1 year.
if force_https:
    sslify = SSLify(app, permanent=True, age=31536000, subdomains=True)

if __name__ == '__main__':
    if '--cached' in sys.argv:
        install_cache()
    files = ['./rev-manifest.json']
    app.run(host=host, port=int(port), debug=debug, extra_files=files)
