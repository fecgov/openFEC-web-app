from openfecwebapp.local_config import (port, debug, host, username,
    password)
from flask import Flask, render_template, request
from flask.ext.basicauth import BasicAuth
from openfecwebapp.views import (render_search_results, render_table,
    render_page)
from openfecwebapp.api_caller import (load_search_results,
    load_single_type, load_totals, load_single_type_summary,
    install_cache)

import locale
locale.setlocale(locale.LC_ALL, '')

app = Flask(__name__)

app.config['BASIC_AUTH_USERNAME'] = username
app.config['BASIC_AUTH_PASSWORD'] = password
app.config['BASIC_AUTH_FORCE'] = True

basic_auth = BasicAuth(app)

""" move from immutablemultidict -> multidict -> dict """
def _convert_to_dict(params):
    params = params.copy().to_dict()
    params = {key: value for key, value in params.items() if value}
    return params

@app.route('/')
def search():
    query = request.args.get('search')
    if query:
        return render_search_results(load_search_results(query), query)
    else:
        return render_template('search.html');

@app.route('/candidate/<c_id>')
def candidate_page(c_id):
    data = load_single_type('candidate', c_id)
    return render_page('candidate', data)

@app.route('/committees/<c_id>')
def committee_page(c_id):
    data = load_single_type('committee', c_id)
    return render_page('committee', data)

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

if __name__ == '__main__':
    import sys
    if '--cached' in sys.argv:
        install_cache()
    app.run(host=host, port=int(port), debug=debug)
