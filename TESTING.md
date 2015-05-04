# Selenium tests

* Running tests locally with local Selenium
    * Configure environment
        ```
        export FEC_SELENIUM_DRIVER="chrome"
        ```
* Running tests locally with Sauce
    * Configure Sauce OS, browser, version in local environment
        ```
        export FEC_SELENIUM_DRIVER="remote"
        export FEC_SAUCE_PLATFORM="Mac OS X 10.9"
        export FEC_SAUCE_DRIVER="chrome"
        export FEC_SAUCE_VERSION="39"
        ```
* Running tests on Travis
    * Secure Sauce Labs credentials
        * `gem install travis`
        * `travis encrypt SAUCE_USERNAME=<username>`
        * `travis encrypt SAUCE_ACCESS_KEY=<access key>`
        * Add encrypted keys to `.travis.yml`
    * Add OS / browser / version to Travis build matrix
        ```
        matrix:
            - FEC_SAUCE_PLATFORM="Mac OS X 10.9" FEC_SAUCE_BROWSER=chrome
            - FEC_SAUCE_BROWSER=firefox
        ```
