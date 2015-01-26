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

def _map_primary_committee_values(pc):
    c = {}
    c['id'] = pc['committee_id'] 
    c['name'] = pc['committee_name']
    c['designation'] = pc['designation_full']
    c['url'] = '/committees/' + pc['committee_id']
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

def map_candidate_page_values(c):
    candidate = map_candidate_table_values(c)

    if c['elections']:
        candidate['incumbent_challenge'] = c['elections'][0]['incumbent_challenge_full']
        if c['elections'][0]['primary_committee']:
            candidate['primary_committee'] = _map_primary_committee_values(
                c['elections'][0]['primary_committee'])
            candidate['related_committees'] = True

    return candidate

type_map = {
    'candidates': map_candidate_table_values,
    'candidate': map_candidate_page_values,
    'committees': map_committee_table_values,
    'committee': map_committee_table_values
}

