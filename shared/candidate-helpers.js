module.exports = {
    buildCandidateContext: function(results) {
        var candidates = [],
            i = 0,
            j = 0,
            len = results.length,
            elections,
            election,
            year,
            jlen;

        for (i; i < len; i++) {
            elections = results[i].elections;
            jlen = elections.length;

            for (j; j < jlen; j++) {
                candidates[j] = {
                    'name': results[i].name.full_name,
                    'office': elections[j].office_sought,
                    'election': elections[j].election_year,
                    'party': elections[j].party_affiliation,
                    'state': elections[j].state,
                    'district': elections[j].district
                }
            }
        }

        return candidates;
    }
};
