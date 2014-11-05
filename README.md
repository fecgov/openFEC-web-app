openfec-web-app
===============

See also http://github.com/18F/openFEC.

### Installing
This application is a [Node.js](http://nodejs.org/)/[Express](http://expressjs.com/) app. Dependencies are installed via [npm](https://www.npmjs.org/). Make sure to have npm installed.

Install application dependencies:
```
$ npm install
```

If you plan to do CSS development, you will want to install [Sass](http://sass-lang.com/). 

If you plan to do client side JS developent, you will want to install [Browserify](http://browserify.org):
```
$ npm install -g browserify watchify
```

### Run server
```
$ nodejs app.js
```

It will serve the site on http://127.0.0.1:3000
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

#### Running UI tests
Create a [Sauce Labs](https://saucelabs.com) account and source ```SAUCE_USERNAME``` and ```SAUCE_ACCESS_KEY``` into your environment. I just put mine in ```.bash_profile```.

```
$ npm install -g mocha grunt grunt-cli
$ git clone https://github.com/saucelabs/grunt-init-sauce.git ~/.grunt-init/sauce
```
