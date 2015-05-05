from openfecwebapp.config import (port, debug, host, api_location,
    api_version, api_key_public, username, password, test,
    force_https, analytics)
from flask import Flask, render_template, request
from flask.ext.basicauth import BasicAuth
from flask_sslify import SSLify
from openfecwebapp.views import (render_search_results, render_table,
    render_page, election_year_str)
from openfecwebapp.api_caller import (load_search_results,
    load_single_type, load_single_type_summary, load_nested_type,
    install_cache)

import datetime
import sys
import locale
import jinja2
locale.setlocale(locale.LC_ALL, '')

app = Flask(__name__)

@jinja2.contextfunction
def get_context(c):
    return c

app.jinja_env.globals['api_location'] = api_location
app.jinja_env.globals['api_version'] = api_version
app.jinja_env.globals['api_key'] = api_key_public
app.jinja_env.globals['context'] = get_context
app.jinja_env.globals['contact_email'] = '18F-FEC@gsa.gov'
app.jinja_env.filters['election_year_str'] = election_year_str

if not test:
    app.config['BASIC_AUTH_USERNAME'] = username
    app.config['BASIC_AUTH_PASSWORD'] = password
    app.config['BASIC_AUTH_FORCE'] = True
    basic_auth = BasicAuth(app)

if analytics:
    app.config['USE_ANALYTICS'] = True

def _convert_to_dict(params):
    """ move from immutablemultidict -> multidict -> dict """
    params = params.copy().to_dict()
    params = {key: value for key, value in params.items() if value}
    return params

@app.route('/')
def search():
    query = request.args.get('search')
    if query:
        candidates, committees = load_search_results(query)
        return render_search_results(candidates, committees, query)
    else:
        return render_template('search.html');

@app.route('/candidate/<c_id>/<cycle>')
def candidate_page_with_cycle(c_id, cycle):
    data = load_single_type('candidate', c_id, {'year': cycle})
    return render_page('candidate', data)

@app.route('/candidate/<c_id>')
def candidate_page(c_id):
    data = load_single_type('candidate', c_id, {})
    committee_data = load_nested_type('candidate', c_id, 'committees')['results']
    return render_page('candidate', data, committees=committee_data)

@app.route('/committee/<c_id>')
def committee_page(c_id):
    data = load_single_type('committee', c_id, {})
    candidate_data = load_nested_type('committee', c_id, 'candidates')['results']
    return render_page('committee', data, candidates=candidate_data)

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

@app.route('/charts')
def charts():
    data = {}
    data['grouped_bar_data'] = [{"cash_on_hand": 217341.3, "debts_owed": 0.0, "disbursements": 78988.83, "receipts": 110402.55, "date": "Q1 - 2012"}, {"cash_on_hand": 208841.3, "debts_owed": 0.0, "disbursements": 78988.83, "receipts": 101902.55, "date": "Q1 - 2012"}, {"cash_on_hand": 185927.58, "debts_owed": 0.0, "disbursements": 10926.53, "receipts": 8555.0, "date": "Q1 - 2012"}, {"cash_on_hand": 232215.95, "debts_owed": 0.0, "disbursements": 28688.71, "receipts": 45715.0, "date": "Q1 - 2012"}, {"cash_on_hand": 188299.11, "debts_owed": 0.0, "disbursements": 87884.86, "receipts": 55309.91, "date": "Q1 - 2012"}, {"cash_on_hand": 216189.66, "debts_owed": 0.0, "disbursements": 172159.64, "receipts": 179508.0, "date": "Q1 - 2012"}, {"cash_on_hand": 215189.66, "debts_owed": 0.0, "disbursements": 172159.64, "receipts": 178508.0, "date": "Q1 - 2012"}, {"cash_on_hand": 204669.17, "debts_owed": 520.18, "disbursements": 58153.97, "receipts": 62568.4, "date": "Q1 - 2012"}]
    data['bar_data'] = map(lambda d: {'debt': d['cash_on_hand']}, data['grouped_bar_data'])
    data['committee'] = {'totals': {'receipts': 500000, 'disbursements': 450000}}
    return render_template('charts.html', **data)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

@app.template_filter('currency')
def currency_filter(num, grouping=True):
    return locale.currency(num, grouping=grouping)

@app.template_filter('date_sm')
def date_filter_sm(date_str):
    if date_str is None or date_str == '':
        return ''
    d = datetime.datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %z')
    return d.strftime('%m/%y')

# If HTTPS is on, apply full HSTS as well, to all subdomains.
# Only use when you're sure. 31536000 = 1 year.
if force_https:
    sslify = SSLify(app, permanent=True, age=31536000, subdomains=True)

if __name__ == '__main__':
    if '--cached' in sys.argv:
        install_cache()
    app.run(host=host, port=int(port), debug=debug)
