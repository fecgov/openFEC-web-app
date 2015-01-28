from openfecwebapp.api import (load_search_results, load_single_type,
load_totals)
from flask import render_template
from openfecwebapp.data_mappings import (type_map, 
map_candidate_table_values, map_committee_table_values, 
map_candidate_page_values, map_totals, committee_type_map,
generate_pagination_values)
from werkzeug.exceptions import NotFound

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

    for c in results['candidates']['results']:
        candidates.append(map_candidate_table_values(c))

    for c in results['committees']['results']:
        committees.append(map_committee_table_values(c))

    return render_template('search-results.html', candidates=candidates,
        committees=committees, query=query)

def render_table(data_type, params, url):
    # move from immutablemultidict -> multidict -> dict
    params = params.copy().to_dict()
    params = _filter_empty_params(params)
    params['fields'] = '*'

    results = load_single_type(data_type, params)
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
    # debated doing a 500 instead because its possible a user could
    # have clicked a link and we got back an api request with no data
    # but also that a user typed an incorrect ID in the url 
    try:
        tmpl_vars = type_map[data_type](c_data['results'][0])
    except NotFound:
        abort(404)

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
                    tmpl_vars[c_type][i]['totals'] = map_totals(
                        load_totals(tmpl_vars[c_type][i]['id']))

    return render_template(data_type + 's-single.html', **tmpl_vars)
