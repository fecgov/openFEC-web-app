from openfecwebapp.config import api_location, api_version, api_key
from urllib import parse

import os
import requests


MAX_FINANCIALS_COUNT = 4


def _call_api(*path_parts, **filters):
    if api_key:
        filters['api_key'] = api_key

    path = os.path.join(api_version, *[x.strip('/') for x in path_parts])
    url = parse.urljoin(api_location, path)

    results = requests.get(url, params=filters)

    if results.status_code == requests.codes.ok:
        return results.json()
    else:
        return {}


def load_search_results(query):
    filters = {'per_page': '5'}

    if query:
        filters['q'] = query

    return load_single_type_summary('candidates', filters).get('results', []), \
        load_single_type_summary('committees', filters).get('results', [])

def fake_load_search_results(query, query_type='candidates'):
    filters = {'per_page': '5'}

    if query:
        filters['q'] = query

    results = load_single_type_summary(query_type, filters).get('results', [])
    for result in results:
        opposite_type = 'committees' if query_type == 'candidates' else \
            'candidates'
        opposite_result = load_nested_type(query_type[:-1],
                result[query_type[:-1] + '_id'], opposite_type)['results'][0]
        result[opposite_type[:-1]] = opposite_result

    return results


def load_single_type_summary(data_type, filters):
    url = '/' + data_type
    filters['per_page'] = 30
    return _call_api(url, **filters)


def load_single_type(data_type, c_id, filters):
    return _call_api(data_type, c_id, **filters)


def load_nested_type(parent_type, c_id, nested_type):
    return _call_api(parent_type, c_id, nested_type, per_page=100)


def load_cmte_financials(committee_id):
    filters = {'per_page': MAX_FINANCIALS_COUNT}

    reports = _call_api('committee', committee_id, 'reports', **filters)
    totals = _call_api('committee', committee_id, 'totals', **filters)

    return {
        'reports': reports['results'],
        'totals': totals['results'],
    }


def load_election_years(candidate_id):
    candidate = _call_api('/candidate/', candidate_id)
    return candidate.get('election_years', [])


def install_cache():
    import requests_cache
    requests_cache.install_cache()
