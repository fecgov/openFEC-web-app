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
                primary_committee: {
                  id: '',
                  name: '',
                  designation: '',
                  url: '',
                },
                related_committees: false, // Set to true if either affiliated_ and other_ arrays have anything
                affiliated_committees: [],
                other_committees: [],
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

                if (typeof results[i].elections[0].primary_committee !== 'undefined') {
                  newCandidateObj.primary_committee.id = results[i].elections[0].primary_committee.committee_id || '';
                  newCandidateObj.primary_committee.name = results[i].elections[0].primary_committee.committee_name || '';
                  newCandidateObj.primary_committee.designation = results[i].elections[0].primary_committee.designation_full || '';
                  newCandidateObj.primary_committee.url = '/committees/' + results[i].elections[0].primary_committee.committee_id || '';                
                }

                if (typeof results[i].elections[0].affiliated_committees !== 'undefined') {
                  var affiliatedCommittees = [],
                      otherCommittees = [], 
                      j,
                      len2,
                      newCommitteeObj;                  
                  len2 = results[i].elections[0].affiliated_committees.length;
                  
                  for ( j = 0; j < len2; j++ ) {
                    if ( results[i].elections[0].affiliated_committees[j].designation !== "U") { // Ignore unauthorized
                      newCommitteeObj = {
                        id: '',
                        name: '',
                        designation: '',
                        url: ''
                      }
                     
                      newCommitteeObj.id = results[i].elections[0].affiliated_committees[j].committee_id || '';
                      newCommitteeObj.name = results[i].elections[0].affiliated_committees[j].committee_name || '';
                      newCommitteeObj.designation = results[i].elections[0].affiliated_committees[j].designation_full || '';
                      newCommitteeObj.url = '/committees/' + results[i].elections[0].affiliated_committees[j].committee_id || '';
                      
                      // Sort the committeeObj into the proper array depending on if its authorized
                      if ( newCommitteeObj.designation === "Authorized by a candidate" ) { // Check if it's authorized
                        affiliatedCommittees.push(newCommitteeObj);
                        newCandidateObj.related_committees = true;

                      } 
                      else {
                        otherCommittees.push(newCommitteeObj);
                        newCandidateObj.related_committees = true;
                      }
                      
                    }
                  }
                  newCandidateObj.affiliated_committees = affiliatedCommittees;
                  newCandidateObj.other_committees = otherCommittees;
                }
            }

            if (typeof results[i].name !== 'undefined') {
                newCandidateObj.name = results[i].name.full_name || '';
            }
            candidates.push(newCandidateObj);
        }
        return candidates;
    }
};
