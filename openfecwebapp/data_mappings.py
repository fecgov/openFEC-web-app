import re
import locale

from flask import url_for

locale.setlocale(locale.LC_ALL, '')

def generate_pagination_values(c, params, url, data_type):
    pagination = {}
    per_page = int(c['pagination']['per_page'])
    page = int(c['pagination']['page'])
    current_results_start = per_page * (page - 1) + 1 
    current_results_end = per_page * page
    total_pages = int(c['pagination']['pages'])

    pagination['results_count'] = c['pagination']['count']
    pagination['page'] = page
    pagination['per_page'] = per_page
    pagination['current_results_start'] = current_results_start
    pagination['current_results_end'] = current_results_end

    if current_results_start or current_results_end:
        pagination['results_range'] = True

    if page < total_pages:
        next_page_num = str(page + 1)
        params['page'] = next_page_num
        pagination['next_url'] = url_for(data_type, **params) 
        pagination['pagination_links'] = True

    if page - 1 > 0:
        prev_page_num = str(page - 1)
        params['page'] = prev_page_num
        pagination['prev_url'] = url_for(data_type, **params) 
        pagination['pagination_links'] = True


    return pagination

def map_candidate_table_values(c):
    candidate = {
        'name': c['name']['full_name'],
        'office': c['elections'][0]['office_sought_full'],
        'election': int(c['elections'][0]['election_year']),
        'party': c['elections'][0]['party_affiliation'],
        'state': c['elections'][0]['state'],
        'district': int(c['elections'][0]['district']) 
            if c['elections'][0]['district'] else '',
        'nameURL': '/candidates/' + c['candidate_id'],
        'id': c['candidate_id']
    }

    return candidate

def map_committee_table_values(c):
    committee = {
        'name': c['description']['name'],
        'treasurer': c['treasurer']['name_full'] if 
            c.get('treasurer') else '',
        'state': c['address']['state'],
        'organization': c['description'].get(
            'organization_type_full', ''),
        'type': c['status']['type_full'],
        'designation': c['status']['designation_full'],
        'nameURL': '/committees/' + c['committee_id'],
        'id': c['committee_id']
    }

    return committee

def _map_committee_values(ac):
    c = {}
    c['id'] = ac['committee_id'] 
    c['name'] = ac['committee_name']
    c['designation'] = ac['designation_full']
    c['designation_code'] = ac['designation']
    c['url'] = '/committees/' + ac['committee_id']
    return c

def map_totals(t):
    reports = t['results'][0]['reports'][0]
    totals = t['results'][0]['totals'][0]
    totals_mapped = {}
    if totals.get('receipts'):
        totals_mapped['total_receipts'] = locale.currency(
        totals['receipts'], grouping=True)
    else:
        totals_mapped['total_receipts'] = 'unavailable'

    if totals.get('total_disbursements'):
        totals_mapped['total_disbursements'] = locale.currency(
        totals['disbursements'], grouping=True)
    else:
        totals_mapped['total_disbursements'] = 'unavailable'

    if reports.get('cash_on_hand_end_period'):
        totals_mapped['total_cash'] = locale.currency(
        reports['cash_on_hand_end_period'], grouping=True)
    else:
        totals_mapped['total_cash'] = 'unavailable'

    if reports.get('debts_owed_by_committee'):
        totals_mapped['total_debt'] = locale.currency(
        'debts_owed_by_committee', grouping=True)
    else:
        totals_mapped['total_debt'] = 'unavailable'

    totals_mapped['report_year'] = str(int(reports['report_year']))

    if reports['election_cycle']:
        cycle_minus_one = str(int(reports['election_cycle']) - 1)
        totals_mapped['years_totals'] = cycle_minus_one 
        totals_mapped['years_totals'] += ' - ' 
        totals_mapped['years_totals'] += str(reports['election_cycle'])

    if totals_mapped['report_year']:
        totals_mapped['report_desc'] = 'the ' 
        totals_mapped['report_desc'] += re.sub('{.+}', 
            '', reports['report_type_full']) 
        totals_mapped['report_desc'] += ' report'

    return totals_mapped

committee_type_map = {
    'A': 'authorized_committees',
    'D': 'leadership_committees',
    'J': 'joint_committees'
}

def map_candidate_page_values(c):
    candidate = map_candidate_table_values(c)

    if c.get('elections'):
        c_e = c['elections'][0]
        candidate['incumbent_challenge'] = c_e.get(
            'incumbent_challenge_full', '')
        if c_e['primary_committee']:
            candidate['primary_committee'] = _map_committee_values(
                c_e['primary_committee'])
            candidate['related_committees'] = True

        if c_e.get('affiliated_committees'):
            candidate['affiliated_committees'] = []
            for i in range(len(c_e['affiliated_committees'])):
                candidate['affiliated_committees'].append(
                    _map_committee_values(c_e['affiliated_committees'][i]))

            candidate['authorized_committees'] = []
            candidate['leadership_committees'] = []
            candidate['joint_committees'] = []

            for i in range(len(candidate['affiliated_committees'])):
                cmte = candidate['affiliated_committees'][i]
                cmte_type = cmte['designation_code']
                if (cmte_type in committee_type_map):
                    candidate[committee_type_map[cmte_type]].append(cmte)

    return candidate

def map_committee_page_values(c):
    committee = map_committee_table_values(c)

    if c['address']:
        committee['address'] = {
            'state': c['address'].get('state'),
            'zip': c['address'].get('zip'),
            'city': c['address'].get('city'),
            'street_1': c['address'].get('street_1'),
            'street_2': c['address'].get('street_2')
        }

    return committee

type_map = {
    'candidates': map_candidate_table_values,
    'candidate': map_candidate_page_values,
    'committees': map_committee_table_values,
    'committee': map_committee_page_values
}
