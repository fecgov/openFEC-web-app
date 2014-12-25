var webdriver = require('selenium-webdriver'),
    sauce = 'http://ondemand.saucelabs.com:80/wd/hub',
    chai = require('chai'),
    assert = chai.assert,
    mocks = require('../mocks/mocks.js'),
    searchField,
    driver = new webdriver.Builder()
    .usingServer(sauce)
    .withCapabilities({
        browserName: 'chrome',
        version: '',
        platform: 'OS X 10.10',
        name: 'Search',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
    })
    .build();
 
driver.get('http://localhost:3000?test=true');

driver.wait(function() {
    return driver.findElement(webdriver.By.className('js-initialized'));
}, 8000);

driver.executeScript(mocks.getCommitteeResults);
driver.executeScript(mocks.getCandidateResults);
driver.executeScript(mocks.getCommitteeRecords);

searchField = driver.findElement(webdriver.By.css('#large-search input[name=search]'));
searchField.sendKeys('smith');

driver.findElement(webdriver.By.css('#large-search button#submit-search')).click().then(function() {
    // make sure progress bar shows up
    return driver.findElement(webdriver.By.id('progress')).isDisplayed();
});

// results are visible and header is correct
driver.wait(function() {
    return driver.findElement(webdriver.By.id('progress')).getAttribute('class').then(function(classes) {
        return classes.indexOf('nprogress-custom-parent') === -1;
    });
}, 10000).then(function() {
    driver.findElement(webdriver.By.tagName('h2')).getInnerHtml().then(function(text) {
        assert.equal(text, 'Search results: <span class="text--query">smith</span>');
    });
});

// make sure the nav in header became visisble
driver.wait(function() {
    return driver.findElement(webdriver.By.className('header-nav')).isDisplayed();
}, 2000);

// click "view all" committees
driver.findElement(webdriver.By.xpath('//*[@id="main"]/div/section/div[2]/div/a')).click();

// make sure name filter is populated and active
driver.wait(function() {
    return driver.findElement(webdriver.By.id('committees')).isDisplayed();
}, 25000).then(function() {
    driver.findElement(webdriver.By.id('name-field')).getAttribute('class').then(function(classes) {
        assert.equal(classes, 'field active');
    });
});

driver.wait(function() {
    return driver.findElement(webdriver.By.xpath('//*[@id="category-filters"]/div[1]/div/input')).isDisplayed();
}, 8000).then(function() {
    driver.findElement(webdriver.By.xpath('//*[@id="category-filters"]/div[1]/div/input')).getAttribute('value').then(function(text) {
        assert.equal(text, 'smith');
    });
});

driver.quit();
