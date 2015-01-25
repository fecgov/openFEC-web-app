from api import load_search_results, load_candidates, load_committees
from flask import render_template

def get_search_results(query):
    results = load_search_results(query)
    candidates = []
    committees = []

    for c in results['candidates']['results']:
        candidates.append(convert_candidates(c))

    for c in results['committees']['results']:
        committees.append(convert_committees(c))

    return render_template('search-results.html', **locals())

def get_candidates(params):
    # move from immutablemultidict -> multidict -> dict
    params = params.copy().to_dict()
    params['fields'] = '*'

    results = load_candidates(params)
    candidates = []
    heading = "Browse candidates"

    for c in results['results']:
        candidates.append(convert_candidates(c))

    return render_template('candidates.html', **locals())

def get_committees():
    results = load_committees()
    committees = []
    heading = "Browse committees"

    for c in results['results']:
        committees.append(convert_committees(c))

    return render_template('committees.html', **locals())

def convert_candidates(c):
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

def convert_committees(c):
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
