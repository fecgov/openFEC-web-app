from flask import render_template
from marshmallow import pprint
from openfecwebapp.data_prep.candidates import CandidateSchema
from openfecwebapp.data_prep.committees import CommitteeSchema
from openfecwebapp.data_prep.shared import generate_pagination_values
from openfecwebapp.data_prep.financial_summaries import add_cmte_financial_data

from werkzeug.exceptions import abort

def render_search_results(results, query):
    candidates = []
    committees = []

    if results.get('candidates'):
        for c in results['candidates'].get('results', []):
            candidates.append(c)

    if results.get('committees'):
        for c in results['committees'].get('results', []):
            committees.append(c)

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

    results_table['pagination'] = generate_pagination_values(
        results, params, data_type)

    for r in results['results']:
        results_table[data_type].append(type_map[data_type](r))

    if params.get('name'):
        results_table['filter_name'] = params['name']

    return render_template(data_type + '.html', **results_table)

type_map = {
    'candidates': lambda x: x,
    'candidate': lambda x: CandidateSchema().dump(x).data,
    'committees': lambda x: x,
    'committee': lambda x: CommitteeSchema().dump(x).data
}

def render_page(data_type, *args, **kwargs):
    c_data = args[0]
    # not handling error at api module because sometimes its ok to 
    # not get data back - like with search results
    if not 'results' in c_data or not c_data['results']:
        abort(500)

    data = c_data['results'][0]
    #data.update(kwargs)

    if data_type == 'candidate': 
        candidate_schema = CandidateSchema()
        tmpl_vars = candidate_schema.load(data).data
        committees = CommitteeSchema(
                only=['committee_id', 'name', 'designation_full', 'designation', 'committee_type_full', 'committee_type', 'url', 'is_primary', 'is_authorized'],
                many=True, 
                skip_missing=True
            ).dump(kwargs['committees']).data
        tmpl_vars['has_authorized'] = bool([x for x in committees if x['is_authorized']])
        tmpl_vars['committees'] = committees
        pprint(tmpl_vars)
    elif data_type == 'committee':
        committee_schema = CommitteeSchema()
        tmpl_vars = committee_schema.load(data).data
        tmpl_vars['candidates'] = CandidateSchema(
                only=['candidate_id', 'name'], 
                many=True, 
                skip_missing=True
            ).dump(kwargs['candidates']).data
        pprint(tmpl_vars)
    else:
        tmpl_vars = data
    #print("Final:")
    #pprint(tmpl_vars)
    #tmpl_vars.update(add_cmte_financial_data(data, data_type))

    return render_template(data_type + 's-single.html', **tmpl_vars)
