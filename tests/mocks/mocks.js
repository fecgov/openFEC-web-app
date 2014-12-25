module.exports = {
    getCommitteeResults: function() {
        return $.mockjax({
            url: 'rest/committee?q=smith&per_page=5',
            proxy: '/tests/mocks/json/committee-results.json' 
        });
    },

    getCandidateResults: function() {
        return $.mockjax({
            url: 'rest/candidate?q=smith&per_page=5',
            proxy: '/tests/mocks/json/candidate-results.json'
        });
    },

    // * are treated as wildcards in strings
    getCommitteeRecords: function() {
        return $.mockjax({
            url: /^\/rest\/committee\?q=smith&fields=\*$/,
            proxy: '/tests/mocks/json/committee-records.json'
        });
    },

    getCandidates: function() {
        return $.mockjax({
            url: /^\/rest\/candidate\?fields=\*&*$/,
            proxy: '/tests/mocks/json/candidates.json'
        });
    },

    getCandidatesPage1: function() {
        return $.mockjax({
            url: /^\/rest\/candidate\?fields=\*&page=1&$/,
            proxy: '/tests/mocks/json/candidates.json'
        });
    },

    getCandidatesPage2: function() {
        return $.mockjax({
            url: /^\/rest\/candidate\?fields=\*&page=2&$/,
            proxy: '/tests/mocks/json/candidates-page2.json'
        });
    },

    getCandidatesIndiana: function() {
        return $.mockjax({
            url: /^\/rest\/candidate\?state=IN&fields=\*$/,
            proxy: '/tests/mocks/json/candidates-indiana.json'
        });
    },

    getCommittees: function() {
        return $.mockjax({
            url: /^\/rest\/committee\?fields=\*$/,
            proxy: 'tests/mocks/json/committees.json'
        });
    },

    getCommitteesPage1: function() {
        return $.mockjax({
            url: /^\/rest\/committee\?fields=\*&page=1&$/,
            proxy: 'tests/mocks/json/committees.json'
        });
    },

    getCommitteesPage2: function() {
        return $.mockjax({
            url: /^\/rest\/committee\?fields=\*&page=2&$/,
            proxy: 'tests/mocks/json/committees-page2.js'
        });
    },

    getCommitteesHouse: function() {
        return $.mockjax({
            url: /^\/rest\/committee\?type=H&fields=\*$/,
            proxy: 'tests/mocks/json/committees-house.js'
        });
    }

}
