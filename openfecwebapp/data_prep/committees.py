def map_committee_page_values(c):
    """
    returns template vars for rendering a single committee page
    """
    committee = {}
    committee['name'] = c.get('name', '')
    committee['type'] = c.get('type_full', '')
    committee['designation'] = c.get(
        'designation_full', '')
    committee['treasurer'] = c.get('treasurer_name', '')
    committee['organization_type_full']= c.get('committee_type_full', '')
    committee['designation'] = c.get('designation_full', '')
    committee['designation_code'] = c.get('designation', '')
    committee['active_though'] = c.get('active_though', '')
    committee['organization_type_code'] = c.get('organization_type', '')
    committee['organization'] = c.get('organization_type_full', '')
    committee['type'] = c.get('committee_type_full', '')
    committee['type_full'] = c.get('committee_type', '')
    committee['address'] = {
        'street_1' : c.get('street_1', ''),
        'street_2' : c.get('street_2', ''),
        'city' : c.get('city', ''),
        'zip' : c.get('zip', '')
    }
    committee['candidates'] = []
    # we should get rid of this after the refactor
    cands = []
    for cand in c['candidates']:
        candidate = {}
        candidate['candidate_id'] = cand['candidate_id']
        candidate['name'] = cand['candidate_name']
        if cand['candidate_id'] not in cands:
            committee['candidates'].append(candidate)
            # we should get rid of this after the refactor
            cands.append(cand['candidate_id'])

    return committee
