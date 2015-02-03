openfec-web-app
===============
[![Build Status](https://travis-ci.org/18F/openFEC-web-app.svg?branch=master)](https://travis-ci.org/18F/openFEC-web-app)

See also http://github.com/18F/openFEC.

### Installing
This application is in [Flask](http://flask.pocoo.org/). Client side features are managed using [Browserify](http://browserify.org/) and [npm](https://www.npmjs.org/).

It uses Python version 3.4. Its recommended that you create a [virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/) before installing Python dependencies.

Install Python dependencies:
```
$ pip install -r requirements.txt
```

Install client side dependencies:
```
$ npm install -g browserify
$ npm install
```

If you plan to do CSS development, you will want to install [Sass](http://sass-lang.com/). 

If you plan to do client side JS developent, you will want to install [Watchify](https://github.com/substack/watchify):
```
$ npm install -g watchify
```

### Configuration

The Flask app talks to an API for data. See [openFEC](http://github.com/18F/openFEC).

Copy `openfecwebapp/example_config.py` to `openfecwebapp/local_config.py` and change as needed.

### Run server
To make the site fully functional, you will need to compile the client side JS:

```
$ npm run build
```

Then start the server:

```
$ python __init__.py
```

### Development
To compile client side JS changes once:
```
$ npm run build
```

To compile whenever changes are made to the client side JS:
```
$ npm run watch
```

Compile Sass once:
```
$ npm run sass-build
```

Compile Sass as changes are made:
```
$ npm run sass-watch
```

Or, if you want to get crazy, watch both Sass and JS changes: (hat tip [@ascott1](http://github.com/ascott1))
```
$ npm run watch-all
```

### Run Tests
#### Unit Tests
```
$ nosetests openfecwebapp/tests
```
