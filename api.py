import requests
from config import api_location

def load_search_results(query):
    filters = {'fields': '*', 'per_page': '5'}

    if query:
        filters['q'] = query

    candidates = requests.get(api_location + '/candidate', params=filters)
    return candidates.text
