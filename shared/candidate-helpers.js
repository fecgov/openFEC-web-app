var _ = require('underscore');

var buildTotalsSummaryContext = function(results) {
    var totals = {},
        totalReceipts = results.totals[0].total_receipts,
        totalDisbursements = results.totals[0].total_disbursements,
        totalCash = results.reports[0].cash_on_hand_end_period,
        totalDebt = results.reports[0].debts_owed_by_committee;

    // a total can be 0, which returns false, giving incorrect "unavailable"s if we don't do it this way [ts]
    totals.total_receipts = typeof totalReceipts !== 'undefined'? '$' + totalReceipts : 'unavailable';
    totals.total_disbursements = typeof totalDisbursements !== 'undefined' ? '$' + totalDisbursements : 'unavailable';
    totals.total_cash = typeof totalCash !== 'undefined' ? '$' + totalCash : 'unavailable';
    totals.total_debt = typeof totalDebt !== 'undefined' ? '$' + totalDebt : 'unavailable';

    return totals;
}

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
                newCandidateObj = _.extend(newCandidateObj, buildTotalsSummaryContext(results[i]));
            }

            candidates.push(newCandidateObj);
        }

        return candidates;
    }
};
