import os
from urllib import parse

import requests
import cachecontrol
from flask import abort

from openfecwebapp import utils
from openfecwebapp import config


MAX_FINANCIALS_COUNT = 4


session = requests.Session()

if config.cache:
    cachecontrol.CacheControl(session, cache=utils.LRUCache(config.cache_size))


def _call_api(*path_parts, **filters):
    if config.api_key:
        filters['api_key'] = config.api_key

    path = os.path.join(config.api_version, *[x.strip('/') for x in path_parts])
    url = parse.urljoin(config.api_location, path)

    results = session.get(url, params=filters)

    return results.json() if results.ok else {}


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
    data = _call_api(data_type, c_id, *path, **filters)
    return result_or_404(data)


def load_nested_type(parent_type, c_id, nested_type, *path, **filters):
    return _call_api(parent_type, c_id, nested_type, *path, per_page=100, **filters)


def load_with_nested(primary_type, primary_id, secondary_type, cycle=None, cycle_key='cycles'):
    path = ('history', str(cycle)) if cycle else ()
    data = load_single_type(primary_type, primary_id, *path)
    cycle = cycle or max(data[cycle_key])
    path = ('history', str(cycle))
    nested_data = load_nested_type(primary_type, primary_id, secondary_type, *path)
    return data, nested_data['results'], cycle


def load_cmte_financials(committee_id, **filters):
    filters.update({
        'per_page': MAX_FINANCIALS_COUNT,
        'report_type': filters.get('report_type', []) + ['-TER'],
        'is_amended': 'false',
    })

    reports = _call_api('committee', committee_id, 'reports', **filters)
    totals = _call_api('committee', committee_id, 'totals', **filters)

    return {
        'reports': reports['results'],
        'totals': totals['results'],
    }


def load_candidate_totals(candidate_id, cycle, election_full=True):
    response = _call_api(
        'candidate', candidate_id, 'totals',
        cycle=cycle, election_full=election_full,
    )
    if response['results']:
        return response['results'][0]
    return {}


def result_or_404(data):
    if not data.get('results'):
        abort(404)
    return data['results'][0]
