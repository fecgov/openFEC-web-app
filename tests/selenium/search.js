var webdriver = require('selenium-webdriver'),
    sauce = 'http://ondemand.saucelabs.com:80/wd/hub',
    chai = require('chai'),
    assert = chai.assert,
    searchField,
    driver = new webdriver.Builder()
    .usingServer(sauce)
    .withCapabilities({
        browserName: 'chrome',
        version: '',
        platform: 'OS X 10.10',
        name: 'Browse candidates',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
    })
    .build();
 
driver.get('http://localhost');

driver.wait(function() {
    return driver.findElement(webdriver.By.className('js-initialized'));
}, 6000);

searchField = driver.findElement(webdriver.By.css('#large-search input[name=search]'));
searchField.sendKeys('smith');

driver.findElement(webdriver.By.css('#large-search input[type=submit]')).click();

driver.wait(function() {
    return driver.findElement(webdriver.By.id('progress'));
}, 4000);

driver.wait(function() {
    return driver.findElement(webdriver.By.className('sub-section'));
}, 4000);

driver.findElement(webdriver.By.tagName('h2')).getInnerHtml().then(function(text) {
    assert.equal(text, 'Search results: <span class="query">smith</span>');
});

// make sure the nav in header became visisble
driver.wait(function() {
    return driver.findElement(webdriver.By.className('header-nav')).isDisplayed();
}, 2000);

// click "view all" committees
driver.findElement(webdriver.By.xpath('//*[@id="main"]/div/div[2]/div/a')).click().then(function() {
    // make sure name filter is populated and active
    driver.wait(function() {
        driver.findElement(webdriver.By.xpath('//*[@id="category-filters"]/div[1]')).getAttribute('class').then(function(classes) {
            assert.equal(classes, 'field active');
        });
    }, 2000);

    driver.wait(function() {
        driver.findElement(webdriver.By.xpath('//*[@id="category-filters"]/div[1]/input')).getAttribute('value').then(function(text) {
            assert.equal(text, 'smith');
        });
    }, 2000);
});

driver.quit();
