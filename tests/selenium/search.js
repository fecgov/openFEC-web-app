var webdriverio = require('webdriverio'),
    client = webdriverio.remote({
        desiredCapabilities: {
            browserName: 'chrome',
            version: '',
            platform: 'OS X 10.10',
            tags: ['examples'],
            name: 'Search'
        },
        host: 'ondemand.saucelabs.com',
        port: 80,
        user: process.env.SAUCE_USERNAME,
        key: process.env.SAUCE_ACCESS_KEY,
        logLevel: 'verbose'
    }).init();
 
client
    .url('http://localhost')
    .waitFor('.js-initialized', 2000)
    .setValue('#large-search input[name=search]', 'smith')
    .click('#large-search input[type=submit]')
    .waitForVisible('#progress', 1000)
    .waitForVisible('.sub-section')
    .getText('h2', function(err, text) {
        assert.equal(err, 'Search results: smith');
    })
    .end();
