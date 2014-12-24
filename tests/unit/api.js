var api = require('../../static/js/modules/api.js');
var assert = require('assert');

describe('API Module', function() {
    describe('buildURL()', function() {
        it('should return a relative URL to an API endpoint', function() {
            var context = {
                category: 'candidates',
                filters: {
                    year: '2000',
                    state: 'IL'
                }
            };

            assert.equal(api.buildURL(context), '/rest/candidate?year=2000&state=IL&fields=*');
        });

        it('should return an appropriate URL for single committees', function() {
            var context = {
                category: 'committees',
                id: '12345'
            };

            assert.equal(api.buildURL(context), '/rest/committee/12345?fields=*');
        });
    });
});
