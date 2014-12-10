module.exports = {
    buildCommitteeContext: function(results) {
        var i,
            len,
            committee,
            committees = [],
            newCommitteeObj;

        if (typeof results !== 'undefined') {
            len = results.length;
        }

        for (i = 0; i < len; i++) {
            // don't want leftover vars from one iteration to the next
            // should the corresponding if block is false
            newCommitteeObj = {
                name:'',
                treasurer:'',
                state: '',
                party: '',
                type: '',
                designation: '',
                organization: ''
            };

            committee = results[i].archive[0];
            committee.properties = results[i].properties;

            if (typeof committee.properties !== 'undefined' && typeof committee.properties.candidates !== 'undefined') {
                newCommitteeObj.type = committee.properties.candidates[0].type_full || '';
                newCommitteeObj.designation = committee.properties.candidates[0].designation_full || '';
            }

            if (typeof committee.treasurer !== 'undefined') {
                newCommitteeObj.treasurer = committee.treasurer[0].name_full || '';
            }

            if (typeof committee.address !== 'undefined') {
                newCommitteeObj.state = committee.address[0].state || '';
            }

            if (typeof committee.description !== 'undefined') {
                newCommitteeObj.party = committee.description[0].party_full || '';
                newCommitteeObj.name = committee.description[0].name || '';
                newCommitteeObj.organization = committee.description[0].organization_type_full || '';
            }

            committees.push(newCommitteeObj);
        }

        return committees;
    }
};
