module.exports = {
    buildCandidateContext: function(results) {
        var candidates = [],
            i,
            j,
            len,
            jlen,
            newCandidateObj;

        if (typeof results !== 'undefined') {
            len = results.length;
        }

        for (i = 0; i < len; i++) {
            // if there are multiple elections associated with this
            // candidate, express them as separate rows
            jlen = results[i].elections.length || 1;

            for (j = 0; j < jlen; j++) {
                newCandidateObj = {
                    id: '',
                    name: '',
                    office: '',
                    election: '',
                    party: '',
                    state: '',
                    district: '',
                    incumbent_challenge: ''
                };

                newCandidateObj.id = results[i].candidate_id;

                if (typeof results[i].elections !== 'undefined') {
                    newCandidateObj.office = results[i].elections[j].office_sought_full || '';
                    newCandidateObj.party = results[i].elections[j].party_affiliation || '';
                    newCandidateObj.incumbent_challenge = results[i].elections[j].incumbent_challenge_full || '';

                    if (typeof results[i].elections[j].primary_committee !== 'undefined') {
                        newCandidateObj.election = results[i].elections[j].primary_committee.election_year || '';
                    }

                    newCandidateObj.state = results[i].elections[j].state || '';
                    newCandidateObj.district = results[i].elections[j].district || '';
                }

                if (typeof results[i].name !== 'undefined') {
                    newCandidateObj.name = results[i].name.full_name || '';
                }

                candidates.push(newCandidateObj);
            }
        }

        return candidates;
    }
};
