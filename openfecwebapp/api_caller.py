import requests

from openfecwebapp.local_config import api_location

def load_search_results(query):
    filters = {'fields': '*', 'per_page': '5'}

    if query:
        filters['q'] = query

    return {
        'candidates': load_single_type('candidate', filters),
        'committees': load_single_type('committee', filters)
    }

def load_single_type(data_type, filters):
    results = requests.get(api_location + '/' + data_type,
        params=filters)

    if results.status_code == requests.codes.ok:
        return results.json()
    else:
        return {}

def load_totals(committee_ids):
    results = requests.get(api_location + '/total',
        params={'committee_id': committee_ids})

    if results.status_code == requests.codes.ok:
        return results.json()
    else:
        return {}
