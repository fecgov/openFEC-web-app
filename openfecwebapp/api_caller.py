import requests

from openfecwebapp.local_config import api_location

"""
It speeds up the API calls for totals if we specify
which fields we want
"""
_totals_fields = [
    'receipts',
    'disbursements',
    'cash_on_hand_end_period',
    'debts_owed_by_committee',
    'report_year',
    'election_cycle',
    'report_type_full',
    'total_receipts_period',
    'coverage_end_date_disbursements',
    'total_disbursements_period'
]

_candidate_fields = [
    'affiliated_committees',
    'name'
]

_committee_fields = [
    '*'
]

_fields_map = {
    'candidate': _candidate_fields,
    'committee': _committee_fields
}

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
        'candidates': load_single_type_summary('candidate', filters),
        'committees': load_single_type_summary('committee', filters)
    }

def load_single_type_summary(data_type, filters):
    url = api_location + '/' + data_type

    return _call_api(url, filters)

def load_single_type(data_type, c_id):
    url = api_location + '/' + data_type + '/' + c_id
    fields = _fields_map[data_type]
    filters = {'fields': ",".join(fields)}

    return _call_api(url, filters)

def load_totals(committee_ids):
    url = api_location + '/total'
    params = {
        'committee_id': committee_ids,
        'fields': ",".join(_totals_fields)
    }

    return _call_api(url, params)
