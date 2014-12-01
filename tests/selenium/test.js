var webdriverio = require('webdriverio'),
    client = webdriverio.remote({
        desiredCapabilities: {
            browserName: 'chrome',
            version: '27',
            platform: 'XP',
            tags: ['examples'],
            name: 'This is an example test'
        },
        host: 'ondemand.saucelabs.com',
        port: 80,
        user: process.env.SAUCE_USERNAME,
        key: process.env.SAUCE_ACCESS_KEY,
        logLevel: 'silent'
    }).init();
 
client
    .url('http://localhost')
    .waitForExist('.js-initialized')
    .click('.browse-links a[name=candidates]')
    .waitForVisible('#nprogress')
    .getText('h2', function(err, text) {
        assert.equal(text, 'Browse candidates');
    })
    .end();
