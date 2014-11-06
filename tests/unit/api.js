var api = require('../../static/js/modules/api.js');
var assert = require('assert');

describe('API Module', function() {
    describe('singularlize()', function() {
        it('should return a string with the last char removed', function() {
            assert.equal('banana', api.singularize('bananas'));
        });
    });

    describe('buildURL()', function() {
        it('should return a relative URL to an API endpoint', function() {
            var context = {
                category: 'pizzerias',
                filters: {
                    style: 'chicago',
                    delivery: 'yes'
                }
            };

            assert.equal(api.buildURL(context), 'rest/pizzeria?style=chicago&delivery=yes&');
        });
    });
});
