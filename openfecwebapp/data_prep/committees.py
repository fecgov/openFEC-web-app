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
    committee['address'] = {
        'address':{
            'street_1' : c.get('street_1', ''),
            'street_2' : c.get('street_2', ''),
            'city' : c.get('city', ''),
            'zip' : c.get('zip', '')
        }
    }

    return committee
