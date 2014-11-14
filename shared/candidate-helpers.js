module.exports = {
    buildCandidateContext: function(results) {
        var candidates = [],
            i,
            j,
            len = results.length,
            elections,
            election,
            year,
            jlen;

        for (i = 0; i < len; i++) {
            elections = results[i].elections;
            jlen = elections.length;

            for (j = 0; j < jlen; j++) {
                candidates.push({
                    'name': results[i].name.full_name,
                    'office': elections[j].office_sought,
                    'election': elections[j].election_year,
                    'party': elections[j].party_affiliation,
                    'state': elections[j].state,
                    'district': elections[j].district
                });
            }
        }

        return candidates;
    }
};
