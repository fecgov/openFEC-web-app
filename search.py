from api import load_search_results, load_single_type
from flask import render_template

def _convert_candidate_values(c):
    return {
        'name': c['name']['full_name'],
        'office': c['elections'][0]['office_sought_full'],
        'election': int(c['elections'][0]['election_year']),
        'party': c['elections'][0]['party_affiliation'],
        'state': c['elections'][0]['state'],
        'district': int(c['elections'][0]['district']) if c['elections'][0]['district'] else '',
        'nameURL': '/candidates/' + c['candidate_id'],
        'id': c['candidate_id']
    }

def _convert_committee_values(c):
    return {
        'name': c['description']['name'],
        'treasurer': c['treasurer']['name_full'] if 
            c.get('treasurer') else '',
        'state': c['address']['state'],
        'organization': c['description'].get(
            'organization_type_full', ''),
        'type': c['status']['type_full'],
        'designation': c['status']['designation_full'],
        'nameURL': '/committees/' + c['committee_id'],
        'id': c['committee_id']
    }

type_map = {
    'candidates': _convert_candidate_values,
    'committees': _convert_committee_values
}

def get_search_results(query):
    results = load_search_results(query)
    candidates = []
    committees = []

    for c in results['candidates']['results']:
        candidates.append(_convert_candidate_values(c))

    for c in results['committees']['results']:
        committees.append(_convert_committee_values(c))

    return render_template('search-results.html', **locals())

def render(data_type, params):
    # move from immutablemultidict -> multidict -> dict
    params = params.copy().to_dict()
    params['fields'] = '*'

    results = load_single_type(data_type, params)
    vars()[data_type] = []
    heading = "Browse " + data_type

    for r in results['results']:
        vars()[data_type].append(type_map[data_type]((r)))

    return render_template(data_type + '.html', **locals())
