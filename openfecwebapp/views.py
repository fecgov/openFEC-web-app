from openfecwebapp.api_caller import load_totals
from flask import render_template
from openfecwebapp.data_mappings import (type_map, 
map_committee_table_values, 
map_candidate_page_values, map_totals, committee_type_map,
generate_pagination_values)
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
def render_table(data_type, results, params, url):
    # if we didn't get data back from the API
    if not results:
        abort(500)

    results_table = {}
    results_table[data_type] = []
    heading = "Browse " + data_type

    results_table['pagination'] = generate_pagination_values(results, params, url, data_type)

    for r in results['results']:
        results_table[data_type].append(type_map[data_type](r))

    return render_template(data_type + '.html', **results_table)

def render_page(data_type, c_data):
    # not handling error at api module because sometimes its ok to 
    # not get data back - like with search results
    if not 'results' in c_data or not c_data['results']:
        abort(500)

    tmpl_vars = type_map[data_type](c_data['results'][0])

    if data_type == 'candidate':
        if tmpl_vars.get('primary_committee'):
            t_data = load_totals(tmpl_vars['primary_committee']['id'])
            tmpl_vars['primary_committee']['totals'] = map_totals(
                t_data)

        if tmpl_vars.get('affiliated_committees'):
            committee_ids = []
            for cmte in tmpl_vars['affiliated_committees'].values():
                if cmte['designation_code'] in committee_type_map: 
                    committee_ids.append(cmte['id'])
                    cmte_type = committee_type_map[
                        cmte['designation_code']]

            results = load_totals(",".join(committee_ids))
            for r in results['results']:
                c_id = r['committee_id']
                tmpl_vars[cmte_type][c_id]['totals'] = map_totals(
                    results)

    return render_template(data_type + 's-single.html', **tmpl_vars)
