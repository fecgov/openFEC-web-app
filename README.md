openfec-web-app
===============
[![Build Status](https://travis-ci.org/18F/openFEC-web-app.svg?branch=master)](https://travis-ci.org/18F/openFEC-web-app)
[![Code Climate](https://codeclimate.com/github/18F/openFEC-web-app/badges/gpa.svg)](https://codeclimate.com/github/18F/openFEC-web-app)
[![Test Coverage](https://codeclimate.com/github/18F/openFEC-web-app/badges/coverage.svg)](https://codeclimate.com/github/18F/openFEC-web-app/coverage)

See also http://github.com/18F/openFEC.

### Installing
This application is in [Flask](http://flask.pocoo.org/). Client side features are managed using [Browserify](http://browserify.org/) and [npm](https://www.npmjs.org/).

It uses Python version 3.4. Its recommended that you create a [virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/) before installing Python dependencies.

Install Python dependencies:

    $ pip install -r requirements.txt

Install client side dependencies:

    $ npm install -g browserify
    $ npm install

If you plan to do client side JS developent, you will want to install [Watchify](https://github.com/substack/watchify):
```
$ npm install -g watchify
```

### Configuration

The Flask app talks to an API for data. See [openFEC](http://github.com/18F/openFEC).

The app has HTTP auth enabled. You will need to set environment variables with your desired username and password.
Those vars are `FEC_WEB_USERNAME` and `FEC_WEB_PASSWORD`. There are other config environment variables that you
can set, but that have defaults. You can see those in `openfecwebapp/config.py`.

### Run server
To make the site fully functional, you will need to compile the client side JS and CSS:

    $ npm run build

Then start the server:

    $ python __init__.py

If you'd like the app to cache API requests it makes, use the `--cached` flag:

    $ python __init__.py --cached

### Development
To compile client side JS once:

    $ npm run build-js

Compile Sass once:

    $ npm run build-sass

Compile JS as changes are made:

    $ npm run watch-js

Compile Sass as changes are made:

    $ npm run watch-sass

### Deployment

See directions in the 18F/openFEC repo.

### Run Tests
#### Unit Tests

    $ py.test openfecwebapp/tests

#### Browser Tests
First, install [PhantomJS](http://phantomjs.org/).

Configure development environment:

    $ unset FEC_WEB_API_KEY
    $ export FEC_WEB_API_URL=http://fec-dev-api.cf.18f.us
    $ export FEC_WEB_TEST=true

Run development app server:

    $ python __init__.py

While app is running, run tests:

    $ py.test openfecwebapp/tests --selenium

If the development API is down or for testing with feature branches of the API,
a local API server can be used:

    $ unset FEC_WEB_API_URL

#### Git Hooks

This repo includes optional post-merge and post-checkout hooks to ensure that
dependencies and compiled assets are up to date. If enabled, these hooks will
update Python and Node dependencies, and rebuild compiled JS and CSS files,
on checking out or merging changes to `requirements.txt`, `package.json`,
or source JS or SCSS files. To enable the hooks, run

    $ invoke add_hooks

To disable, run

    $ invoke remove_hooks
