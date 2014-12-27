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
                incumbent_challenge: '',
                nameURL: ''
            };

            newCandidateObj.id = results[i].candidate_id;
            newCandidateObj.nameURL = '/candidates/' + newCandidateObj.id;

            if (typeof results[i].elections !== 'undefined') {
                newCandidateObj.office = results[i].elections[0].office_sought_full || '';
                newCandidateObj.party = results[i].elections[0].party_affiliation || '';
                newCandidateObj.incumbent_challenge = results[i].elections[0].incumbent_challenge_full || '';
                newCandidateObj.election = results[i].elections[0].election_year || '';

                newCandidateObj.state = results[i].elections[0].state || '';
                newCandidateObj.district = results[i].elections[0].district || '';
            }

            if (typeof results[i].name !== 'undefined') {
                newCandidateObj.name = results[i].name.full_name || '';
            }

            if (typeof results[i].totals !== 'undefined') {
                // this data isn't from the source it should be from
                // to be improved [ts]
                newCandidateObj.total_receipts = results[i].totals[0].receipts || 'unavailable';
                newCandidateObj.total_disbursements = results[i].totals[0].total_disbursements || 'unavailable';
                newCandidateObj.total_cash = results[i].totals[0].total_contributions || 'unavailable';
                newCandidateObj.total_debt = results[i].totals[0].total_disbursements || 'unavailable';
            }

            candidates.push(newCandidateObj);
        }

        return candidates;
    }
};
