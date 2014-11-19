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
            party;

        if (typeof results !== 'undefined') {
            len = results.length;
        }

        for (i = 0; i < len; i++) {
            committee = results[i][0];

            type = committee.status[0].type;
            designation = committee.status[0].designation;

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
                designation: designation
            });
        }

        return committees;
    }
};
