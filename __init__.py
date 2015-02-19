from openfecwebapp.local_config import port, debug, host
from flask import Flask, render_template, request
from openfecwebapp.views import (render_search_results, render_table,
    render_page)
from openfecwebapp.api_caller import (load_search_results,
    load_single_type, load_totals, load_single_type_summary,
    install_cache)

app = Flask(__name__)

def _add_fields_star(params):
    # move from immutablemultidict -> multidict -> dict
    params = params.copy().to_dict()
    params = {key: value for key, value in params.items() if value}
    params['fields'] = '*'

    return params

@app.route('/')
def search():
    query = request.args.get('search')
    if query:
        return render_search_results(load_search_results(query), query)
    else:
        return render_template('search.html');

@app.route('/candidates/<c_id>')
def candidate_page(c_id):
    data = load_single_type('candidate', c_id)
    return render_page('candidate', data)

@app.route('/committees/<c_id>')
def committee_page(c_id):
    data = load_single_type('committee', c_id)
    return render_page('committee', data)

@app.route('/candidates')
def candidates():
    params = _add_fields_star(request.args)
    results = load_single_type_summary('candidate', params)

    return render_table('candidates', results, params, request.url)

@app.route('/committees')
def committees():
    params = _add_fields_star(request.args)
    results = load_single_type_summary('committee', params)

    return render_table('committees', results, params, request.url)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    import sys
    if '--cached' in sys.argv:
        install_cache()
    app.run(host=host, port=int(port), debug=debug)
