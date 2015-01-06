var webdriver = require('selenium-webdriver'),
    sauce = 'http://ondemand.saucelabs.com:80/wd/hub',
    chai = require('chai'),
    assert = chai.assert,
    mocks = require('../mocks/mocks.js'),
    getResultsRows,
    verifyFirstPage,
    filterToggleButton,
    driver = new webdriver.Builder()
    .usingServer(sauce)
    .withCapabilities({
        browserName: 'chrome',
        version: '',
        platform: 'OS X 10.10',
        name: 'Browse committees',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
    })
    .build();

verifyFirstPage = function() {
    // confirm record count exists and is correct
    driver.wait(function() {
        return driver.findElement(webdriver.By.xpath('//*[@id="results-count-first"]/p[1]'));
    }).then(function() {
        driver.findElement(webdriver.By.xpath('//*[@id="results-count-first"]/p[1]')).getInnerHtml().then(function(text) {
            assert.equal(text, 'Results: 234 records');
        });
    });

    // the table should have one row for each of 20 results + header row
    // webdriver.By.css doesn't return what I'd expect, so using qSA instead
    getResultsRows = function() {
        return document.querySelectorAll('table tr').length;
    };

    driver.executeScript(getResultsRows).then(function(rows) {
        assert.equal(rows, 21);
    });

    // the right data should be output
    driver.findElements(webdriver.By.css('#results tr:nth-child(4) td')).then(function(cols) {
        var fourthRow = [
            'PACIFIC LIGHTING POLITICAL ASSISTANCE COMMITTEE',
            'H. E. GOODENOW, TREASURER',
            'CA',
            'Democratic',
            'Corporation',
            'PAC - Qualified',
            'Unauthorized'
        ],
        i = 0;

        cols.forEach(function(col) {
            col.getText().then(function(text) {
                assert.equal(text, fourthRow[i]);
                i++;
            });
        });
    });
};

driver.get('http://localhost:3000?test=true');
driver.wait(function() {
    return driver.findElement(webdriver.By.className('js-initialized'));
}, 4000);

driver.executeScript(mocks.getCommittees);
driver.executeScript(mocks.getCommitteesPage1);
driver.executeScript(mocks.getCommitteesPage2);
driver.executeScript(mocks.getCommitteesHouse);

// click box under search bar that says 'committees'
driver.findElement(webdriver.By.css('.browse-links a[name=committees]')).click();

// confirm progress bar exists
driver.wait(function() {
    return driver.findElement(webdriver.By.id('progress'));
}, 4000)
    .then(function() {
        verifyFirstPage();
    });

// pagination
driver.findElement(webdriver.By.className('pagination__link')).click();

// confirm progress bar exists
driver.wait(function() {
    return driver.findElement(webdriver.By.id('progress'));
}, 4000);

// the results count should update
driver.findElement(webdriver.By.css('.results-count p:last-child')).getInnerHtml().then(function(text) {
    assert.equal(text, 'Viewing: 21 - 40');
});

// prev link should have right text
driver.findElement(webdriver.By.className('pagination__link')).getInnerHtml().then(function(text) {
    assert.equal(text, '<i class="ti-arrow-left"></i> Previous 20');
});

// click prev link
driver.findElement(webdriver.By.className('pagination__link')).click()
    .then(function() {
        verifyFirstPage();
    });

//open the type filter drop down
driver.findElement(webdriver.By.xpath('//*[@id="category-filters"]/div[4]/div')).click()
    .then(function() {
        // select House
        driver.findElement(webdriver.By.xpath('//*[@id="category-filters"]/div[4]/div/div/ul/li[2]')).click()
            .then(function() {
                // make sure active styling is applied to field
                driver.findElement(webdriver.By.xpath('//*[@id="category-filters"]/div[4]')).getAttribute('class').then(function(classes) {
                    assert.equal(classes, 'field active');

                    // make sure table updates
                    driver.findElement(webdriver.By.xpath('//*[@id="results"]/tbody/tr[1]/td[1]/a')).getInnerHtml().then(function(text) {
                        assert.equal(text, 'MCCORMACK CONGRESSIONAL COMMITTEE');
                    });

                    driver.findElement(webdriver.By.xpath('//*[@id="category-filters"]/div[4]/div/a/abbr')).click()
                        .then(function() {
                            // make sure active styling is gone
                            driver.findElement(webdriver.By.xpath('//*[@id="category-filters"]/div[4]')).getAttribute('class').then(function(classes) {
                               assert.equal(classes, 'field');
                            });
                        });
                });
            });
    });

filterToggleButton = driver.findElement(webdriver.By.className('disclosure-toggle'));

// close filters
filterToggleButton.click();

filterToggleButton.getAttribute('class').then(function(classes) {
    // make sure it changes to closed styling
    assert.equal(classes, 'disclosure-toggle disclosure-toggle--closed');

    // make sure the fields actually get hidden
    driver.findElement(webdriver.By.className('filter-field-container')).getCssValue('display').then(function(displayVal) {
        assert.equal(displayVal, 'none');
    });
    
});

// reopen filters
filterToggleButton.click();

filterToggleButton.getAttribute('class').then(function(classes) {
    // make sure it changes to open styling
    assert.equal(classes, 'disclosure-toggle');
    // make sure the fields actually get displayed
    assert.ok(function() {
        driver.wait(function() {
            return driver.findElement(webdriver.By.className('filter-field-container').isDisplayed());
        }, 1000);
    });
});

driver.quit();
