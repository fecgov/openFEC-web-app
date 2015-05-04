import os
from urllib import parse

import requests

from openfecwebapp.config import api_location, api_version, api_key


MAX_FINANCIALS_COUNT = 4


def _call_api(path, filters):
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

    return {
        'candidates': load_single_type_summary('candidates', filters),
        'committees': load_single_type_summary('committees', filters)
    }

def load_single_type_summary(data_type, filters):
    url = '/' + data_type
    filters['per_page'] = 30
    return _call_api(url, filters)

def load_single_type(data_type, c_id, filters):
    url = '/' + data_type + '/' + c_id

    return _call_api(url, filters)

def load_cmte_financials(committee_id):
    r_url = '/committee/' + committee_id + '/reports'
    limited_r_url = limit_by_amount(r_url, MAX_FINANCIALS_COUNT)
    t_url = '/committee/' + committee_id + '/totals'
    limited_t_url = limit_by_amount(t_url, MAX_FINANCIALS_COUNT)
    reports = _call_api(limited_r_url, {})
    totals = _call_api(limited_t_url, {})
    cmte_financials = {}
    cmte_financials['reports'] = reports['results']
    cmte_financials['totals'] = totals['results']
    return cmte_financials

def install_cache():
    import requests_cache
    requests_cache.install_cache()

def limit_by_amount(curr_url, amount):
    query = parse.urlencode({'page': 1, 'per_page': amount})
    return '{0}?{1}'.format(curr_url, query)
