module.exports = {
    buildCandidateContext: function(results) {
        var candidates = [],
            i,
            j,
            len,
            newCandidateObj;

        if (typeof results !== 'undefined') {
            len = results.length;
        }

        for (i = 0; i < len; i++) {
            newCandidateObj = {
                name: '',
                office: '',
                election: '',
                party: '',
                state: '',
                district: ''
            };

            if (typeof results[i].elections !== 'undefined') {
                newCandidateObj.office = results[i].elections[0].office_sought_full || '';
                newCandidateObj.party = results[i].elections[0].party_affiliation || '';

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
