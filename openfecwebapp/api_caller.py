import requests

from openfecwebapp.config import api_location

def _call_api(url, filters):
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
    url = api_location + '/' + data_type

    return _call_api(url, filters)

def load_single_type(data_type, c_id):
    url = api_location + '/' + data_type + '/' + c_id
    filters = {'year': '*'}

    return _call_api(url, filters)

def load_cmte_financials(committee_id):
    r_url = api_location + '/committee/' + committee_id + '/reports'
    t_url = api_location + '/committee/' + committee_id + '/totals'
    reports = _call_api(r_url, {})
    totals = _call_api(t_url, {})
    cmte_financials = {}
    cmte_financials['reports'] = reports['results']
    cmte_financials['totals'] = totals['results']
    return cmte_financials

def install_cache():
    import requests_cache
    requests_cache.install_cache()
