module.exports = {
    buildCommitteeContext: function(results) {
        var i,
            len,
            committee,
            committees = [],
            type,
            designation,
            name,
            treasurer,
            state,
            party,
            organization;

        if (typeof results !== 'undefined') {
            len = results.length;
        }

        for (i = 0; i < len; i++) {
            committee = results[i][0];

            if (typeof committee.status !== 'undefined') {
                type = committee.status[0].type;
                designation = committee.status[0].designation;
            }
            else {
                type = committee.type;
                designation = '';
            }

            organization = committee.organization_type || '';

            name = committee.name || '';
            if (typeof committee.treasurer !== 'undefined') {
                treasurer = committee.treasurer.name_full;
            }
            else {
                treasurer = '';
            }
            state = committee.address.state || '';
            party = '';

            committees.push({
                name: name,
                treasurer: treasurer,
                state: state,
                party: party,
                type: type,
                designation: designation,
                organzation: organization
            });
        }

        return committees;
    }
};
