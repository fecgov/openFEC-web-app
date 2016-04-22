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
        filters['sort'] = ['-receipts']

    url = '/' + query_type
    if query_type == 'candidates':
        url += '/search'
    results = _call_api(url, **filters)

    return results['results'] if len(results) else []

def _transform_advisory_opinion(advisory_opinion):
    #TODO move this to the API
    source = advisory_opinion['_source']
    return {
        'id': source.get('AO_Id'),
        'no' : source.get('AO_No'),
        'name': source.get('AO_name'),
        'summary': source.get('AO_Summary'),
        'tags': source.get('AO_tags'),
        'description': source.get('description'),
        'doc_id': source.get('doc_id'),
        'highlights': advisory_opinion.get('highlight', {}).get('text', []),
        'pdf_url': advisory_opinion.get('pdf_url'),
    }


def _transform_legal_search_results(response):
    #TODO move this to the API
    data = response.get('results', [])
    count = response.get('count', -1)

    results = {}
    results['advisory_opinions'] = [_transform_advisory_opinion(i) for i in data if i['_type'] == 'ao']
    results['regulations'] = [i for i in data if i['_type'] == 'regulation']
    results['murs'] = [i for i in data if i['_type'] == 'mur']
    results['total_advisory_opinions'] = len(results['advisory_opinions'])
    results['total_regulations'] = 0
    results['total_murs'] = 0

    if count != -1:
        # This version of the API won't always return count
        results['total_advisory_opinions'] = count

    return results


def load_legal_search_results(query, query_type='all', offset=0, limit=20):
    filters = {}

    if query:
        filters['q'] = query
        filters['limit'] = limit
        filters['type'] = query_type
        filters['from_hit'] = offset

    url = '/legal/search'
    results = _call_api(url, **filters)

    if query_type == 'aos':
        results['results'] = [_transform_advisory_opinion(ao) for ao in results.get('results', [])]
    else:
        results = _transform_legal_search_results(results)

    results['limit'] = limit
    results['offset'] = offset

    return results


def load_single_type(data_type, c_id, *path, **filters):
    data = _call_api(data_type, c_id, *path, **filters)
    return result_or_404(data)


def load_nested_type(parent_type, c_id, nested_type, *path, **filters):
    return _call_api(parent_type, c_id, nested_type, *path, per_page=100, **filters)


def load_with_nested(primary_type, primary_id, secondary_type, cycle=None,
                     cycle_key='cycle', **query):
    path = ('history', str(cycle)) if cycle else ('history', )
    data = load_single_type(primary_type, primary_id, *path, per_page=1, **query)
    cycle = cycle or max(data['cycles'])
    path = ('history', str(data[cycle_key]))
    nested_data = load_nested_type(primary_type, primary_id, secondary_type, *path, **query)
    return data, nested_data['results'], cycle


def load_cmte_financials(committee_id, **filters):
    filters.update({
        'is_amended': 'false',
        'per_page': MAX_FINANCIALS_COUNT,
        'report_type': filters.get('report_type', []) + ['-TER'],
        'sort_hide_null': 'true',
    })

    reports = _call_api('committee', committee_id, 'reports', **filters)
    totals = _call_api('committee', committee_id, 'totals', **filters)

    return {
        'reports': reports['results'],
        'totals': totals['results'],
    }


def load_candidate_totals(candidate_id, cycle, election_full=True):
    response = _call_api(
        'candidates', 'totals',
        candidate_id=candidate_id, cycle=cycle, election_full=election_full,
    )
    if response['results']:
        return response['results'][0]
    return {}


def result_or_404(data):
    if not data.get('results'):
        abort(404)
    return data['results'][0]
