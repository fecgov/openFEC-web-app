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
                id: '',
                name:'',
                treasurer:'',
                state: '',
                party: '',
                type: '',
                designation: '',
                organization: '',
                nameURL: ''
            };

            committee = results[i];
            committee.status = results[i].status;

            newCommitteeObj.id = committee.committee_id || '';
            newCommitteeObj.nameURL = '/committees/' + newCommitteeObj.id;

            if (typeof committee.status !== 'undefined') {
                newCommitteeObj.type = committee.status.type_full || '';
                newCommitteeObj.designation = committee.status.designation_full || '';
            }

            if (typeof committee.treasurer !== 'undefined') {
                newCommitteeObj.treasurer = committee.treasurer.name_full || '';
            }

            if (typeof committee.address !== 'undefined') {
                newCommitteeObj.state = committee.address.state || '';
            }

            if (typeof committee.description !== 'undefined') {
                newCommitteeObj.party = committee.description.party_full || '';
                newCommitteeObj.name = committee.description.name || '';
                newCommitteeObj.organization = committee.description.organization_type_full || '';
            }
debugger;
            committees.push(newCommitteeObj);
        }

        return committees;
    }
};
