module.exports = {
    buildCommitteeContext: function(results) {
        var i,
            len,
            committee,
            committees = [],
            type,
            designation;

        if (typeof results !== 'undefined') {
            len = results.length;
        }

        for (i = 0; i < len; i++) {
            committee = results[i][0];

            if (typeof committee.candidates !== 'undefined') {
                type = committee.candidates[0].type;
                designation = committee.candidates[0].designation;
            }
            else {
                type = committee.type;
                designation = '';
            }

            committees.push({
                name: committee.name,
                treasurer: committee.treasurer.name_full,
                state: committee.address.state,
                party: '',
                type: type,
                designation: designation
            });
        }

        return committees;
    }
};
