def map_committee_page_values(c):
    """
    returns template vars for rendering a single committee page
    """
    committee = {}

    if c.get('status'):
        committee['type'] = c['status'].get('type_full', '')
        committee['designation'] = c['status'].get(
            'designation_full', '')

    if c.get('treasurer'):
        committee['treasurer'] = c['treasurer'].get('name_full', '')

    committee['address'] = c.get('address', {})

    return committee
