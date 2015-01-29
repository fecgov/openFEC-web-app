from openfecwebapp.api import (load_search_results, load_single_type,
load_totals)
from flask import render_template
from openfecwebapp.data_mappings import (type_map, 
map_candidate_table_values, map_committee_table_values, 
map_candidate_page_values, map_totals, committee_type_map,
generate_pagination_values)
from werkzeug.exceptions import abort

def _filter_empty_params(params):
    new_params = {}
    for p in params:
        if params[p]:
            new_params[p] = params[p]

    return new_params

def render_search_results(query):
    results = load_search_results(query)
    candidates = []
    committees = []

    if results.get('candidates') and results['candidates'].get(
        'results'):
        for c in results['candidates']['results']:
            candidates.append(map_candidate_table_values(c))

    if results.get('committees') and results['committees'].get(
        'results'):
        for c in results['committees']['results']:
            committees.append(map_committee_table_values(c))

    # if true will show "no results" message
    no_results = True if not len(candidates) and not len(committees) else False

    return render_template('search-results.html', candidates=candidates,
        committees=committees, query=query, no_results=no_results)

# loads browse tabular views
def render_table(data_type, params, url):
    # move from immutablemultidict -> multidict -> dict
    params = params.copy().to_dict()
    params = _filter_empty_params(params)
    params['fields'] = '*'

    results = load_single_type(data_type, params)

    # if we didn't get data back from the API
    if len(results) is 0:
        abort(500)

    results_table = {}
    results_table[data_type] = []
    heading = "Browse " + data_type

    results_table['pagination'] = generate_pagination_values(results, params, url, data_type)

    for r in results['results']:
        results_table[data_type].append(type_map[data_type](r))

    return render_template(data_type + '.html', **results_table)

def render_page(data_type, c_id):
    c_data = load_single_type(data_type, {
        'fields': '*', data_type + '_id': c_id}) 

    # not handling error at api module because sometimes its ok to 
    # not get data back - like with search results
    if len(c_data) is 0:
        abort(500)

    tmpl_vars = type_map[data_type](c_data['results'][0])

    if data_type == 'candidate':
        if tmpl_vars.get('primary_committee'):
            t_data = load_totals(tmpl_vars['primary_committee']['id'])
            tmpl_vars['primary_committee']['totals'] = map_totals(
                t_data)

        if tmpl_vars.get('affiliated_committees'):
            # for each type of committee we show, get the totals data
            for t in committee_type_map:
                c_type = committee_type_map[t] 
                for i in range(len(tmpl_vars[c_type])):
                    results = load_totals(tmpl_vars[c_type][i]['id'])
                    if len(results['results']) > 0:
                        tmpl_vars[c_type][i]['totals'] = map_totals(
                            results)

    return render_template(data_type + 's-single.html', **tmpl_vars)
