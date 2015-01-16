var committeeHelpers = require('./committee-helpers.js');

module.exports = {
    buildCandidateContext: function(results) {
        var candidates = [],
            i,
            len,
            newCandidateObj,
            election;

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
                related_committees: false, // Set to true if any of these arrays have data
                authorized_committees: [],
                leadership_commmittees: [],
                joint_committees: [],
            };

            newCandidateObj.id = results[i].candidate_id;
            newCandidateObj.nameURL = '/candidates/' + newCandidateObj.id;

            if (typeof results[i].elections !== 'undefined') {
                election = results[i].elections[0];

                newCandidateObj.office = election.office_sought_full || '';
                newCandidateObj.party = election.party_affiliation || '';
                newCandidateObj.incumbent_challenge = election.incumbent_challenge_full || '';
                newCandidateObj.election = election.election_year || '';
                newCandidateObj.state = election.state || '';
                newCandidateObj.district = election.district || '';

                if (typeof election.primary_committee !== 'undefined') {
                  newCandidateObj.primary_committee.id = election.primary_committee.committee_id || '';
                  newCandidateObj.primary_committee.name = election.primary_committee.committee_name || '';
                  newCandidateObj.primary_committee.designation = election.primary_committee.designation_full || '';
                  newCandidateObj.primary_committee.url = '/committees/' + election.primary_committee.committee_id || '';
                  newCandidateObj.related_committees = true;                
                }

                if (typeof election.affiliated_committees !== 'undefined') {
                  var committeesAll = [],
                      committeesAuthorized = [],
                      committeesLeadership = [],
                      committeesJoint = [], 
                      j,
                      len2,
                      newCommitteeObj;                  
                  len2 = election.affiliated_committees.length;
                  
                  for ( j = 0; j < len2; j++ ) {
                    if ( election.affiliated_committees[j].designation !== "U") { // Ignore unauthorized
                      newCommitteeObj = {
                        id: '',
                        name: '',
                        designation: '',
                        designation_code: '',
                        url: ''
                      }
                     
                      newCommitteeObj.id = election.affiliated_committees[j].committee_id || '';
                      newCommitteeObj.name = election.affiliated_committees[j].committee_name || '';
                      newCommitteeObj.designation = election.affiliated_committees[j].designation_full || '';
                      newCommitteeObj.designation_code = election.affiliated_committees[j].designation || '';
                      newCommitteeObj.url = '/committees/' + election.affiliated_committees[j].committee_id || '';
                      
                      committeesAll.push(newCommitteeObj);
                      newCandidateObj.related_committees = true;
                    }
                  }
                  // Sort into the correct array
                  _.map(committeesAll, function(committee) {
                    var designationCode = committee.designation_code,
                        designations = {
                          A: committeesAuthorized,
                          D: committeesLeadership,
                          J: committeesJoint
                        };
                        designationArray = designations[designationCode];
                        designationArray.push(committee);
                  })

                  newCandidateObj.authorized_committees = committeesAuthorized;
                  newCandidateObj.leadership_committees = committeesLeadership;
                  newCandidateObj.joint_committees = committeesJoint;
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
