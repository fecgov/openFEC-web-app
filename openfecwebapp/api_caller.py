import os
from urllib import parse

import requests

from openfecwebapp.config import api_location, api_version, api_key


MAX_FINANCIALS_COUNT = 4


def _call_api(path, filters={}):
    if api_key:
        filters['api_key'] = api_key

    path = os.path.join(api_version, path.strip('/'))
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


def load_single_type_summary(data_type, filters):
    url = '/' + data_type
    filters['per_page'] = 30
    return _call_api(url, filters)


def load_single_type(data_type, c_id, filters):
    return _call_api(os.path.join(data_type, c_id), filters)


def load_nested_type(parent_type, c_id, nested_type):
    url = os.path.join(parent_type, c_id, nested_type)
    filters = {'year': '*'}

    return _call_api(url, filters)


def load_cmte_financials(committee_id):
    r_url = os.path.join('committee', committee_id, 'reports')
    t_url = os.path.join('committee', committee_id, 'totals')

    filters = {'per_page': MAX_FINANCIALS_COUNT}

    reports = _call_api(r_url, filters)
    totals = _call_api(t_url, filters)

    return {
        'reports': reports['results'],
        'totals': totals['results'],
    }


def load_election_years(candidate_id):
    history = _call_api('/candidate/' + candidate_id + '/history')
    return [x['two_year_period'] for x in history['results']]


def install_cache():
    import requests_cache
    requests_cache.install_cache()
