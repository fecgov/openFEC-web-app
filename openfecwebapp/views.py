from flask import render_template
from openfecwebapp.models.candidates import CandidateSchema
from openfecwebapp.models.committees import CommitteeSchema
from openfecwebapp.models.shared import generate_pagination_values
from openfecwebapp.api_caller import load_cmte_financials, load_election_years
from werkzeug.exceptions import abort

import re

def render_search_results(candidates, committees, query):
    # if true will show "no results" message
    no_results = not len(candidates) and not len(committees)

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
    if 'results' not in c_data or not c_data['results']:
        abort(500)

    data = c_data['results'][0]

    if data_type == 'candidate':
        candidate_schema = CandidateSchema()
        # candidate fields will be top-level in the template
        tmpl_vars = candidate_schema.dump(data).data
        tmpl_vars['election_years'] = load_election_years(data['candidate_id'])

        # process related committees
        committee_fields = ['committee_id', 'name', 'designation_full', 'designation',
                            'committee_type_full', 'committee_type', 'url', 'is_primary', 'is_authorized']
        committees = CommitteeSchema(only=committee_fields, many=True, skip_missing=True, strict=True) \
            .dump(kwargs['committees']).data

        tmpl_vars['has_authorized'] = bool([x for x in committees if x['is_authorized']])

        # add 'committees' level to template
        for committee in committees:
            committee['financials'] = load_cmte_financials(committee['committee_id'])

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

        financials = load_cmte_financials(committee['committee_id'])
        tmpl_vars['reports'] = financials['reports']
        tmpl_vars['totals'] = financials['totals']
    else:
        tmpl_vars = data

    return render_template(data_type + 's-single.html', **tmpl_vars)


def fmt_year_range(year):
    return "{} - {}".format(year - 1, year)


def fmt_report_desc(report_full_description):
    return re.sub('{.+}', '', report_full_description)
