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

def load_search_results(query):
    filters = {'fields': '*', 'per_page': '5'}

    if query:
        filters['q'] = query

    return {
        'candidates': load_single_type('candidate', filters),
        'committees': load_single_type('committee', filters)
    }

def load_single_type(data_type, filters):
    results = requests.get(api_location + '/' + data_type,
        params=filters)

    if results.status_code == requests.codes.ok:
        return results.json()
    else:
        return {}

def load_totals(committee_ids):
    results = requests.get(api_location + '/total',
        params={
            'committee_id': committee_ids,
            'fields': ",".join(_totals_fields)
        })

    if results.status_code == requests.codes.ok:
        return results.json()
    else:
        return {}
