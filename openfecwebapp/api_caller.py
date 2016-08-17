import os
from urllib import parse

import requests
import cachecontrol
from flask import abort

from openfecwebapp import utils
from openfecwebapp import config

from collections import OrderedDict

MAX_FINANCIALS_COUNT = 4


session = requests.Session()
http_adapter = requests.adapters.HTTPAdapter(max_retries=2)
session.mount('https://', http_adapter)

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

def load_legal_search_results(query, query_type='all', offset=0, limit=20):
    filters = {}
    if query:
        filters['q'] = query
        filters['hits_returned'] = limit
        filters['type'] = query_type
        filters['from_hit'] = offset

    url = '/legal/search/'
    results = _call_api(url, **filters)
    results['limit'] = limit
    results['offset'] = offset

    if 'advisory_opinions' in results:
        grouped_aos = OrderedDict({})
        for ao in results['advisory_opinions']:
            if ao['no'] in grouped_aos:
                grouped_aos[ao['no']].append(ao)
            else:
                grouped_aos[ao['no']] = [ao]

    for ao_no in grouped_aos:
        grouped_aos[ao_no].sort(key=lambda ao: ao['date'], reverse=True)
    results['advisory_opinions'] = grouped_aos
    return results


def load_legal_advisory_opinion(ao_no):
    url = '/legal/advisory_opinion/'
    results = _call_api(url, parse.quote(ao_no))

    if not (results and 'docs' in results):
        return None

    # sort by chronological date
    documents = sorted(results['docs'], key=lambda doc: doc['date'])
    if not (documents and len(documents)):
        return None

    for document in documents:
        canonical_document = document
        if document['category'] == 'Final Opinion':
            break        
    
    if not canonical_document:
        return None
    
    advisory_opinion = {
        'no' : ao_no,
        'date': canonical_document['date'],
        'name': canonical_document['name'],
        'summary': canonical_document['summary'],
        'description': canonical_document['description'],
        'url': canonical_document['url'],
        'category' : canonical_document['category'],
        'documents': documents,
        'entities': [],
    }

    return advisory_opinion


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

def landing_mock_data():
    return {
        'raising': {
            'total': 4676956435.04,
            'candidates': 1665946695.00,
            'pacs': 2243677389.00,
            'parties': 764080071.50,
            'other': 3252279.54
        },
        'spending': {
            'total': 2411307904.24,
            'candidates': 1479430004.00,
            'pacs': 878776312.70,
            'parties': 803844.00,
            'other': 52297743.54
        }
    }

def load_top_candidates(sort):
        response = _call_api(
            'candidates', 'totals',
            sort_hide_null=True, election_year=2016, cycle=2016, election_full=False, sort=sort, per_page=5
        )
        if response['results']:
            return response['results']
        return {}

def load_top_pacs(sort):
        response = _call_api(
            'totals', 'pac',
            sort_hide_null=True, cycle=2016, sort=sort, per_page=5
        )
        if response['results']:
            return response['results']
        return {}

def load_top_parties(sort):
        response = _call_api(
            'totals', 'party',
            sort_hide_null=True, cycle=2016, sort=sort, per_page=5
        )
        if response['results']:
            return response['results']
        return {}
