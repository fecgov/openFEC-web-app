var webdriverio = require('webdriverio'),
    client = webdriverio.remote({
        desiredCapabilities: {
            browserName: 'chrome',
            version: '',
            platform: 'OS X 10.10',
            tags: ['examples'],
            name: 'Browse candidates'
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
    .click('.browse-links a[name=candidates]')
    .waitForVisible('#progress', 1000)
    .end();
