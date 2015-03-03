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
    c['designation'] = ac.get('committee_designation_full', '')
    c['designation_code'] = ac.get('committee_designation', '')
    c['type'] = ac.get('committee_type_full', '')
    c['type_full'] = ac.get('committee_type', '')

    if ac.get('committee_id'):
        c['url'] = url_for('committee_page', c_id=c['id'])

    return c

def map_candidate_page_values(c):
    """
    returns template vars for rendering a single candidate page
    """
    candidate = {}
    candidate['name'] = c['name']
    candidate['state'] = c.get('state', '')
    candidate['party'] = c.get('party_full', '')
    candidate['incumbent_challenge'] = c.get(
            'incumbent_challenge_full', '')
    candidate['office'] = c.get('office_full', '')
    candidate['district'] = c.get('district', '')

    candidate['authorized_committees'] = {}
    candidate['leadership_committees'] = {}
    candidate['joint_committees'] = {}

    for cmte in c['committees']:
        if cmte['committee_designation'] == 'P':
            candidate['primary_committee'] = _map_committee_values(
                cmte)
        else:
            cmte_id = cmte['committee_id']
            cmte_type = cmte['committee_designation']
            # drop anything that's not of the types we're
            # interested in
            if cmte_type in committee_type_map:
                    candidate[committee_type_map[
                        cmte_type]][cmte_id] = cmte
                    candidate['related_committees'] = True
                    print("\n", cmte, "\n")

    return candidate
