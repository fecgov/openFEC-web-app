import os
from urllib import parse

import requests

from openfecwebapp import utils
from openfecwebapp.config import api_location, api_version, api_key


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


def load_search_results(query, query_type='candidates'):
    filters = {}

    if query:
        filters['q'] = query

    url = '/' + query_type
    if query_type == 'candidates':
        url += '/search'
    results = _call_api(url, **filters)

    return results['results'] if len(results) else []


def load_single_type(data_type, c_id, *path, **filters):
    return _call_api(data_type, c_id, *path, **filters)


def load_nested_type(parent_type, c_id, nested_type, *path, **filters):
    return _call_api(parent_type, c_id, nested_type, *path, per_page=100, **filters)


def load_with_nested(primary_type, primary_id, secondary_type, cycle=None):
    path = ('history', str(cycle)) if cycle else ()
    data = load_single_type(primary_type, primary_id, *path)
    cycle = cycle or min(utils.current_cycle(), max(data['results'][0]['cycles']))
    path = ('history', str(cycle))
    nested_data = load_nested_type(primary_type, primary_id, secondary_type, *path)
    return data, nested_data['results']


def load_cmte_financials(committee_id, **filters):
    filters.update({
        'per_page': MAX_FINANCIALS_COUNT,
        'report_type': filters.get('report_type', []) + ['-TER']
    })

    reports = _call_api('committee', committee_id, 'reports', **filters)
    totals = _call_api('committee', committee_id, 'totals', **filters)

    return {
        'reports': reports['results'],
        'totals': totals['results'],
    }


def install_cache():
    import requests_cache
    requests_cache.install_cache()
