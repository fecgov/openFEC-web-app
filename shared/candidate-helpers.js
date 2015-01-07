var committeeHelpers = require('./committee-helpers.js');

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
                nameURL: '',
                committees: [],
                principal_committee: {
                  name: '',
                  url: '',
                },
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

            if (typeof results.committee !== 'undefined') {
              // Use the committee context builder for to build an array of committees
              newCandidateObj.committees = committeeHelpers.buildCommitteeContext(results.committee);

              // Go find the principal committee and add that property for easy reference
              var j,
                  len2;
              len2 = results.committee.length;

              for ( j = 0; j < len2; j++ ) {
                var k,
                    len3;
                len3 = results.committee[j].candidates.length;

                for (k = 0; k < len3; k++) {
                  if (results.committee[j].candidates[k].candidate_id === results[i].candidate_id &&
                    results.committee[j].candidates[k].designation_full === "Principal campaign committee") {
                      newCandidateObj.principal_committee.name = results.committee[j].name;
                      newCandidateObj.principal_committee.url = '/committees/' + results.committee[j].committee_id;
                  }
                }
              }
            }
            // console.log(newCandidateObj);
            candidates.push(newCandidateObj);
        }
        return candidates;
    }
};
