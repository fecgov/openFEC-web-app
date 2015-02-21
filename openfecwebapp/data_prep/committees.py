from flask import url_for

def map_committee_table_values(c):
    """
    maps and returns template vars for a single committee
    record. 
    """
    committee = {}

    if c.get('description'):
        committee['name'] = c['description'].get('name', '')
        committee['organization'] = c['description'].get(
            'organization_type_full', '')

    if c.get('treasurer'):
        committee['treasurer'] = c['treasurer'].get('name_full', '')

    if c.get('address'):
        committee['state'] = c['address'].get('state')

    if c.get('status'):
        committee['type'] = c['status'].get('type_full', '')
        committee['designation'] = c['status'].get(
            'designation_full', '')

    if c.get('committee_id'):
        committee['id'] = c.get('committee_id', '')

    return committee

def map_committee_page_values(c):
    """
    returns template vars for rendering a single committee page
    """
    committee = map_committee_table_values(c)

    committee['address'] = c.get('address', {})

    return committee
