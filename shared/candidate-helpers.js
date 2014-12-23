module.exports = {
    buildCandidateContext: function(results) {
        var candidates = [],
            i,
            len,
            newCandidateObj;

        if (typeof results !== 'undefined') {
            len = results.length;
        }

        for (i = 0; i < len; i++) {
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
                newCandidateObj.office = results[i].elections[0].office_sought_full || '';
                newCandidateObj.party = results[i].elections[0].party_affiliation || '';
                newCandidateObj.incumbent_challenge = results[i].elections[0].incumbent_challenge_full || '';

                if (typeof results[i].elections[0].primary_committee !== 'undefined') {
                    newCandidateObj.election = results[i].elections[0].primary_committee.election_year || '';
                }

                newCandidateObj.state = results[i].elections[0].state || '';
                newCandidateObj.district = results[i].elections[0].district || '';
            }

            if (typeof results[i].name !== 'undefined') {
                newCandidateObj.name = results[i].name.full_name || '';
            }

            candidates.push(newCandidateObj);
        }

        return candidates;
    }
};
