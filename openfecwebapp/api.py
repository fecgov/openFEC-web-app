import requests

from openfecwebapp.local_config import api_location

# api urls are singular, public urls are plural
type_map = {
    'candidates': 'candidate',
    'committees': 'committee',
    'candidate': 'candidate',
    'committee': 'committee'
}

def load_search_results(query):
    filters = {'fields': '*', 'per_page': '5'}

    if query:
        filters['q'] = query

    return {
        'candidates': load_single_type('candidates', filters),
        'committees': load_single_type('committees', filters)
    }

def load_single_type(data_type, filters):
    results = requests.get(api_location + '/' + type_map[data_type],
        params=filters)

    if results.status_code == requests.codes.ok:
        return results.json()
    else:
        return {}

def load_totals(committee_id):
    results = requests.get(api_location + '/total/' + committee_id,
        params={'fields': '*'})

    if results.status_code == requests.codes.ok:
        return results.json()
    else:
        return {}
