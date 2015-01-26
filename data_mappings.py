import re

def map_candidate_table_values(c):
    return {
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

def map_committee_table_values(c):
    return {
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
    totals_mapped = {
        'total_receipts': totals['receipts'],
        'total_disbursements': totals['disbursements'],
        'total_cash': reports['cash_on_hand_end_period'],
        'total_debt': reports['debts_owed_by_committee'],
        'report_year': reports['report_year']
    }

    if reports['election_cycle']:
        cycle_minus_one = str(int(reports['election_cycle']) - 1)
        totals_mapped['years_totals'] = cycle_minus_one 
        totals_mapped['years_totals'] += ' - ' 
        totals_mapped['years_totals'] += str(reports['election_cycle'])

    if totals_mapped['report_year']:
        totals_mapped['report_desc'] = 'the ' 
        totals_mapped['report_desc'] += re.sub('/{.+}/', 
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
        candidate['incumbent_challenge'] = c_e['incumbent_challenge_full']
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

type_map = {
    'candidates': map_candidate_table_values,
    'candidate': map_candidate_page_values,
    'committees': map_committee_table_values,
    'committee': map_committee_table_values
}

