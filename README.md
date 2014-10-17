openfec-web-app
===============

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

It will serve the site on http://0.0.0.0:8000
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
