import requests
import json

from openfecwebapp.config import api_location

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

    return json.loads(results.text)

def load_totals(committee_id):
    results = requests.get(api_location + '/total/' + committee_id,
        params={'fields': '*'})

    return json.loads(results.text)
