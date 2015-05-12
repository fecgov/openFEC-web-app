from flask import url_for

def generate_pagination_values(c, params, data_type):
    """
    returns template vars for pagination results counts and
    next/prev links on tabular views like /committees,
    /candidates and search results
    """
    pagination = {}
    per_page = int(c['pagination']['per_page'])
    page = int(c['pagination']['page'])
    count = int(c['pagination']['count'])
    current_results_start = per_page * (page - 1) + 1 
    current_results_end = min(per_page * page, count)
    total_pages = int(c['pagination']['pages'])

    pagination['results_count'] = c['pagination']['count']
    pagination['page'] = page
    pagination['per_page'] = per_page
    pagination['current_results_start'] = current_results_start
    pagination['current_results_end'] = current_results_end

    if current_results_start or current_results_end:
        pagination['results_range'] = True

    # next url
    if page < total_pages:
        next_page_num = str(page + 1)
        params['page'] = next_page_num
        pagination['next_url'] = url_for(data_type, **params) 
        pagination['pagination_links'] = True

    # prev url
    if page - 1 > 0:
        prev_page_num = str(page - 1)
        params['page'] = prev_page_num
        pagination['prev_url'] = url_for(data_type, **params) 
        pagination['pagination_links'] = True

    return pagination

# we want to show the committees on their related candidate 
# pages in this order, with primary committees on top
committee_type_map = {
    'A': 'authorized_committees',
    'D': 'leadership_committees',
    'J': 'joint_committees'
}
