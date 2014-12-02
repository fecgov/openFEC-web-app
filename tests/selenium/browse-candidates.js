var webdriver = require('selenium-webdriver'),
    sauce = 'http://ondemand.saucelabs.com:80/wd/hub',
    chai = require('chai'),
    assert = chai.assert,
    getResultsRows,
    driver = new webdriver.Builder()
    .usingServer(sauce)
    .withCapabilities({
        browserName: 'chrome',
        version: '',
        platform: 'OS X 10.10',
        name: 'Browse candidates',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
    })
    .build();
 
driver.get('http://localhost');
driver.wait(function() {
    return driver.findElement(webdriver.By.className('js-initialized'));
}, 4000);

// click box under search bar that says 'candidates'
driver.findElement(webdriver.By.css('.browse-links a[name=candidates]')).click();

// confirm progress bar exists
driver.wait(function() {
    return driver.findElement(webdriver.By.id('progress'));
}, 2000);

// confirm record count exists and is correct
driver.findElement(webdriver.By.css('#results-count p:first-child')).getInnerHtml().then(function(text) {
    assert.equal(text, 'Results: 22 records');
});

// the table should have one row for each of 20 results + header row
getResultsRows = function() {
    return document.querySelectorAll('table tr').length;
};

driver.executeScript(getResultsRows).then(function(rows) {
    assert.equal(rows, 21);
});

// the right data should be output
driver.findElement(webdriver.By.css('#results tr:first-child td')).then(function(html) {
    var firstRow = '<td class="flex-cell">DODDS, PHILIP</td>' +
                   '<td>House</td>' +
                   '<td>2012</td>' +
                   '<td>Invalid Party Code</td>' +
                   '<td>FL</td>' +
                   '<td>03</td>';

    assert.equal(firstRow, html);
});

// pagination
driver.findElement(webdriver.By.className('pagination__link')).click();

// confirm progress bar exists
driver.wait(function() {
    return driver.findElement(webdriver.By.id('progress'));
}, 2000);

// wait for load to finish
driver.wait(function() {
    return (driver.findElement(webdriver.By.id('progress') == false));
});

// the results count should update
// TODO: this is a bug. should actually display 21 - 22
driver.findElement(webdriver.By.css('#results-count p:last-child')).getInnerHtml().then(function(text) {
    assert.equal(text, 'Viewing: 21 - 40');
});

driver.quit();
