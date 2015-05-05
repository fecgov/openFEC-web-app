from flask import render_template
from marshmallow import pprint
from openfecwebapp.models.candidates import CandidateSchema
from openfecwebapp.models.committees import CommitteeSchema
from openfecwebapp.models.shared import generate_pagination_values
from openfecwebapp.models.financial_summaries import CommitteeFinancials
from openfecwebapp.api_caller import load_cmte_financials
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

    if data_type == 'candidate': 
        candidate_schema = CandidateSchema()
        # candidate fields will be top-level in the template
        tmpl_vars = candidate_schema.dump(data).data

        # process related committees
        committee_fields = ['committee_id', 'name', 'designation_full', 'designation', 'committee_type_full', 'committee_type', 'url', 'is_primary', 'is_authorized']
        committees = CommitteeSchema(only=committee_fields, many=True, skip_missing=True, strict=True) \
            .dump(kwargs['committees']).data

        tmpl_vars['has_authorized'] = bool([x for x in committees if x['is_authorized']])

        # add 'committees' level to template
        for committee in committees:
            committee['financials'] = load_and_format_cmte_financials(committee.committee_id)

        tmpl_vars['committees'] = committees

        # add financial data

    elif data_type == 'committee':
        committee_schema = CommitteeSchema()
        committee = committee_schema.dump(data).data
        # committee fields will be top-level in the template
        tmpl_vars = committee
        # process and add related candidates a level below
        tmpl_vars['candidates'] = CandidateSchema(only=['candidate_id', 'name'], many=True, skip_missing=True, strict=True) \
            .dump(kwargs['candidates']).data

        financials_schema = CommitteeFinancials(skip_missing=True, strict=True)
        results, errors = financials_schema.dump(load_cmte_financials(committee['committee_id']))
        pprint(errors)

        tmpl_vars.update(results)
    else:
        tmpl_vars = data

    pprint(tmpl_vars)
    return render_template(data_type + 's-single.html', **tmpl_vars)

def load_and_format_cmte_financials(committee_id):
    fin_data = load_cmte_financials(committee_id)
    schema = CommitteeFinancials()
    data = schema.dump(fin_data).data
    return data
    
