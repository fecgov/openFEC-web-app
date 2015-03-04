from flask import url_for
from openfecwebapp.data_prep.shared import committee_type_map

def _map_committee_values(ac):
    """
    maps and returns template vars for committee values that 
    are shown on candidate pages
    """
    c = {}
    c['id'] = ac.get('committee_id', '') 
    c['name'] = ac.get('committee_name', '')
    c['designation'] = ac.get('designation_full', '')
    c['designation_code'] = ac.get('designation', '')

    if ac.get('committee_id'):
        c['url'] = url_for('committee_page', c_id=c['id'])

    return c

def map_candidate_page_values(c):
    """
    returns template vars for rendering a single candidate page
    """
    candidate = {}
    candidate['name'] = c['name']['full_name']

    if c.get('elections'):
        c_e = c['elections'][0]
        candidate['state'] = c_e.get('state', '')
        candidate['party'] = c_e.get('party_affiliation', '')
        candidate['incumbent_challenge'] = c_e.get(
            'incumbent_challenge_full', '')
        candidate['office'] = c_e['office_full']

        if c_e.get('primary_committee'):
            candidate['primary_committee'] = _map_committee_values(
                c_e['primary_committee'])
            candidate['related_committees'] = True

        # affiliated committees = committee_type_map, 
        # plus more we ignore for the candidate pages
        if c_e.get('affiliated_committees'):
            candidate['affiliated_committees'] = {
                c['committee_id']: _map_committee_values(c)
                for c in c_e['affiliated_committees']
            }

            candidate['authorized_committees'] = {}
            candidate['leadership_committees'] = {}
            candidate['joint_committees'] = {}

            for cmte_id in candidate['affiliated_committees']:
                cmte = candidate['affiliated_committees'][cmte_id]
                cmte_type = cmte['designation_code']
                # drop anything that's not of the types we're
                # interested in
                if cmte_type in committee_type_map:
                    candidate[committee_type_map[
                        cmte_type]][cmte_id] = cmte
                    candidate['related_committees'] = True

    return candidate
