var urls = require('../../static/js/modules/urls.js');
var assert = require('assert');

describe('URL Module', function() {
    describe('buildURL()', function() {
        it('should return a URL to match the given context on a search', function() {
            var context = {
                category: 'insects', 
                query: 'ladybug'  
            };

            assert.equal(urls.buildURL(context), '/insects?q=ladybug&fields=*');
        });

        it('should return a URL to match the given context when filtered', function() {
            var context = {
                category: 'insects', 
                filters: {
                    numLegs: '4',
                    color: 'red'
                }
            };

            assert.equal(urls.buildURL(context), '/insects?numLegs=4&color=red&fields=*');
        });

    });
});
