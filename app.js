var express = require('express'),
    handlebars = require('express-handlebars');

var app = express();

var tmpls = handlebars.create();

app.engine('handlebars', tmpls.engine);
app.set('view engine', 'handlebars');

app.get('/', function(req, res, next) {
    res.render('main');
});

app.listen(8000, "0.0.0.0");
