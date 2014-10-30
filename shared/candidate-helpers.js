module.exports = {
    buildCandidateContext: function(results) {
        var candidates = [],
            i = 0,
            len = results.length,
            elections,
            election,
            year;

        for (i; i < len; i++) {
            elections = results[i].elections;
            year = Object.keys(elections)[0];
            election = elections[year];

            candidates[i] = {
                'name': results[i].name.full_name,
                'office': election.office_sought,
                'election': year,
                'party': election.party_affiliation,
                'state': election.state,
                'district': election.district
            }
        }

        return candidates;
    }
};
