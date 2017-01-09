**Develop**
[![Build Status](https://img.shields.io/travis/18F/openFEC-web-app/develop.svg)](https://travis-ci.org/18F/openFEC-web-app)
[![Test Coverage](https://img.shields.io/codecov/c/github/18F/openFEC-web-app/develop.svg)](https://codecov.io/github/18F/openFEC-web-app)

**Master**
[![Build Status](https://img.shields.io/travis/18F/openFEC-web-app/master.svg)](https://travis-ci.org/18F/openFEC-web-app)
[![Test Coverage](https://img.shields.io/codecov/c/github/18F/openFEC-web-app/master.svg)](https://codecov.io/github/18F/openFEC-web-app)
[![Code Climate](https://img.shields.io/codeclimate/github/18F/openFEC-web-app.svg)](https://codeclimate.com/github/18F/openFEC-web-app)
[![Dependencies](https://img.shields.io/gemnasium/18F/openFEC-web-app.svg)](https://gemnasium.com/18F/openFEC-web-app)

## Campaign finance for everyone

The Federal Election Commission (FEC) releases information to the public about money that’s raised and spent in federal elections — that’s elections for US President, Senate, and House of Representatives.

Are you interested in seeing how much money a candidate raised? Or spent? How much debt they took on? Who contributed to their campaign? The FEC is the authoritative source for that information.

betaFEC is a collaboration between [18F](http://18f.gsa.gov) and the FEC. It aims to make campaign finance information more accessible (and understandable) to all users.

## FEC repositories
We welcome you to explore, make suggestions, and contribute to our code.

This repository, [openFEC-web-app](https://github.com/18f/openfec-web-app), houses the betaFEC web app for exploring campaign finance data.

### All repositories
- [FEC](https://github.com/18F/fec): a general discussion forum. We [compile feedback](https://github.com/18F/fec/issues) from betaFEC’s feedback widget here, and this is the best place to submit general feedback.
- [openFEC](https://github.com/18F/openfec): betaFEC’s API
- [openFEC-web-app](https://github.com/18f/openfec-web-app): the betaFEC web app for exploring campaign finance data
- [fec-style](https://github.com/18F/fec-style): shared styles and user interface components
- [fec-cms](https://github.com/18F/fec-cms): the content management system (CMS) for betaFEC

## Get involved
We’re thrilled you want to get involved!
- Read our [contributing guidelines](https://github.com/18F/openfec/blob/master/CONTRIBUTING.md). Then, [file an issue](https://github.com/18F/fec/issues) or submit a pull request.
- [Send us an email](mailto:betafeedback@fec.gov).
- If you’re a developer, follow the installation instructions in the README.md page of each repository to run the apps on your computer.
- Check out our StoriesonBoard [FEC story map](https://18f.storiesonboard.com/m/fec) to get a sense of the user needs we'll be addressing in the future.

## Set up

### Installation
This application is in [Flask](http://flask.pocoo.org/). Client side features are managed using [Browserify](http://browserify.org/) and [npm](https://www.npmjs.org/).

It uses Python version 3.4. It's recommended that you create a [virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/) before installing Python dependencies. Don't put your virtualenv in this directory.

Install Python dependencies:

    pip install -r requirements.txt

Dependencies for test:

    pip install -r requirements.test.txt

Install client side dependencies:

    npm install

### Configuration

The Flask app talks to an API for data. See [openFEC](http://github.com/18F/openFEC).

### Run server
To make the site fully functional, you will need to compile the client side JS and CSS:

    npm run build

Then start the server:

    FEC_WEB_API_URL='http://fec-dev-api.18f.gov' python manage.py runserver

To view the site, visit [http://localhost:3000/](http://localhost:3000/).

To run the server and configure it to use a local instance of the OpenFEC API:

    python manage.py runserver

To run the server in debug mode set:

    export FEC_WEB_DEBUG=true

### Watch for changes
To watch for changes to .js and .scss:

    npm run watch

### Developing with fec-style (optional)
If you're developing with a local instance of [fec-style](https://github.com/18F/fec-style) and want to pull in styles and script changes as you go, use `npm link` to create a symbolic link to your local fec-style repo:

    cd ~/fec-style
    npm link
    cd ~/openFEC-web-app
    npm link fec-style

After linking fec-style, `npm run watch` will rebuild on changes to your local copy of fec-style's .scss and .js files.

### Developing with fec-cms (optional)
To be able to have links between this app and a local installation of [fec-cms](https://github.com/18F/fec-cms):

    export FEC_CMS_URL=http://localhost:8000

### Developing with openFEC, the API (optional)
To be able to have links between this app and a local installation of [openFEC](https://github.com/18F/openFEC):

    export FEC_API_URL=http://localhost:5000

### Features

[config.py](https://github.com/18F/openFEC-web-app/blob/develop/openfecwebapp/config.py)
includes a set of `features` which can be enabled using environment variables or
in the config directly.

    $ FEC_FEATURE_LEGAL=1 python manage.py runserver


### Development
To compile client side JS once:

    npm run build-js

Compile Sass once:

    npm run build-sass

Compile JS as changes are made:

    npm run watch-js

Compile Sass as changes are made:

    npm run watch-sass

### Deployment

*Likely only useful for 18F team members*

Before deploying, install the [Cloud Foundry CLI](https://docs.cloudfoundry.org/devguide/cf-cli/install-go-cli.html) and the [autopilot plugin](https://github.com/concourse/autopilot):

```
cf install-plugin autopilot -r CF-Community
```

To deploy to Cloud Foundry, run `invoke deploy`. The `deploy` task will attempt to detect the appropriate
Cloud Foundry space based the current branch; to override, pass the optional `--space` flag:

```
invoke deploy --space dev
```

The `deploy` task will use the `FEC_CF_USERNAME` and `FEC_CF_PASSWORD` environment variables to log in.
If these variables are not provided, your existing authorization will be used.
You can use `cf login` to login manually.

Credentials for Cloud Foundry applications are managed using user-provided services labeled as
"fec-creds-prod", "fec-creds-stage", and "fec-creds-dev". Services are used to share credentials between the API and the webapp. To set up a service:

```
cf target -s dev
cf cups fec-creds-dev -p '{"SQLA_CONN": "..."}'
```

To stand up a user-provided credential service that supports both the API and the webapp, ensure that
the following keys are set:

* SQLA_CONN
* FEC_WEB_API_KEY
* FEC_WEB_API_KEY_PUBLIC
* FEC_GITHUB_TOKEN
* SENTRY_DSN
* SENTRY_PUBLIC_DSN
* NEW_RELIC_LICENSE_KEY

Deploys of a single app can be performed manually by targeting the env/space, and specifying the corresponding manifest, as well as the app you want, like so:

```
cf target -s [feature|dev|stage|prod] && cf push -f manifest_<[feature|dev|stage|prod]>.yml [api|web]
```

**NOTE:**  Performing a deploy in this manner will result in a brief period of downtime.

#### Caching

To avoid repeated requests to the OpenFEC API, the webapp can store recent API responses
in a small in-memory cache. The cache can be enabled by setting the `FEC_WEB_CACHE`
environment variable; the size of the cache, in items, is controlled by the
`FEC_WEB_CACHE_SIZE` environment variable. When the cache is enabled, views may
be stale for up to the cache duration set by the API.


#### Release

See the [release checklist](https://github.com/18F/FEC/wiki/release-checklist) for details on how to release a new version of betaFEC.


### Run Tests

#### Python Unit Tests

    py.test

#### JavaScript Unit Tests

    npm test

#### Git Hooks

This repo includes optional post-merge and post-checkout hooks to ensure that
dependencies and compiled assets are up to date. If enabled, these hooks will
update Python and Node dependencies, and rebuild compiled JS and CSS files,
on checking out or merging changes to `requirements.txt`, `package.json`,
or source JS or SCSS files. To enable the hooks, run

    invoke add_hooks

To disable, run

    invoke remove_hooks


## Copyright and licensing
This project is in the public domain within the United States, and we waive worldwide copyright and related rights through [CC0 universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/). Read more on our license page.

A few restrictions limit the way you can use FEC data. For example, you can’t use contributor lists for commercial purposes or to solicit donations. Learn more on FEC.gov.
