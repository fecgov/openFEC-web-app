import requests
import json

from config import api_location

def load_search_results(query):
    filters = {'fields': '*', 'per_page': '5'}

    if query:
        filters['q'] = query

    candidates = requests.get(api_location + '/candidate', params=filters)
    committees = requests.get(api_location + '/committee', params=filters)

    return {
        'candidates': json.loads(candidates.text),
        'committees': json.loads(committees.text)
    }

def load_candidates():
    filters = {'fields': '*'}
    candidates = requests.get(api_location + '/candidate',
        params=filters)

    return json.loads(candidates.text)
