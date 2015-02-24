from flask import render_template
from openfecwebapp.data_prep.candidates import map_candidate_page_values
from openfecwebapp.data_prep.committees import map_committee_page_values
from openfecwebapp.data_prep.shared import generate_pagination_values
from openfecwebapp.data_prep.financial_summaries import add_committee_financial_data

from werkzeug.exceptions import abort

def render_search_results(results, query):
    candidates = []
    committees = []

    if results.get('candidates'):
        for c in results['candidates'].get('results', []):
            candidates.append(c)

    if results.get('committees'):
        for c in results['committees'].get('results', []):
            committees.append(map_committee_table_values(c))

    # if true will show "no results" message
    no_results = True if not len(candidates) and not len(committees) else False

    return render_template('search-results.html', candidates=candidates,
        committees=committees, query=query, no_results=no_results)

# loads browse tabular views
def render_table(data_type, results, params):
    # if we didn't get data back from the API
    if not results:
        abort(500)

    results_table = {}
    results_table[data_type] = []
    heading = "Browse " + data_type

    results_table['pagination'] = generate_pagination_values(
        results, params, data_type)

    for r in results['results']:
        results_table[data_type].append(type_map[data_type](r))

    return render_template(data_type + '.html', **results_table)

type_map = {
    'candidates': lambda x: x,
    'candidate': map_candidate_page_values,
    'committees': lambda x: x,
    'committee': map_committee_page_values
}

def render_page(data_type, c_data):
    # not handling error at api module because sometimes its ok to 
    # not get data back - like with search results
    if not 'results' in c_data or not c_data['results']:
        abort(500)

    tmpl_vars = c_data['results'][0]
    tmpl_vars.update(type_map[data_type](c_data['results'][0]))
    tmpl_vars.update(add_committee_financial_data(tmpl_vars, data_type))

    return render_template(data_type + 's-single.html', **tmpl_vars)
