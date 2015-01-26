from api import load_search_results, load_single_type, load_totals
from flask import render_template
from data_mappings import type_map, map_candidate_table_values, map_committee_table_values, map_candidate_page_values, map_totals

def render_search_results(query):
    results = load_search_results(query)
    candidates = []
    committees = []

    for c in results['candidates']['results']:
        candidates.append(map_candidate_table_values(c))

    for c in results['committees']['results']:
        committees.append(map_committee_table_values(c))

    return render_template('search-results.html', **locals())

def render_table(data_type, params):
    # move from immutablemultidict -> multidict -> dict
    params = params.copy().to_dict()
    params['fields'] = '*'

    results = load_single_type(data_type, params)
    vars()[data_type] = []
    heading = "Browse " + data_type

    for r in results['results']:
        vars()[data_type].append(type_map[data_type](r))

    return render_template(data_type + '.html', **locals())

def render_page(data_type, c_id):
    c_data = load_single_type(data_type, {
        'fields': '*', data_type + '_id': c_id}) 

    tmpl_vars = type_map[data_type](c_data['results'][0])

    if data_type == 'candidate':
        t_data = load_totals(tmpl_vars['primary_committee']['id'])
        tmpl_vars['totals'] = map_totals(t_data)

    for v in tmpl_vars:
        vars()[v] = tmpl_vars[v]

    return render_template(data_type + 's-single.html', **locals())
